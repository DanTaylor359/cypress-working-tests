const crypto = require("crypto");
// const db = require("../../dbConfig");
const pgp = require('pg-promise')();

const dbConfig = {
    host: 'anrk-ew2foxuat-bastion.foxcard.io',
    port: 5432,
    database: 'foxcarddb',
    user: 'ledger_server_service',
    password: 'NKuin4hWHmOO3IyCsNlcOtLiq1dNZP'
};
const db = pgp(dbConfig);

function generateSignature (payload, secret) {
    if (payload.constructor === Object) {
        payload = JSON.stringify(payload);
    }

    if (payload.constructor !== Buffer) {
        payload = Buffer.from(payload, 'utf8');
    }

    const signature = crypto.createHash('sha256');
    signature.update(payload);
    signature.update(new Buffer.from(secret, 'utf8'));

    return signature.digest('hex');
}

async function sendVerificationRequest (email, kyc_last_name) {
    console.log('User email:', email);
    const userId = await getUserId(email);
    const sessionId = await getSessionId(email);
    const payload = {
        "status": "success",
        "verification": {
            "code": 9001,
            "vendorData": "automation_" + userId,
            "id": sessionId,
            "reason": "blah blah",
            "reasonCode": "10",
            "person": {
                "firstName": "Andrei",
                "lastName": kyc_last_name,
                "citizenship": null,
                "idNumber": null,
                "gender": null,
                "dateOfBirth": "1985-01-01",
                "yearOfBirth": null,
                "placeOfBirth": null,
                "nationality": "GB",
                "pepSanctionMatch": null
            }
        },
        "technicalData": {
            "ip": "3.250.90.33"
        }
    }
    const headers = {
        'Content-Type': 'application/json',
        'x-auth-client': 'd4f50a8a-886c-499b-ada4-a3fbe01c1355',
        'x-signature': generateSignature(payload, "530201f6-bdfb-41bc-931e-b0c4224cefae")
    };
    console.log('x-signature:', headers['x-signature']);
    //console.log('payload:', JSON.stringify(payload));
    //console.log('vendorData:', payload.verification.vendorData);
    //console.log('id:', payload.verification.id);
    try {
        const response = await fetch('https://ew2foxuat-api-ext.foxcard.io/hooks/user/kycDecisionUpdate', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Response:', data);
            return "Success: "+data.success
        } else {
            console.error('Error:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }

}

async function getUserId(email) {
    try {
        const queryUserId = await db.any('SELECT id FROM public.user_onboarding WHERE email = $1', [email]);

        console.log('User id:', queryUserId[0].id);
        return queryUserId[0].id;

    } catch (err) {
        console.error('Error occurred:', err);
    }
}

async function getRequestId(email) {
    try {
        const queryRequestId = await db.any('SELECT kyc_request_id FROM public.user WHERE username = $1', [email]);

        console.log('Request id:', queryRequestId[0].kyc_request_id);
        return queryRequestId[0].kyc_request_id;

    } catch (err) {
        console.error('Error occurred:', err);
    }
}

async function getSessionId(email) {
    try {
        const querySetVerificationStatus = await db.any('UPDATE public.user_onboarding SET verification_state = 1 WHERE email = $1', [email]);
        const querySessionId = await db.any('SELECT session_id FROM kyc_request WHERE id = (SELECT kyc_request_id FROM public.user_onboarding WHERE email = $1)', [email]);

        console.log('Session id:', querySessionId[0].session_id);
        return querySessionId[0].session_id;

    } catch (err) {
        console.error('Error occurred:', err);
    }
}

async function getCryptoWalletAddress(email) {
    const label = email+`'s ETH wallet`
    console.log(label);
    try {
        const queryWalletAddress = await db.any('SELECT address FROM bitgo_wallet_addresses WHERE label = $1', [label]);

        //console.log('ETH wallet:', queryWalletAddress[0].address);
        return queryWalletAddress[0].address;

    } catch (err) {
        console.error('Error occurred:', err);
    }
}

async function topUpUserWallet (email, amount) {
    const transactionId = await createTransaction(email, 'system load', amount);
    console.log('Transaction Id: '+transactionId)
    const result = await processTransaction(transactionId,'approve');
    if (result === 'Transaction Approved') {
        return result;
    } else  {
        console.error('Error occurred while trying to top up wallet');
        return'Error';
    }

}

async function createTransaction (email, funding_type, amount) {
    const userId = await getUserId(email);
    const walletAddress = await getCryptoWalletAddress(email);
    const payload = {
        "user_id": userId,
        "funding_type": funding_type,
        "amount": amount,
        "wallet_address": walletAddress+".eth"
    };
    console.log(payload);
    const headers = {
        'Content-Type': 'application/json',
    };
    try {
        const Url = 'https://ew2foxuat-ap-ext.foxcard.io/admin/api/v1/transactions/create';
        const response = await fetch(Url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Response:', data);
            return data.ledger_id;
        } else {
            console.error('Error:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

async function processTransaction (transactionId, action) {
    const payload = {
        "operatorName": "QA Automation",
        "operatorEmail": "qa_automation@baanx.com"
    };
    const headers = {
        'Content-Type': 'application/json',
    };
    try {
        const Url = 'https://ew2foxuat-ap-ext.foxcard.io/admin/api/v1/transactions/'+transactionId+'/'+action
        const response = await fetch(Url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Response:', data);
            return data.message;
        } else {
            console.error('Error:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }

}

async function activateCard (cardId) {

    const API_KEY = 'cfDbLLu/4NtNyTLFo0oLqq7bl1eMwWsUl+oT2INBT3QP4N593pEBZgHIkXCXc7RR';

    const url = 'https://api-v3.sandbox.monavate.com/programs/baanx_prepaid_gbp/cards/'+cardId+'/activate';

    const payload = {
        comment: "Automation test card activation"
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-KEY': API_KEY
            },
            body: JSON.stringify(payload)
        });


        if (!res.ok) {
            console.error(`Request error: ${res.status} ${res.statusText}`);
            const errBody = await res.text();
            console.error('Err body:', errBody);
            return'Error';
        }
        return'Card activation: Success!';
    } catch (err) {
        console.error('Network error occured:', err);
    }
}

async function setPin (cardId, pin) {

    const API_KEY = 'cfDbLLu/4NtNyTLFo0oLqq7bl1eMwWsUl+oT2INBT3QP4N593pEBZgHIkXCXc7RR';

    const url = 'https://api-v3.sandbox.monavate.com/programs/baanx_prepaid_gbp/cards/'+cardId+'/setpin';
    console.log(cardId, pin)

    const payload = {
        pin: pin,
        existingPin: '',
        securityCode: '',
        activate: false
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-KEY': API_KEY
            },
            body: JSON.stringify(payload)
        });


        if (!res.ok) {
            console.error(`Request error: ${res.status} ${res.statusText}`);
            const errBody = await res.text();
            console.error('Err body:', errBody);
            return'Error';
        }
        return'Set PIN: Success!';
    } catch (err) {
        console.error('Network error occured:', err);
    }
}

//console.log(sendVerificationRequest ('andrei.sukhorukov+37372@baanx.com', 'Sukharukau bkuqc'));
// console.log(getUsdtWallet ('andrei.sukhorukov+59757@baanx.com'));
//console.log(topUpUserWallet ('andrei.sukhorukov+59757@baanx.com', 0.01));
//console.log(processTransaction('7690120d-74c0-41d2-af07-13b64a92a3f0', 'approve'))
//console.log(setPin('4146295454492086376', '1234'))
module.exports = { sendVerificationRequest, topUpUserWallet, setPin , activateCard };