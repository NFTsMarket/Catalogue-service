var express = require("express");
var bodyParser = require("body-parser");
const Product = require("./products.js");
const Category = require("./categories.js");

var BASE_API_PATH = "/api/v1";

var app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("<html><body><h1>Catalogue API</h1></body></html>");
});

app.get(BASE_API_PATH + "/healthz", (req, res) => {
  res.sendStatus(200);
});

// PRODUCTS CRUD

// GET PRODUCTS
app.get(BASE_API_PATH + "/products", (req, res) => {
  console.log(Date() + " - GET /products");

  Product.find({}, (err, products) => {
    if (err) {
      console.log(Date() + " - " + err);
      res.sendStatus(500);
    } else {
      res.send(
        products.map((product) => {
          return product.cleanup();
        })
      );
    }
  });
});

// GET PRODUCT BY ID
app.get(BASE_API_PATH + "/products/:id", (req, res) => {
  console.log(Date() + " - GET /products/:id");

  var filter = { _id: req.params.id };

  Product.findOne(filter, function (err, product) {
    if (err) {
      console.log(Date() + " - " + err);
      res.sendStatus(500);
    } else {
      res.send(product.cleanup());
    }
  });
});

// CREATE A PRODUCT
app.post(BASE_API_PATH + "/products", (req, res) => {
  console.log(Date() + " - POST /products");
  var product = {
    title: req.body.title,
    creator: req.body.creator,
    owner: req.body.creator,
    description: req.body.description,
    price: req.body.price,
    categories: req.body.categories,
    picture: req.body.picture,
    createdAt: Date(),
    updatedAt: Date(),
  };

  Product.create(product, (err) => {
    if (err) {
      console.log(Date() + " - " + err);

      if (err.errors) {
        res.status(400).send({ error: err.message });
      } else {
        res.sendStatus(500);
      }
    } else {
      res.sendStatus(201);
    }
  });
});

// MODIFY A PRODUCT
app.put(BASE_API_PATH + "/products/:id", (req, res) => {
  console.log(Date() + " PUT /products");

  var filter = { _id: req.params.id };
  var update = {
    $set: {
      title: req.body.title,
      owner: req.body.owner,
      description: req.body.description,
      price: req.body.price,
      categories: req.body.categories,
      picture: req.body.picture,
      updatedAt: Date(),
    },
  };
  // Product.findOneAndUpdate(filter, req.body, function(err, doc) {
  Product.findOneAndUpdate(filter, update, function (err, doc) {
    if (err) {
      console.log(Date() + " - " + err);
      res.sendStatus(500);
    } else {
      console.log(doc);
      res.sendStatus(204);
    }
  });
});

// DELETE A PRODUCT
app.delete(BASE_API_PATH + "/products/:id", (req, res) => {
  console.log(Date() + " - DELETE /products/:id");

  // If the id is valid simply return a 404 code
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).send("Product not found");
  }

  Product.findByIdAndDelete(req.params.id, function (err, product) {
    if (err) {
      console.log(Date() + " - " + err);
    } else if (product) {
      return res.status(204).send("Product deleted successfully");
    } else {
      return res.status(404).send("Product not found");
    }
  });
});

// CATEGORIES CRUD

// GET CATEGORIES
app.get(BASE_API_PATH + "/categories", (req, res) => {
  console.log(Date() + " - GET /categories");

  Category.find({}, (err, categories) => {
    if (err) {
      console.log(Date() + " - " + err);
      res.sendStatus(500);
    } else {
      res.send(
        categories.map((categorie) => {
          return categorie.cleanup();
        })
      );
    }
  });
});

// GET CATEGORY BY ID
app.get(BASE_API_PATH + "/categories/:id", (req, res) => {
  console.log(Date() + " - GET /categories/:id");

  var filter = { _id: req.params.id };

  Category.findOne(filter, function (err, category) {
    if (err) {
      console.log(Date() + " - " + err);
      res.sendStatus(500);
    } else {
      res.send(category.cleanup());
    }
  });
});

// CREATE A PRODUCT
app.post(BASE_API_PATH + "/categories", (req, res) => {
  console.log(Date() + " - POST /categories");
  var category = new Category({
    name: req.body.name,
    createdAt: Date(),
    updatedAt: Date(),
  });
  Category.create(category, (err) => {
    if (err) {
      console.log(Date() + " - " + err);
      res.sendStatus(500);
    } else {
      res.sendStatus(201);
    }
  });
});

// MODIFY A PRODUCT
app.put(BASE_API_PATH + "/categories/:id", (req, res) => {
  console.log(Date() + " PUT /categories");

  var filter = { _id: req.params.id };
  var update = { $set: { name: req.body.name, updatedAt: Date() } };

  Category.findOneAndUpdate(filter, update, function (err, doc) {
    if (err) {
      console.log(Date() + " - " + err);
      res.sendStatus(500);
    } else {
      console.log(doc);
      res.sendStatus(204);
    }
  });
});

// DELETE A PRODUCT
app.delete(BASE_API_PATH + "/categories/:id", (req, res) => {
  console.log(Date() + " - DELETE /categories/:id");

  // If the id is not valid simply return a 404 code
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).send("Category  not found");
  }

  Category.findByIdAndDelete(req.params.id, function (err, category) {
    if (err) {
      console.log(Date() + " - " + err);
    } else if (category) {
      return res.status(204).send("Category deleted successfully");
    } else {
      return res.status(404).send("Category not found");
    }
  });
});

module.exports = app;
