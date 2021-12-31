const app = require("../server.js");
const Product = require("../products.js");
const request = require("supertest");
const { response } = require("../server.js");

describe("Catalogue API", () => {
  describe("GET /", () => {
    it("Should return an HTML document", () => {
      return request(app)
        .get("/")
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.type).toEqual(expect.stringContaining("html"));
          expect(response.text).toEqual(expect.stringContaining("h1"));
        });
    });
  });

  describe("GET /products", () => {
    // Defining a Mock
    beforeAll(() => {
      const products = [
        new Product({
          title: "second product",
          creator: "creator2",
          description: "Description of my second product",
          price: 20.0,
          categories: "category2",
          picture: "www.url2.com",
        }),
      ];

      // Spy on mock function
      dbFind = jest.spyOn(Product, "find");

      // Default implementation (Parameters received by find in server.js)
      dbFind.mockImplementation((query, callback) => {
        callback(null, products);
      });
    });

    it("Should return all products", () => {
      return request(app)
        .get("/api/v1/products")
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveLength(1);
          expect(dbFind).toBeCalledWith({}, expect.any(Function));
        });
    });
  });

  describe("POST /products", () => {
    const product = {
      title: "myProduct",
      creator: "creator",
      description: "Description of my product",
      price: 150.5,
      categories: "category0",
      picture: "www.myurl.com",
    };
    let dbInsert;

    beforeEach(() => {
      dbInsert = jest.spyOn(Product, "create");
    });

    it("Should add a new product", () => {
      dbInsert.mockImplementation((c, callback) => {
        callback(false);
      });

      return request(app)
        .post("/api/v1/products")
        .send(product)
        .then((response) => {
          expect(response.statusCode).toBe(201);

          expect(dbInsert).toBeCalledWith(
            expect.objectContaining(product),
            expect.any(Function)
          );
        });
    });

    it("Should return 500 if there is a problem with the DB", () => {
      dbInsert.mockImplementation((c, callback) => {
        callback(true);
      });

      return request(app)
        .post("/api/v1/products")
        .send(product)
        .then((response) => {
          expect(response.statusCode).toBe(500);
        });
    });

    it("Should return a client error (400 code) when inserting an invalid value", () => {
      dbInsert.mockImplementation((p, callback) => {
        callback({ message: "Invalid input", errors: true });
      });

      return request(app)
        .post("/api/v1/products")
        .send(product)
        .then((response) => {
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("error", "Invalid input");
        });
    });
  });

  describe("PUT /products", () => {
    const id = "61cf2762645dc30315a132b6";
    let dbUpdate;
    const update = {
      title: "new title",
      owner: "new owner",
      description: "new description",
      price: 12.0,
      categories: "new categories",
      picture: "www.newPicture.com",
    };

    beforeEach(() => {
      dbUpdate = jest.spyOn(Product, "findOneAndUpdate");
    });

    // 204 code
    it("Should update an existing product", () => {
      dbUpdate.mockImplementation((f, update, v, callback) => {
        callback(null, true);
      });

      return request(app)
        .put("/api/v1/products/" + id)
        .send(update)
        .then((response) => {
          expect(response.statusCode).toBe(204);
          expect(dbUpdate).toBeCalledWith(
            { _id: id },
            expect.objectContaining({
              $set: {
                categories: update.categories,
                description: update.description,
                owner: update.owner,
                picture: update.picture,
                price: update.price,
                title: update.title,
                updatedAt: expect.any(String),
              },
            }),
            { runValidators: true },
            expect.any(Function)
          );
        });
    });

    it("Should return a client error (400 code)", () => {
      dbUpdate.mockImplementation((f, update, v, callback) => {
        callback({ errors: true, message: "Invalid input" }, null);
      });

      return request(app)
        .put("/api/v1/products/" + id)
        .send(update)
        .then((response) => {
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("error", "Invalid input");
        });
    });

    it("Should return 500 if there is a problem with the DB", () => {
      dbUpdate.mockImplementation((f, update, v, callback) => {
        callback(true, null);
      });

      return request(app)
        .put("/api/v1/products/" + id)
        .send(update)
        .then((response) => {
          expect(response.statusCode).toBe(500);
        });
    });

    it("Should return 404 if the user inserts an invalid database id", () => {
      dbUpdate.mockImplementation((f, update, v, callback) => {
        callback(false, true);
      });

      return request(app)
        .put("/api/v1/products/1234")
        .send(update)
        .then((response) => {
          expect(response.statusCode).toBe(404);
        });
    });

    it("Should return 404 if the user inserts a non-existing DB id", () => {
      dbUpdate.mockImplementation((f, update, v, callback) => {
        callback(false, false);
      });

      return request(app)
        .put("/api/v1/products/" + id)
        .send(update)
        .then((response) => {
          expect(response.statusCode).toBe(404);
        });
    });
  });

  describe("DELETE /products", () => {
    const id = "61cf2762645dc30315a132b6";

    beforeEach(() => {
      dbRemove = jest.spyOn(Product, "findByIdAndDelete");
    });

    // 204 code
    it("Should remove an existing product", () => {
      dbRemove.mockImplementation((i, callback) => {
        callback(false, true);
      });

      return request(app)
        .delete("/api/v1/products/" + id)
        .then((response) => {
          expect(response.statusCode).toBe(204);
          expect(dbRemove).toBeCalledWith(id, expect.any(Function));
        });
    });

    it("Should return a server error (500 code)", () => {
      dbRemove.mockImplementation((i, callback) => {
        callback(true, true);
      });

      return request(app)
        .delete("/api/v1/products/" + id)
        .then((response) => {
          expect(response.statusCode).toBe(500);
          expect(dbRemove).toBeCalledWith(id, expect.any(Function));
        });
    });

    it("Should return a client error (404 code) when inserting an invalid DB id", () => {
      dbRemove.mockImplementation((i, callback) => {
        callback(false, true);
      });

      return request(app)
        .delete("/api/v1/products/1234")
        .then((response) => {
          expect(response.statusCode).toBe(404);
        });
    });

    it("Should return a client error (404 code) when inserting a non-existing DB id", () => {
      dbRemove.mockImplementation((i, callback) => {
        callback(false, false);
      });
      return request(app)
        .delete("/api/v1/products/" + id)
        .then((response) => {
          expect(response.statusCode).toBe(404);
          expect(dbRemove).toBeCalledWith(id, expect.any(Function));
        });
    });
  });
});
