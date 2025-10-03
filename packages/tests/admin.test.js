const request = require("supertest");

describe("Admin API (/api/admin/recent-protected)", () => {
    it("should return 401 if not authenticated", async () => {
        const response = await request("http://localhost:3000").get("/api/admin/recent-protected");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message");
    });

    // it("should return paginated data if authenticated", async () => {
    //     const response = await request("http://localhost:3000")
    //         .get("/api/admin/recent-protected?page=1&limit=2")
    //         .set('Cookie', adminCookie);
    //     // Accepts 200 or 400/500 if DB is not set up
    //     expect([200, 400, 500]).toContain(response.status);
    //     expect(response.body).toHaveProperty("success");
    // });
});

describe("Admin API (/api/admin/recent-feedback)", () => {
    it("should return 401 if not authenticated", async () => {
        const response = await request("http://localhost:3000").get("/api/admin/recent-feedback");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message");
    });

    // it("should return paginated feedback if authenticated", async () => {
    //     const response = await request("http://localhost:3000")
    //         .get("/api/admin/recent-feedback?page=1&limit=2")
    //         .set('Cookie', adminCookie);
    //     expect([200, 400, 500]).toContain(response.status);
    //     expect(response.body).toHaveProperty("success");
    // });
});

describe("Admin API (/api/admin/track-number)", () => {
    it("should return 401 if not authenticated", async () => {
        const response = await request("http://localhost:3000").get("/api/admin/track-number?number=9876543210");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message");
    });

    // it("should return 400 for invalid number even if authenticated", async () => {
    //     const response = await request("http://localhost:3000")
    //         .get("/api/admin/track-number?number=123")
    //         .set('Cookie', adminCookie);
    //     expect(response.status).toBe(400);
    //     expect(response.body).toHaveProperty("success", false);
    //     expect(response.body).toHaveProperty("message");
    // });

    // Success test: Only works if DB is set up
    // it("should return 200 for valid number and auth", async () => {
    //     const response = await request("http://localhost:3000")
    //         .get("/api/admin/track-number?number=9876543210")
    //         .set('Cookie', adminCookie);
    //     expect(response.status).toBe(200);
    //     expect(response.body).toHaveProperty("success", true);
    //     expect(response.body).toHaveProperty("number");
    // });
});