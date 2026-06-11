process.env.NODE_ENV = "test"; // Set the environment to 'test' to use test database

const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app"); // Import the Express app
const Dog = require("../models/dog"); // Import the Dog model to manipulate test data

chai.use(chaiHttp);
const expect = chai.expect;

describe("Dog Controllers", () => {
  after(async () => {
    try {
      // Clean up the test database after tests run
      await Dog.deleteMany({ name: { $in: ["Test Dog", "Test Dog 2"] } });
    } catch (err) {
      console.error("Error cleaning up test dogs:", err);
    }
  });

  // Test cases for dog registration routes
  describe("GET /dogs/register", () => {
    it("should render the dog registration page", (done) => {
      chai
        .request(app)
        .get("/dogs/register")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          done();
        });
    });
  });

  describe("POST /dogs/register", () => {
    it("should register a new dog and return its ID", async () => {
      // 1. First, log in or simulate authentication to get a cookie/token
      const agent = chai.request.agent(app);
      await agent
        .post("/login") // Or your specific auth path
        .send({ username: "testuser", password: "password123" });

      // 2. Use that same authenticated agent to make the registration request
      const res = await agent.post("/dogs/register").send({
        name: "Buddy",
        description: "A very friendly golden retriever",
        // Include any other required fields for your Dog model
      });

      expect(res).to.have.status(200);
    });
  });

  describe("GET /dogs/adopt", () => {
    it("should render the dog adoption page", (done) => {
      chai
        .request(app)
        .get("/dogs/adopt")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          done();
        });
    });
  });

  describe("POST /dogs/adopt", () => {
    it("should adopt a dog and return a success message", async () => {
      // Similar to the registration test, you would first authenticate and then make the adoption request
      const agent = chai.request.agent(app);
      await agent
        .post("/login")
        .send({ username: "testuser", password: "password123" });
      const res = await agent.post("/dogs/adopt").send({
        dogId: "some-dog-id",
        thankYouMessage: "Thank you for letting me adopt this dog!",
      });
      expect(res).to.have.status(200);
    });
  });

  describe("DELETE /dogs/remove/:id", () => {
    it("should remove a dog and return a success message", async () => {
      // First, create a dog to be removed
      const dog = await Dog.create({
        name: "Test Dog",
        description: "A dog to be removed",
      });

      // Authenticate and then make the delete request
      const agent = chai.request.agent(app);
      await agent
        .post("/login")
        .send({ username: "testuser", password: "password123" });
      const res = await agent.delete(`/dogs/remove/${dog._id}`);
      expect(res).to.have.status(200);
    });
  });

  describe("GET /dogs/registered", () => {
    it("should render the page with registered dogs", (done) => {
      chai
        .request(app)
        .get("/dogs/registered")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          done();
        });
    });
  });

  describe("GET /dogs/adopted", () => {
    it("should render the page with adopted dogs", (done) => {
      chai
        .request(app)
        .get("/dogs/adopted")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          done();
        });
    });
  });
});
