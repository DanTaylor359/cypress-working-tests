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

// Add a fallback screenshot on test failure
Cypress.Commands.add('enableScreenshotOnTestFailure', () => {
  Cypress.on('fail', (error, runnable) => {
    cy.screenshot('overview-tab-failed');
    throw error; // rethrow to ensure test fails
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