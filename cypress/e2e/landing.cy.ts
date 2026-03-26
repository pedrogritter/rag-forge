describe("Landing Page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("renders hero section with brand name and CTAs", () => {
    cy.contains("RAG Forge").should("be.visible");
    cy.contains("Get Started").should("be.visible");
    cy.contains("GitHub").should("be.visible");
  });

  it("renders navigation header with anchor links", () => {
    cy.get("header").should("be.visible");
    cy.get('header a[href="#features"]').should("exist");
  });

  it("renders feature cards section", () => {
    cy.get("#features").scrollIntoView();
    cy.get("#features").should("be.visible");
  });

  it("renders git clone snippet in CTA section", () => {
    cy.contains("git clone").should("exist");
  });
});
