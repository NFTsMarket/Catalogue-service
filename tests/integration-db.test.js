const Product = require('../products.js');
const mongoose = require('mongoose');
const dbConnect = require('../db');

describe("Products DB connection", () => {
    // Connect to the database
    beforeAll(() => {
        return dbConnect();
    })

    //
    beforeEach((done) => {
        Product.deleteMany({}, (err) => {
            done();
        });
    });

    it("Writes a product in the DB", (done) => {
        const product = new Product({ "title": "second product", "creator": "creator2", "description": "Description of my second product", "price": 20.0, "categories": "category2", "picture": "www.url2.com" });
        product.save((err, product) => {
            expect(err).toBeNull();
            Product.find({}, (err, products) => {
                // expect(products).toBeArrayOfSize(1);
                expect(products).toHaveLength(1);
                done();
            })
        })
    });

    afterAll((done) => {
        mongoose.connection.db.dropDatabase(() =>{
            mongoose.connection.close(done);
        });
    });
})