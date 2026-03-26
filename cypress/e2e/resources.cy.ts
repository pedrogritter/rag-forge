describe("Resources Page", () => {
  beforeEach(() => {
    cy.visit("/dashboard/resources");
  });

  it("renders the resources page heading", () => {
    cy.contains("Knowledge Base").should("be.visible");
  });

  it("shows a table or list of resources", () => {
    // Resources page has a table for indexed documents
    // If empty, it shows an empty state message
    cy.get("body").then(($body) => {
      if ($body.find("table").length > 0) {
        cy.get("table").should("be.visible");
      } else {
        // Empty state
        cy.contains(/no (resources|documents)/i).should("be.visible");
      }
    });
  });
});
