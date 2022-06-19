import {globalSetup, globalTeardown} from "../config/globalServer";
import axios from 'axios';

describe("requests", () => {
    beforeAll(() => {
        return globalSetup();
    });

    afterAll(() => {
        return globalTeardown();
    });

    it("assert server online", async () => {
        return axios.get("http://localhost:3000")
            .then(response => {
                expect(response.status).toBe(200);
            });
    });

    it("assert /api/ocr endpoint rejects GET request with 405", async () => {
        return axios.get("http://localhost:3000/api/ocr")
            .then(response => {
                fail('Expected status code 405. Got: ', response.status);
            })
            .catch(err => {
                expect(err.response.status).toBe(405);
            });
    });


    it("assert /api/ocr endpoint rejects invalid endpoint with 404.", async () => {
        return axios.post("http://localhost:3000/api/whatever")
            .then(response => {
                fail('Expected status code 404. Got: ', response.status);
            })
            .catch(err => {
                expect(err.response.status).toBe(404);
            });
    });


    it("assert /api/ocr endpoint rejects requests without API key with 401", async () => {
        return axios.post("http://localhost:3000/api/ocr")
            .then(response => {
                fail('Expected status code 401. Got: ', response.status);
            })
            .catch(err => {
                expect(err.response.status).toBe(401);
            });
    });


    it("assert /api/ocr endpoint rejects requests with invalid API key with 401", async () => {
        return axios.post("http://localhost:3000/api/ocr?api_key=123")
            .then(response => {
                fail('Expected status code 401. Got: ', response.status);
            })
            .catch(err => {
                expect(err.response.status).toBe(401);
            });
    });

    it("assert /api/ocr endpoint rejects requests without correct media type with 415", async () => {
        // api key 12321 is opened specifically for testing only
        return axios.post("http://localhost:3000/api/ocr?api_key=12321")
            .then(response => {
                fail('Expected status code 415. Got: ', response.status);
            })
            .catch(err => {
                expect(err.response.status).toBe(415);
            });
    });

    // NOTE: file uploading should be covered via e2e testing
})