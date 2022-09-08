describe('Basic', () => {
    it('navigates and clicks on various button', () => {
        cy.visit('/');
        cy.wait(2000);

        // Click on <button> #editor-toolbar-btn
        // cy.get('#editor-toolbar-btn').click();

        // Click on <button> #editor-btn-build
        // cy.get('#editor-btn-build').click();

        // Click on <button> #editor-toolbar-btn
        // cy.get('#editor-toolbar-btn').click();

        // Click on <button> "run"
        // cy.get('.menu-btn:nth-child(1)').click();
    });
});
