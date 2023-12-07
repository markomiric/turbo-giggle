import request from "supertest";
import assert from "assert";
import app from "../server";

let token = "";

beforeAll(async () => {
    const response = await request(app).post("/api/v1/login").send({
        email: "john.doe@email.com",
        password: "password",
    });
    token = response.body.accessToken;
});

describe("GET /users", async () => {
    it("responds with json and status code 200", async () => {
        const response = await request(app)
            .get("/api/v1/users")
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .expect("Content-Type", /json/)
            .expect(200);
        assert(response.body.length > 0);
    });

    it("responds with json and status code 401 if token is not provided", async () => {
        const response = await request(app)
            .get("/api/v1/users")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);
        assert(response.status === 401);
    });
});

let userId: string;

describe("POST /users", async () => {
    it("responds with json and status code 201", async () => {
        const response = await request(app)
            .post("/api/v1/users")
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send({
                email: "test@email.com",
                password: "password",
            })
            .expect("Content-Type", /json/)
            .expect(201);

        assert(response.body.id);
        userId = response.body.id;
    });

    it("responds with json and status code 401 if token is not provided", async () => {
        const response = await request(app)
            .post("/api/v1/users")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);
        assert(response.status === 401);
    });
});

describe("GET /users/userId", async () => {
    it("responds with json and status code 200", async () => {
        const response = await request(app)
            .get(`/api/v1/users/${userId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .expect("Content-Type", /json/)
            .expect(200);
        assert(response.body.id == userId);
        assert(response.body.email);
        assert(response.body.createdAt);
        assert(response.body.updatedAt);
    });

    it("responds with json and status code 401 if token is not provided", async () => {
        const response = await request(app)
            .post("/api/v1/users")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);
        assert(response.status === 401);
    });
});

describe("PUT /users/userId", () => {
    it("responds with json and status code 200", async () => {
        const response = await request(app)
            .put(`/api/v1/users/${userId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send({
                email: "update_test@email.com",
            })
            .expect("Content-Type", /json/)
            .expect(200);
        assert(response.body.id == userId);
        assert(response.body.email);
        assert(response.body.createdAt);
        assert(response.body.updatedAt);
    });
});

describe("DELETE /users/userId", () => {
    it("responds with json and status code 200", async () => {
        const response = await request(app)
            .delete(`/api/v1/users/${userId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .expect("Content-Type", /json/)
            .expect(200);
        assert(response.body.id == userId);
    });
});
