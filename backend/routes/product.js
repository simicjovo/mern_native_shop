const express = require("express");
const { Category } = require("../models/category.model");
const { Product } = require("../models/product.model");
const router = express.Router();

router.get("/", (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  Product.find(filter)
    .populate("category")
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.get("/:id", (req, res) => {
  Product.findById(req.params.id)
    .populate("category")
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.post("/", async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Bad category");

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  product
    .save()
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.put("/", async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Bad category");

  Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    {
      new: true,
    }
  )
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);

  if (!productCount) {
    res.status(400).json("Error");
  }
  res.json(productCount);
});

router.get("/get/featured", (req, res) => {
  Product.find({ isFeatured: true })
    .then((result) => res.json(result))
    .catch((err) => res.json(err));
});

module.exports = router;
