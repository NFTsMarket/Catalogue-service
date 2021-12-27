const app = require("../server.js");
const db = require("../db.js");
const Product = require("../products.js");
const request = require("supertest");

describe("Hello world tests", () => {
    it("Should do an stupid test", () => {
        const a = 5;
        const b = 3;
        const sum = a + b;

        expect(sum).toBe(8);
    });
});

describe("Catalogue API", () => {
    describe("GET /", () => {
        it("Should return an HTML document", () => {
            return request(app).get("/").then((response) => {
                expect(response.status).toBe(200);
                expect(response.type).toEqual(expect.stringContaining("html"));
                expect(response.text).toEqual(expect.stringContaining("h1"));
            })
        });
    });

    describe("GET /products", () => {
        
        // Defining a Mock
        beforeAll(() => {
            const products = [
                new Product({
                    "title": "second product",
                    "creator": "creator2",
                    "description": "Description of my second product",
                    "price": 20.0,
                    "categories": "category2",
                    "picture": "www.url2.com"
                })
            ];

            // Spy on mock function
            dbFind = jest.spyOn(Product, "find");

            // Default implementation (Parameters received by find in server.js)
            dbFind.mockImplementation((query, callback) => {
                callback(null, products);
            });
        });

        it("Should return all products", () => {
            return request(app).get("/api/v1/products").then((response) => {
                console.log(response.body);
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(2);
                expect(dbFind).toBeCalledWith({}, expect.any(Function));
            });
        });
    });

    describe("POST /products", () => {
        const product = {"title": "myProduct", "creator": "creator", "description": "Description of my product", "price": 150.50, "categories": "category0","picture": "www.myurl.com"};
        let dbInsert;

        beforeEach(() => {
            dbInsert = jest.spyOn(Product, "create");
        });

        it("Should add a new product", () => {
            dbInsert.mockImplementation((c, callback) => {
                callback(false);
            });

            return request(app).post('api/v1/products').send(product).then((response) => {
                expect(response.statusCode).toBe(201);
                expect(dbInsert).toBeCalledWith(product, expect.any(Function));
            });
        });

        it("Should return 500 if there is a problem with the DB", () => {
            dbInsert.mockImplementation((c, callback) => {
                callback(true);
            });

            return request(app).post('api/v1/products').send(product).then((response) => {
                console.log("### Status code: " + response.statusCode);
                expect(response.statusCode).toBe(500);
            });

        });
    });

});

