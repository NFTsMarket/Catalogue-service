var express = require("express");
var bodyParser = require("body-parser");
var cors = require('cors');
const Product = require("./products.js");
const Category = require("./categories.js");
const User = require("./database/users.js");
const Asset = require("./database/assets.js")
const { publishPubSubMessage } = require("./models/pubsub.js");
const { authorizedClient } = require("./middlewares/authorized-roles");

var BASE_API_PATH = "/api/v1";

var app = express();
app.use(cors());
app.use(bodyParser.json({limit:'50mb'}));


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
  })
  .populate([{path: 'categories', match: {deleted: { $ne: true }}, select: "name"},
        {path: "owner", select: ["name", "email"] },
        {path: "creator", select: ["name", "email"]},
        {path: "picture", select: ["name", "file"]}
      ])


});

// GET PRODUCT BY ID
app.get(BASE_API_PATH + "/products/:id", (req, res) => {
  console.log(Date() + " - GET /products/:id");

  // If the id is valid simply return a 404 code
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).send({ error: "Please, insert a valid database id" })
  }

  var filter = { _id: req.params.id };

  Product.findOne(filter, function (err, product) {
    if (err) {
      console.log(Date() + " - " + err);
      res.sendStatus(500);
    } else if (product) {
      console.log(JSON.stringify(product));
      res.send(product.cleanup());
    } else {
      res.status(404).send({ error: "Product not found" });
    }
  })
  .populate([{path: 'categories', match: {deleted: { $ne: true }}, select: "name"},
        {path: "owner", select: ["name", "email"] },
        {path: "creator", select: ["name", "email"]},
        {path: "picture", select: ["name", "file"]}
      ])
});

// CREATE A PRODUCT
app.post(BASE_API_PATH + "/products", authorizedClient, async (req, res) => {
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

  Product.create(product, async (err, doc) => {
    if (err) {
      console.log(Date() + " - " + err);

      if (err.errors) {
        res.status(400).send({ error: err.message });
      } else {
        res.sendStatus(500);
      }
    } else {
      // Publish a message to the topic
      try {
        await publishPubSubMessage("created-product", doc.cleanup());
        res.status(201).json(doc);
      } catch(e) {
        res.status(500).send(e);
      }
    }
  });

  
});

// MODIFY A PRODUCT
app.put(BASE_API_PATH + "/products/:id", authorizedClient, async (req, res) => {
  console.log(Date() + " PUT /products");

  // If the id is valid simply return a 404 code
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).send({ error: "Please, insert a valid database id" });
  }

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
  Product.findOneAndUpdate(
    filter,
    update,
    { runValidators: true },
    async function (err, doc) {
      if (err) {
        console.log(Date() + " - " + err);
        if (err.errors) {
          res.status(400).send({ error: err.message });
        } else {
          res.sendStatus(500);
        }
      } else {
        if (doc) {
          try {
            await publishPubSubMessage("updated-product", doc.cleanup());
            console.log(doc);
            res.sendStatus(204);
          } catch(e) {
            res.status(500).send(e);
          } 
        } else {
          res.status(404).send({ error: "Product not found" });
        }
      }
    }
  );
});

// DELETE A PRODUCT
app.delete(BASE_API_PATH + "/products/:id", authorizedClient, async (req, res) => {
  console.log(Date() + " - DELETE /products/:id");

  // If the id is valid simply return a 404 code
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).send({ error: "Please, insert a valid database id" });
  }

  Product.findByIdAndDelete(req.params.id, async function (err, product) {
    if (err) {
      console.log(Date() + " - " + err);
      res.sendStatus(500);
    } else if (product) {
      try {
        const id = product._id;
        await publishPubSubMessage("deleted-product", { id });
        res.sendStatus(204);
      } catch(e) {
        res.status(500).send(e);
      }
      
    } else {
      res.status(404).send({ error: "Product not found" });
    }
  });

});

// CATEGORIES CRUD

// GET CATEGORIES
app.get(BASE_API_PATH + "/categories", (req, res) => {
  console.log(Date() + " - GET /categories");

  Category.find({deleted:false}, (err, categories) => {
    if (err) {
      console.log(Date() + " - " + err);
      res.sendStatus(500);
    } else {
      res.send(
        categories.map((category) => {
          return category.cleanup();
        })
      );
    }
  });
});



// GET CATEGORY BY ID
app.get(BASE_API_PATH + "/categories/:id", (req, res) => {
  console.log(Date() + " - GET /categories/:id");

  // If the id is valid simply return a 404 code
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).send({ error: "Please, insert a valid database id" });
  }

  var filter = { _id: req.params.id };
  Category.findOne(filter, function (err, category) {
    if (err) {
      console.log(Date() + " - " + err);
      res.sendStatus(500);
    } else if (category) {
      console.log(JSON.stringify(category));
      res.status(200).send(category.cleanup());
    } else {
      res.status(404).send({ error: "Category not found" });
    }
  });
});

// CREATE A CATEGORY
app.post(BASE_API_PATH + "/categories", authorizedClient, (req, res) => {
  console.log(Date() + " - POST /categories");
  var category = new Category({
    name: req.body.name,
    createdAt: Date(),
    updatedAt: Date(),
  });

    Category.create(category, async (err, doc) => {
    if (err) {
      console.log(Date() + " - " + err);

      if (err.errors) {
        res.status(400).send({ error: err.message });
      } else {
        res.sendStatus(500);
      }
    } else {
      res.status(201).json(doc);
    }
  });
});


// MODIFY A CATEGORY
app.put(BASE_API_PATH + "/categories/:id", authorizedClient, async (req, res) => {
  console.log(Date() + " PUT /categories");

  // If the id is valid simply return a 404 code
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).send({ error: "Please, insert a valid database id" });
  }

  var filter = { _id: req.params.id };
  var update = { $set: { name: req.body.name, updatedAt: Date() } };

  Category.findOneAndUpdate(
    filter,
    update,
    { runValidators: true },
    async function (err, doc) {
      if (err) {
        console.log(Date() + " - " + err);
        if (err.errors) {
          res.status(400).send({ error: err.message });
        } else {
          res.sendStatus(500);
        }
      } else {
        if (doc) {
          console.log(doc);
          res.sendStatus(204);
        } else {
          res.status(404).send({ error: "Category not found" });
        }
      }
    }
  );
});

// DELETE A CATEGORY
app.delete(BASE_API_PATH + "/categories/:id", authorizedClient, async (req, res) => {
  console.log(Date() + " - DELETE /categories/:id");

  // If the id is valid simply return a 404 code
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).send({ error: "Please, insert a valid database id" });
  }

  var filter = { _id: req.params.id };
  var update = { $set: {deleted: true, updatedAt: Date() } };

  Category.findOneAndUpdate(
    filter,
    update,
    { runValidators: true },
    async function (err, doc) {
      if (err) {
        console.log(Date() + " - " + err);
        if (err.errors) {
          res.status(400).send({ error: err.message });
        } else {
          res.sendStatus(500);
        }
      } else {
        if (doc) {
          console.log(doc);
          res.sendStatus(204);
        } else {
          res.status(404).send({ error: "Category not found" });
        }
      }
    }
  );
  
});


// GET PRODUCT BY CATEGORY
app.get(BASE_API_PATH + "/products-category/:id", (req, res) => {
  console.log(Date() + " - GET /products-category/:id");

  // If the id is valid simply return a 404 code
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).send({ error: "Please, insert a valid database id" });
  }

  Product.find({categories: req.params.id}, (err, products) => {
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
    
  })
  .populate([{path: 'categories', match: {deleted: { $ne: true }}, select: "name"},
    {path: "owner", select: ["name", "email"] },
    {path: "creator", select: ["name", "email"]},
    {path: "picture", select: ["name", "file"]}
  ])

});



// GET ALL ASSETS
app.get(BASE_API_PATH + "/assets", (req, res) => {
  console.log(Date() + " - GET /assets");

  Asset.find({deleted:false}, (err, assets) => {
    if (err) {
      console.log(Date() + " - " + err);
      res.sendStatus(500);
    } else {
      res.send(
            assets.map((asset) => {
              return asset.cleanup();
            })
        );
    }
  });
});



module.exports = app;
