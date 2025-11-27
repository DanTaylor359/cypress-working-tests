// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// Sign in without OTP or TOPT
Cypress.Commands.add('signInWithoutOtpTotp', () => {
  cy.fixture('all-users.json').then(users => {
    const user = users[0];
    cy.visit(`https://${user.envUrl}/account/login`);
    cy.get('input[id="email"]').type(user.email);
    cy.get('input[id="password"]').type(user.password);
    cy.contains('button', 'Log in').click();
    cy.contains('Overview', { timeout: 4000 }).should('be.visible');  
  });
});

// -- Might use, might delete TBC --
//Cypress.Commands.add('mockWallet', (options = {}) => {
//  const {
//    account = '0xb167A759F503FCCe0E37708f987d6eA1446C7e94',  //default account - Linea ETH account 0.27usd
//    //chainId = '0x1' // Ethereum Mainnet
//  } = options;
//
//  cy.window().then(win => {
//    win.ethereum = {
//      isMetaMask: true,
//      request: ({ method, params }) => {
//        switch (method) {
//          case 'eth_requestAccounts':
//            return Promise.resolve([account]); // fake connected address
//          case 'eth_accounts':
//            return Promise.resolve([account]); // same as above if app checks existing accounts
//          //case 'eth_chainId':
//            //return Promise.resolve(chainId); // hex chain id string
//          case 'wallet_switchEthereumChain':
//            // optionally update the chain id to the requested one
//            const requested = params?.[0]?.chainId;
//            if (requested) {
//              return Promise.resolve(); // simulate success
//            }
//            return Promise.reject(new Error('Missing chainId'));
//          default:
//            // Default no-op success for methods your app may call
//            return Promise.resolve();
//          }
//      }
//    };
//  });
//});

Cypress.Commands.add('pickNetwork', (network) => {
  // Check modal is present
  cy.contains('Pick a network');

  // Assert the chosen network option is visible and has correct text
  cy.get('.delegationModal__networkSelector__option_label')
    .contains(network)
    .should('be.visible')
    .and('have.text', network)
    .click(); // actually select it

  // Ensure the Continue button is visible
  cy.contains('button', /^Continue$/)
    .should('be.visible')
    .click(); // proceed after selection
});

// Add a message to the report confirming the test has passed
Cypress.Commands.add('confirmTestPassed', (message) => {
  cy.log(`✅ TEST PASSED: ${message}`);
  expect(true, `✅ TEST PASSED: ${message}`).to.be.true;
});

// Assert that a tab with the exact label is selected
Cypress.Commands.add('assertExactTabSelected', (label) => {
  cy.get('button').then(($buttons) => {
    const match = [...$buttons].find(
      (el) => el.innerText.trim() === label
    );

    expect(match, `❌ Tab "${label}" not found`).to.exist;
    cy.wrap(match)
      .should('be.visible')
      .and('have.attr', 'aria-selected', 'true')
      .then(() => {
        cy.log(`✅ TEST PASSED: Tab "${label}" is visible and selected`);
      });
  });
});

//// Add a fallback screenshot on test failure
//Cypress.Commands.add('enableScreenshotOnTestFailure', () => {
//  Cypress.on('fail', (error, runnable) => {
//    cy.screenshot('overview-tab-failed');
//    throw error; // rethrow to ensure test fails
//  });
//});

// Add a fallback screenshot on test failure
Cypress.Commands.add('enableScreenshotOnTestFailure', () => {
  cy.once('fail', (error, runnable) => {
    cy.screenshot('overview-tab-failed');   // ✅ queued properly
    throw error; // rethrow so the test still fails
  });
});

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })