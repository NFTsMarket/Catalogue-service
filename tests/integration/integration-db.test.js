const Product = require("../../products.js");
const Category = require("../../categories.js");
const mongoose = require("mongoose");
const dbConnect = require("../../db");

describe("Products DB connection", () => {
  // Connect to the database
  beforeAll(() => {
    return dbConnect();
  });

  //
  beforeEach((done) => {
    Product.deleteMany({}, (err) => {
      Category.deleteMany({}, (err) => {
        done();
      });
    });
  });

  it("Writes a product in the DB", (done) => {

    const categories = ["61d1e7b48140c58e2084ba70"];
    const product = new Product({
      title: "second product",
      creator: "61d1e7b48140c58e2084ba71",
      owner: "61d1e7b48140c58e2084ba71",
      description: "Description of my second product",
      price: 20.0,
      categories: categories,
      picture: "61d1e7b48140c58e2084ba73",
    });
    product.save((err, product) => {
      expect(err).toBeNull();
      Product.find({}, (err, products) => {
        expect(products).toHaveLength(1);
        done();
      });
    });
  });

  it("Writes a category in the DB", (done) => {
    const category = new Category({
      name: "name"
    });
    category.save((err, category) => {
      expect(err).toBeNull();
      Category.find({}, (err, categories) => {
        expect(categories).toHaveLength(1);
        done();
      });
    });
  });

  afterAll((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  });
});
