describe('Computers', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/computers');
    cy.get('[data-testid="computer-item"]').each((element) => {
      cy.wait(1500);
    });

    cy.get('[data-testid="computer-item"] [data-testid="action_buttons"] button[id="pinging"]').should('not.exist');
  });

  it('deletes the last element in a grid', () => {
    cy.get('[data-testid="computer-item"]').last().within(() => {
      cy.get('[name="remove"]').click();
    });
  });

  it('clicks on the edit button, changes the name, and checks if the name was changed - last element in a grid', () => {
    cy.get('[data-testid="computer-item"]').last().within(() => {
      cy.get('[name="edit"]').click();
      cy.get('[name="name_input"]').clear().type("#E Computer");
      cy.get('[name="save"]').click();
      cy.wait(1000);
      cy.get('#name').invoke('text').should('contain', '#E Computer');
    });
  });


  it('should display RDP and Online/Offline statuses correctly', () => {
    cy.get('[data-testid="computer-item"]').each(($computer) => {
      const delay = 2500; // Delay in milliseconds
      cy.wait(delay);

      // Check if RDP status is displayed
      cy.wrap($computer).should('contain', 'RDP');

      // Check if either "Online" or "Offline" status is displayed
      cy.wrap($computer).should(($computer) => {
        const text = $computer.text();
        expect(text.includes('Online') || text.includes('Offline')).to.be.true;
      });

      // Check if only offline computers have the Bell Button
      cy.wrap($computer).then(($computer) => {
        const offline = $computer.text().includes('Offline');

        if (offline) {
          cy.wrap($computer).find('[data-testid="action_buttons"] [name="wake"]').should('exist');
        } else {
          cy.wrap($computer).find('[data-testid="action_buttons"] [name="wake"]').should('not.exist');
        }
      });
    });
  });
});
