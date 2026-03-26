/// <reference types="cypress" />

/**
 * Custom Cypress commands for RAGForge E2E tests.
 *
 * Clerk authentication is bypassed via a test cookie set through
 * `cy.session()`. For CI, configure CYPRESS_CLERK_TESTING_TOKEN
 * in your environment variables, or use Clerk Testing Tokens:
 * https://clerk.com/docs/testing/cypress
 */

/**
 * Bypass Clerk auth and visit the dashboard.
 * Uses Clerk's testing-token approach when CYPRESS_CLERK_TESTING_TOKEN is set,
 * otherwise falls back to directly visiting the dashboard (requires Clerk
 * middleware to allow unauthenticated access in test mode).
 */
Cypress.Commands.add("visitDashboard", () => {
  const clerkToken = Cypress.env("CLERK_TESTING_TOKEN");
  if (clerkToken) {
    cy.visit("/dashboard", {
      headers: { Authorization: `Bearer ${clerkToken}` },
    });
  } else {
    cy.visit("/dashboard");
  }
});

declare global {
  namespace Cypress {
    interface Chainable {
      visitDashboard(): Chainable<void>;
    }
  }
}
