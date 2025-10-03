const request = require("supertest");

describe("Mobile Tracking API (/api/hello)", () => {
    it("should return 400 for invalid mobile number", async () => {
        jest.setTimeout(20000);
        const response = await request("http://localhost:3000").get("/api/hello?mobile=123");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message");
    }, 50000);

    // TODO: Add back this test when we mock or bypass bot_token verification
    // it("should return success for a valid mobile number", async () => {
    //     const response = await request("http://localhost:3000").get("/api/hello?mobile=8234567890");
    //     expect(response.status).toBe(200);
    //     expect(response.body).toHaveProperty("success", true);
    //     expect(response.body).toHaveProperty("message", "SMS sent successfully.");
    // }, 50000);

    it("should return 400 if an error occurs", async () => {
        const response = await request("http://localhost:3000").get("/api/hello");
        expect(response.status).toBe(400);
    }, 50000);
});

describe("Mobile Protection API (/api/mobile-protection)", () => {
    it("should return 400 for missing fields", async () => {
        const response = await request("http://localhost:3000").post("/api/mobile-protection").send({});
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message");
    });

    it("should return 400 for invalid mobile number", async () => {
        const response = await request("http://localhost:3000").post("/api/mobile-protection").send({
            mobileNumber: "123",
            message: "Test message"
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message");
    });

    // Success test: Only works if DB and email are set up
    // it("should return 200 for valid protection request", async () => {
    //     const response = await request("http://localhost:3000").post("/api/mobile-protection").send({
    //         mobileNumber: "9876543210",
    //         message: "Test protection request"
    //     });
    //     expect(response.status).toBe(200);
    //     expect(response.body).toHaveProperty("success", true);
    //     expect(response.body).toHaveProperty("message");
    // });
});

describe("Feedback API (/api/feedback)", () => {
    it("should return 400 for missing fields", async () => {
        const response = await request("http://localhost:3000").post("/api/feedback").send({});
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message");
    });

    it("should return 400 for invalid rating", async () => {
        const response = await request("http://localhost:3000").post("/api/feedback").send({
            category: "General",
            message: "Test feedback",
            rating: 10
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message");
    });

    // Success test: Only works if DB and email are set up
    // it("should return 200 for valid feedback submission", async () => {
    //     const response = await request("http://localhost:3000").post("/api/feedback").send({
    //         category: "General",
    //         message: "Test feedback",
    //         rating: 5
    //     });
    //     expect(response.status).toBe(200);
    //     expect(response.body).toHaveProperty("success", true);
    //     expect(response.body).toHaveProperty("message");
    // });
});
