const db = require("../src/db");
const request = require("supertest");
const app = require("../src/app");

let token = "";

afterAll(async () => {
  await db.end();
});

describe("KOT3D API", () => {
  test("GET / => 200", async () => {
    const r = await request(app).get("/");
    expect(r.statusCode).toBe(200);
    expect(r.body.ok).toBe(true);
  });

  test("POST /auth/register => 201 o 409", async () => {
    const r = await request(app).post("/auth/register").send({
      name: "Test User",
      email: "test@kot3d.cl",
      password: "123456",
    });
    expect([201, 409]).toContain(r.statusCode);
  });

  test("POST /auth/login => 200 y token", async () => {
    const r = await request(app).post("/auth/login").send({
      email: "test@kot3d.cl",
      password: "123456",
    });
    expect(r.statusCode).toBe(200);
    expect(r.body.token).toBeTruthy();
    token = r.body.token;
  });

  test("GET /users/me sin token => 401", async () => {
    const r = await request(app).get("/users/me");
    expect(r.statusCode).toBe(401);
  });

  test("GET /users/me con token => 200", async () => {
    const r = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${token}`);
    expect(r.statusCode).toBe(200);
    expect(r.body.email).toBeTruthy();
  });
});
