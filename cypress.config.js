// cypress.config.js
const { defineConfig } = require("cypress");
const gmailTester = require("gmail-tester");
const path = require("path");
// const pgp = require('pg-promise');
// const { db } = require('./dbConfig');
const { sendVerificationRequest, topUpUserWallet, setPin, activateCard } = require('./user_functions');



module.exports = defineConfig({

  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'results/report-[hash].xml',
  },
  retries: 0,
  responseTimeout: 60000,
  e2e: {
    chromeWebSecurity: false,

    //experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      on("task", {
        "gmail:get-messages": async (args) => {
          const messages = await gmailTester.get_messages(
              path.resolve(__dirname, "credentials.json"),
              path.resolve(__dirname, "token.json"),
              args.options
          );
          return messages;
        },
      });
      on("task", {
        generateOTP: require("cypress-otp")
      });
      on('task', {
        async verifyUser({ email, kyc_last_name }) {
          try {
            const result = await sendVerificationRequest(email, kyc_last_name);
            return result;
          } catch (error) {
            throw new Error(error);
          }
        }
      });
      on('task', {
        async topUpUserWallet({ email, amount }) {
          try {
            const result = await topUpUserWallet(email, amount);
            return result;
          } catch (error) {
            throw new Error(error);
          }
        }
      });
      on('task', {
        async setPin({ cardId, pin }) {
          try {
            const result = await setPin(cardId, pin);
            return result;
          } catch (error) {
            throw new Error(error);
          }
        }
      });
      on('task', {
        async activateCard({ cardId }) {
          try {
            const result = await activateCard(cardId);
            return result;
          } catch (error) {
            throw new Error(error);
          }
        }
      });
    },
  },
});