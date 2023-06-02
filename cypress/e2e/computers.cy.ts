describe('Computers', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/computers');
    cy.get('[data-testid="computer-item"]').each((element) => {
      cy.wait(1500);
    });

    cy.get('[data-testid="computer-item"] [data-testid="action_buttons"] button[id="pinging"]').should('not.exist');
  });

  it('deletes the last element in a grid', () => {
    let lastElementText;
  
    cy.get('[data-testid="computer-item"]').last().within(() => {
      cy.get('[name="remove"]').invoke('text').then(text => {
        lastElementText = text.trim();
        cy.get('[name="remove"]').click();
      });
    });
  
    cy.wait(2000);

    cy.contains('[data-testid="computer-item"]', lastElementText).should('not.exist');
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
      const delay = 2500; 
      cy.wait(delay);

      cy.wrap($computer).should('contain', 'RDP');

      cy.wrap($computer).should(($computer) => {
        const text = $computer.text();
        expect(text.includes('Online') || text.includes('Offline')).to.be.true;
      });

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
