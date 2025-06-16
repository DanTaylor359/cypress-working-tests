FROM cypress/browsers:latest

WORKDIR /ledger

COPY ./credentials.json .
COPY ./token.json .
COPY ./spec.cy.js .
COPY ./package.json .
COPY ./cypress.config.js .
COPY ./cypress ./cypress
COPY ./user_functions.js .

RUN npm install

ENTRYPOINT ["npx", "cypress", "run", "-b", "chrome"]