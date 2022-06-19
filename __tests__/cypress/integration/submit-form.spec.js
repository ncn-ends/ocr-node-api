/// <reference types="Cypress" />

describe('Form submissions', () => {

    // TODO: change the wait methods to regular calls. requires reformatting assertions.
    // load front page and asset that it has loaded
    beforeEach(() => {
        cy.visit('/');
        cy.contains("h1", "ncn-ends Tesseract API Demo").should("be.visible");
    });

    it('Working form submission', () => {
        // fill out form and submit
        cy.get("#api_key_input").type('12321');
        cy.get("[type='file'").attachFile('sampletext1.png');
        cy.get("[name='ocr_img_upload_form'").submit();

        // assert that response is not errored after waiting for it to load
        cy.wait(2000);
        cy.get("#response_text").invoke("text").then((text) => {
            expect(text).not.contains("Error");
            expect(text).contains("text: ");
        })
    });

    it('Form submission without api key', () => {
        // fill out form and submit but leave out api key
        cy.get("[type='file'").attachFile('sampletext1.png');
        cy.get("[name='ocr_img_upload_form'").submit();

        // wait for response to load, then get a generic error
        cy.wait(2000);
        cy.get("#response_text").invoke("text").then((text) => {
            expect(text).contains("Error");
        })
    });


    it('Form submission with invalid api key', () => {
        // fill out form and submit but input a random api key
        cy.get("#api_key_input").type('the horn of helm hammerhand shall sound in the deep one last time');
        cy.get("[type='file'").attachFile('sampletext1.png');
        cy.get("[name='ocr_img_upload_form'").submit();

        // wait for response to load, then get a generic error
        cy.wait(2000);
        cy.get("#response_text").invoke("text").then((text) => {
            expect(text).contains("Error");
        })
    });


    it('Form submission without image', () => {
        // fill out form and submit but without the attached image
        cy.get("#api_key_input").type('12321');
        cy.get("[name='ocr_img_upload_form'").submit();

        // wait for response to load, then get a generic error
        cy.wait(2000);
        cy.get("#response_text").invoke("text").then((text) => {
            expect(text).contains("Error");
        })
    });
})