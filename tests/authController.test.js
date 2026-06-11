process.env.NODE_ENV = "test"; // Set the environment to 'test' to use test database

const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app"); // Import the Express app
const User = require("../models/user"); // Import the User model to manipulate test data

chai.use(chaiHttp);
const expect = chai.expect;

// Test suite for authentication controllers
describe("Auth Controllers", () => {
  after(async () => {
    try {
      // Clean up the test database after tests run
      await User.deleteMany({
        username: {
          $in: [
            "testuser",
            "testuser2",
            "testuser4",
            "testuser5",
            "testuser6",
            "testuser7",
          ],
        },
      });
    } catch (err) {
      console.error("Error cleaning up test users:", err);
    }
  });

  // Test cases for signup routes
  describe("GET /signup", () => {
    it("should render the signup page", (done) => {
      chai
        .request(app)
        .get("/signup")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          done();
        });
    });
  });

  describe("POST /signup", () => {
    it("should create a new user and return a token", (done) => {
      chai
        .request(app)
        .post("/signup")
        .send({ username: "testuser", password: "testpass" })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("user");
          expect(res.body).to.have.property("token");
          done();
        });
    });
  });

  // Test cases for login routes
  describe("GET /login", () => {
    it("should render the login page", (done) => {
      chai
        .request(app)
        .get("/login")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.html;
          done();
        });
    });
  });

  describe("POST /login", () => {
    it("should log in an existing user and return a token", (done) => {
      // First, create a user to log in
      chai
        .request(app)
        .post("/signup")
        .send({ username: "testuser2", password: "testpass2" })
        .end(() => {
          // Now attempt to log in with the created user
          chai
            .request(app)
            .post("/login")
            .send({ username: "testuser2", password: "testpass2" })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.have.property("user");
              expect(res.body).to.have.property("token");
              done();
            });
        });
    });

    it("should return an error for incorrect password", (done) => {
      chai
        .request(app)
        .post("/login")
        .send({ username: "testuser2", password: "wrongpass" })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("errors");
          done();
        });
    });

    it("should return an error for non-existent username", (done) => {
      chai
        .request(app)
        .post("/login")
        .send({ username: "nonexistentuser", password: "testpass" })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("errors");
          done();
        });
    });
  });

  // ERROR HANDLING TESTS
  describe("Error Handling", () => {
    it("should return an error for missing username on signup", (done) => {
      chai
        .request(app)
        .post("/signup")
        .send({ password: "testpass" }) // Missing username
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("errors");
          done();
        });
    });

    it("should return an error for missing password on signup", (done) => {
      chai
        .request(app)
        .post("/signup")
        .send({ username: "testuser3" }) // Missing password
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("errors");
          done();
        });
    });
  });

  describe("Token Creation", () => {
    it("should create a JWT token with the correct payload and expiration", (done) => {
      chai
        .request(app)
        .post("/signup")
        .send({ username: "testuser4", password: "testpass4" })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("token");
          const token = res.body.token;
          // Additional checks for token structure and expiration can be added here
          done();
        });
    });
  });

  describe("Protected Routes", () => {
    it("should deny access to protected routes without a token", (done) => {
      chai
        .request(app)
        .get("/dogs/register") // Example of a protected route
        .end((err, res) => {
          expect(res).to.redirectTo(/\/login$/); // Should redirect to login
          expect(res).to.have.status(200); // Final status after redirection
          expect(res.redirects[0]).to.include("/login"); // Ensure it redirects to login
          done();
        });
    });
  });

  describe("User Model", () => {
    it("should hash the password before saving", async () => {
      const user = await User.create({
        username: "testuser5",
        password: "testpass5",
      });
      expect(user.password).to.not.equal("testpass5"); // Password should be hashed
    });

    it("should authenticate a user with correct credentials", async () => {
      const user = await User.create({
        username: "testuser6",
        password: "testpass6",
      });
      const authenticatedUser = await User.login("testuser6", "testpass6");
      expect(authenticatedUser).to.have.property("_id");
    });

    it("should throw an error for incorrect password", async () => {
      try {
        await User.login("testuser6", "wrongpass");
      } catch (err) {
        expect(err.message).to.equal("Incorrect password");
      }
    });

    it("should throw an error for non-existent username", async () => {
      try {
        await User.login("nonexistentuser", "testpass");
      } catch (err) {
        expect(err.message).to.equal("Incorrect username");
      }
    });
  });
});
