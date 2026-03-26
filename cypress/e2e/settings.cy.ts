describe("Settings Page", () => {
  beforeEach(() => {
    cy.visit("/dashboard/settings");
  });

  it("renders the settings page with theme section", () => {
    cy.contains("Color Preset").should("be.visible");
  });

  it("shows color preset options", () => {
    // There are 7 color presets
    cy.contains("Color Preset")
      .parent()
      .parent()
      .find("button")
      .should("have.length.at.least", 7);
  });

  it("shows font family options", () => {
    cy.contains("Font Family").should("be.visible");
    cy.contains("Geist Sans").should("be.visible");
  });

  it("shows brand name input", () => {
    cy.contains("Brand Name").should("be.visible");
    cy.get('input[type="text"]').should("exist");
  });

  it("can change the brand name", () => {
    cy.get('input[type="text"]').first().clear().type("My Custom Brand");
    cy.get('input[type="text"]')
      .first()
      .should("have.value", "My Custom Brand");
  });

  it("shows system prompt textarea", () => {
    cy.contains("System Prompt").should("be.visible");
    cy.get("textarea").should("exist");
  });

  it("shows temperature slider", () => {
    cy.contains("Temperature").should("be.visible");
  });

  it("shows reset button", () => {
    cy.contains("Reset").should("be.visible");
  });
});
