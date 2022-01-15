const app = require("../server.js");
const Product = require("../products.js");
const Category = require("../categories.js");
const request = require("supertest");
const { response } = require("../server.js");
const jwt = require("jsonwebtoken");

describe("Catalogue API", () => {

  let token;
  beforeAll(() =>{
      process.env.SECRET_KEY = "secret";
      token = jwt.sign({ "id": "12345", "email": "juaaloval@gmail.com", "role": "client" }, process.env.SECRET_KEY);
  })

  
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
    const categories = ["61d1e7b48140c58e2084ba70"];
    const products = [
      new Product({
        title: "second product",
        creator: "creator2",
        description: "Description of my second product",
        price: 20.0,
        categories: categories,
        picture: "www.url2.com",
      }),
    ];


    let dbFind;
    // Defining a Mock
    beforeEach(() => {
      // Default implementation (Parameters received by find in server.js)
      // Spy on mock function
      dbFind = jest.spyOn(Product, "find");
      
    });

    it("Should return all products", () => {
      dbFind.mockImplementation((query, callback) => {
        callback(null, products);
      });

      console.log(token);

      return request(app)
        .get("/api/v1/products")
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveLength(1);
          expect(dbFind).toBeCalledWith({}, expect.any(Function));
        });
    });

    it("Should return a server error (500 code)", () => {
      dbFind.mockImplementation((query, callback) => {
        callback(true, products);
      });

      return request(app)
        .get("/api/v1/products")
        .then((response) => {
          expect(response.statusCode).toBe(500);
        });
    });

  });

  describe("GET /categories", () => {
    const categories = [
      new Category({
        name: "category1",
      }),
    ];

    let dbFind;
    // Defining a Mock
    beforeEach(() => {
      // Default implementation (Parameters received by find in server.js)
      // Spy on mock function
      dbFind = jest.spyOn(Category, "find");
    });

    it("Should return all categories", () => {
      dbFind.mockImplementation((query, callback) => {
        callback(null, categories);
      });

      return request(app)
        .get("/api/v1/categories")
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveLength(1);
          expect(dbFind).toBeCalledWith({deleted:false}, expect.any(Function));
        });
    });

    it("Should return a server error (500 code)", () => {
      dbFind.mockImplementation((query, callback) => {
        callback(true, categories);
      });

      return request(app)
        .get("/api/v1/categories")
        .then((response) => {
          expect(response.statusCode).toBe(500);
        });
    });

  });

  describe("POST /products", () => {
    const categories = ["61d1e7b48140c58e2084ba70"];
    const product = {
      title: "myProduct",
      creator: "creator",
      description: "Description of my product",
      price: 150.5,
      categories: categories,
      picture: "www.myurl.com",
    };
    let dbInsert;

    beforeEach(() => {
      dbInsert = jest.spyOn(Product, "create");
    });

    it("Should add a new product", () => {
      dbInsert.mockImplementation((c, callback) => {
        callback(false, new Product({
          title: "myProduct",
          creator: "creator",
          owner: "owner",
          description: "Description of my product",
          price: 150.5,
          categories: categories,
          picture: "www.myurl.com",
          createdAt: "2020-06-20T15:00:00.000Z",
          updatedAt: "2020-06-20T15:00:00.000Z",
        }));
      });

      return request(app)
        .post("/api/v1/products").set("Authorization", "Bearer " + token)
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
        .post("/api/v1/products").set("Authorization", "Bearer " + token)
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
        .post("/api/v1/products").set("Authorization", "Bearer " + token)
        .send(product)
        .then((response) => {
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("error", "Invalid input");
        });
    });

    it("Should return an authentication error", () => {
      dbInsert.mockImplementation((c, callback) => {
        callback(false);
      });

      return request(app)
        .post("/api/v1/products")
        .send(product)
        .then((response) => {
          expect(response.statusCode).toBe(401);
          expect(response.body).toHaveProperty("msg", "Token is not provided")
        });
    });

  });

  describe("POST /categories", () => {
    const category = {
      name: "category2",
    };
    let dbInsert;

    beforeEach(() => {
      dbInsert = jest.spyOn(Category, "create");
    });

    it("Should add a new category", () => {
      dbInsert.mockImplementation((c, callback) => {
        callback(false);
      });

      return request(app)
        .post("/api/v1/categories").set("Authorization", "Bearer " + token)
        .send(category)
        .then((response) => {
          expect(response.statusCode).toBe(201);

          expect(dbInsert).toBeCalledWith(
            expect.objectContaining(category),
            expect.any(Function)
          );
        });
    });

    it("Should return 500 if there is a problem with the DB", () => {
      dbInsert.mockImplementation((c, callback) => {
        callback(true);
      });

      return request(app)
        .post("/api/v1/categories").set("Authorization", "Bearer " + token)
        .send(category)
        .then((response) => {
          expect(response.statusCode).toBe(500);
        });
    });

    it("Should return a client error (400 code) when inserting an invalid value", () => {
      dbInsert.mockImplementation((p, callback) => {
        callback({ message: "Invalid input", errors: true });
      });

      return request(app)
        .post("/api/v1/categories").set("Authorization", "Bearer " + token)
        .send(category)
        .then((response) => {
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("error", "Invalid input");
        });
    });

    it("Should return an authentication error", () => {
      dbInsert.mockImplementation((c, callback) => {
        callback(false);
      });

      return request(app)
        .post("/api/v1/categories")
        .send(category)
        .then((response) => {
          expect(response.statusCode).toBe(401);
          expect(response.body).toHaveProperty("msg", "Token is not provided")
        });
    });

  });

  describe("PUT /products", () => {
    const id = "61cf2762645dc30315a132b6";
    let dbUpdate;
    const categories = ["61d1e7b48140c58e2084ba70"];
    const update = {
      title: "new title",
      owner: "new owner",
      description: "new description",
      price: 12.0,
      categories: categories,
      picture: "www.newPicture.com",
    };

    beforeEach(() => {
      dbUpdate = jest.spyOn(Product, "findOneAndUpdate");
    });

    // 204 code
    it("Should update an existing product", () => {
      dbUpdate.mockImplementation((f, update, v, callback) => {
        callback(null, new Product({
          title: "myProduct",
          creator: "creator",
          owner: "owner",
          description: "Description of my product",
          price: 150.5,
          categories: categories,
          picture: "www.myurl.com",
          createdAt: "2020-06-20T15:00:00.000Z",
          updatedAt: "2020-06-20T15:00:00.000Z",
        }));
      });

      return request(app)
        .put("/api/v1/products/" + id).set("Authorization", "Bearer " + token)
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
        .put("/api/v1/products/" + id).set("Authorization", "Bearer " + token)
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
        .put("/api/v1/products/" + id).set("Authorization", "Bearer " + token)
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
        .put("/api/v1/products/1234").set("Authorization", "Bearer " + token)
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
        .put("/api/v1/products/" + id).set("Authorization", "Bearer " + token)
        .send(update)
        .then((response) => {
          expect(response.statusCode).toBe(404);
        });
    });

    it("Should return an authentication error", () => {
      dbUpdate.mockImplementation((f, update, v, callback) => {
        callback(null, true);
      });

      return request(app)
        .put("/api/v1/products/" + id)
        .send(update)
        .then((response) => {
          expect(response.statusCode).toBe(401);
          expect(response.body).toHaveProperty("msg", "Token is not provided");
        });
    });

  });

  describe("PUT /categories", () => {
    const id = "61cf2762645dc30315a132b6";
    let dbUpdate;
    const update = {
      name: "new name",
    };

    beforeEach(() => {
      dbUpdate = jest.spyOn(Category, "findOneAndUpdate");
    });

    // 204 code
    it("Should update an existing category", () => {
      dbUpdate.mockImplementation((f, update, v, callback) => {
        callback(null, true);
      });

      return request(app)
        .put("/api/v1/categories/" + id).set("Authorization", "Bearer " + token)
        .send(update)
        .then((response) => {
          expect(response.statusCode).toBe(204);
          expect(dbUpdate).toBeCalledWith(
            { _id: id },
            expect.objectContaining({
              $set: {
                name: update.name,
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
        .put("/api/v1/categories/" + id).set("Authorization", "Bearer " + token)
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
        .put("/api/v1/categories/" + id).set("Authorization", "Bearer " + token)
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
        .put("/api/v1/categories/1234").set("Authorization", "Bearer " + token)
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
        .put("/api/v1/categories/" + id).set("Authorization", "Bearer " + token)
        .send(update)
        .then((response) => {
          expect(response.statusCode).toBe(404);
        });
    });

    it("Should return an authentication error", () => {
      dbUpdate.mockImplementation((f, update, v, callback) => {
        callback(null, true);
      });

      return request(app)
        .put("/api/v1/categories/" + id)
        .send(update)
        .then((response) => {
          expect(response.statusCode).toBe(401);
          expect(response.body).toHaveProperty("msg", "Token is not provided");
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
        .delete("/api/v1/products/" + id).set("Authorization", "Bearer " + token)
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
        .delete("/api/v1/products/" + id).set("Authorization", "Bearer " + token)
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
        .delete("/api/v1/products/1234").set("Authorization", "Bearer " + token)
        .then((response) => {
          expect(response.statusCode).toBe(404);
        });
    });

    it("Should return a client error (404 code) when inserting a non-existing DB id", () => {
      dbRemove.mockImplementation((i, callback) => {
        callback(false, false);
      });
      return request(app)
        .delete("/api/v1/products/" + id).set("Authorization", "Bearer " + token)
        .then((response) => {
          expect(response.statusCode).toBe(404);
          expect(dbRemove).toBeCalledWith(id, expect.any(Function));
        });
    });

    it("Should return an authentication error", () => {
      dbRemove.mockImplementation((i, callback) => {
        callback(false, true);
      });

      return request(app)
        .delete("/api/v1/products/" + id)
        .then((response) => {
          expect(response.statusCode).toBe(401);
          expect(response.body).toHaveProperty("msg", "Token is not provided");
        });
    });

  });

  describe("DELETE /categories", () => {
    const id = "61cf2762645dc30315a132b6";
    let dbUpdate;
    const update = {
      deleted: true,
    };

    beforeEach(() => {
      dbUpdate = jest.spyOn(Category, "findOneAndUpdate");
    });

    // 204 code
    it("Should remove an existing category", () => {
      dbUpdate.mockImplementation((f, update, v, callback) => {
        callback(null, true);
      });

      return request(app)
        .delete("/api/v1/categories/" + id).set("Authorization", "Bearer " + token)
        .send(update)
        .then((response) => {
          expect(response.statusCode).toBe(204);
          expect(dbUpdate).toBeCalledWith(
            { _id: id },
            expect.objectContaining({
              $set: {
                deleted: update.deleted,
                updatedAt: expect.any(String),
              },
            }),
            { runValidators: true },
            expect.any(Function)
          );
        });
    });

    it("Should return 500 if there is a problem with the DB", () => {
      dbUpdate.mockImplementation((f, update, v, callback) => {
        callback(true, null);
      });

      return request(app)
        .put("/api/v1/categories/" + id).set("Authorization", "Bearer " + token)
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
        .delete("/api/v1/categories/1234").set("Authorization", "Bearer " + token)
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
        .delete("/api/v1/categories/" + id).set("Authorization", "Bearer " + token)
        .send(update)
        .then((response) => {
          expect(response.statusCode).toBe(404);
        });
    });

    it("Should return an authentication error", () => {
      dbUpdate.mockImplementation((f, update, v, callback) => {
        callback(null, true);
      });

      return request(app)
        .delete("/api/v1/categories/" + id)
        .send(update)
        .then((response) => {
          expect(response.statusCode).toBe(401);
          expect(response.body).toHaveProperty("msg", "Token is not provided");
        });
    });

  });

  describe("/GET /products/:id", () => {
    const id = "61cf2762645dc30315a132b6";

    const category = new Category({name:"categoria1"});
    const product = new Product({
      title: "my product",
      creator: "creator1",
      description: "Description of my product",
      price: 20.0,
      categories: category,
      picture: "www.url.com",
    });

    beforeEach(() => {
      dbFindOne = jest.spyOn(Product, "findOne");
    });

    it("Should return an existing product", () => {
      dbFindOne.mockImplementation((i, callback) => {
        callback(false, product);
      });

      return request(app)
        .get("/api/v1/products/" + id)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(dbFindOne).toBeCalledWith({ _id: id }, expect.any(Function));
        });
    });

    it("Should return a server error (500 code)", () => {
      dbFindOne.mockImplementation((i, callback) => {
        callback(true, product);
      });

      return request(app)
        .get("/api/v1/products/" + id)
        .then((response) => {
          expect(response.statusCode).toBe(500);
        });
    });

    it("Should return a client error (404 code) when inserting an invalid id", () => {
      dbFindOne.mockImplementation((i, callback) => {
        callback(false, product);
      });

      return request(app)
        .get("/api/v1/products/1234")
        .then((response) => {
          expect(response.statusCode).toBe(404);
        });
    });

    it("Should return a client error (404 code) when inserting a non-existing DB id", () => {
      dbFindOne.mockImplementation((i, callback) => {
        callback(false, null);
      });

      return request(app)
        .get("/api/v1/products/" + id)
        .then((response) => {
          expect(response.statusCode).toBe(404);
        });
    });

  });

  describe("/GET /categories/:id", () => {
    const id = "61d1e7b48140c58e2084ba70";

    const category = new Category({
      name: "category1",
    });

    beforeEach(() => {
      dbFindOne = jest.spyOn(Category, "findOne");
    });

    it("Should return an existing category", () => {
      dbFindOne.mockImplementation((i, callback) => {
        callback(false, category);
      });

      return request(app)
        .get("/api/v1/categories/" + id)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(dbFindOne).toBeCalledWith({ _id: id }, expect.any(Function));
        });
    });

    it("Should return a server error (500 code)", () => {
      dbFindOne.mockImplementation((i, callback) => {
        callback(true, category);
      });

      return request(app)
        .get("/api/v1/categories/" + id)
        .then((response) => {
          expect(response.statusCode).toBe(500);
        });
    });

    it("Should return a client error (404 code) when inserting an invalid id", () => {
      dbFindOne.mockImplementation((i, callback) => {
        callback(false, category);
      });

      return request(app)
        .get("/api/v1/categories/1234")
        .then((response) => {
          expect(response.statusCode).toBe(404);
        });
    });

    it("Should return a client error (404 code) when inserting a non-existing DB id", () => {
      dbFindOne.mockImplementation((i, callback) => {
        callback(false, null);
      });

      return request(app)
        .get("/api/v1/categories/" + id)
        .then((response) => {
          expect(response.statusCode).toBe(404);
        });
    });

  });

});
