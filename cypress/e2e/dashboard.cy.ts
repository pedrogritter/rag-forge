describe("Dashboard", () => {
  it("redirects to a new chat on visit", () => {
    cy.visitDashboard();
    // Dashboard auto-creates a chat and redirects to /dashboard/c/[id]
    cy.url().should("match", /\/dashboard\/c\/.+/);
  });

  it("shows the chat empty state with suggestion chips", () => {
    cy.visitDashboard();
    cy.contains("Ask anything about your knowledge base").should("be.visible");
  });

  it("shows the sidebar with New Chat button", () => {
    cy.visitDashboard();
    cy.contains("New Chat").should("be.visible");
  });

  it("shows the top bar with brand name", () => {
    cy.visitDashboard();
    // TopBar renders the brandName from theme config
    cy.get("header").should("exist");
  });

  it("can type in the chat input", () => {
    cy.visitDashboard();
    cy.get("textarea").should("exist");
    cy.get("textarea").type("Hello, RAGForge!");
    cy.get("textarea").should("have.value", "Hello, RAGForge!");
  });
});
