const express = require("express");
const { Category } = require("../models/category.model");
const { Product } = require("../models/product.model");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const extension = FILE_TYPE_MAP[file.mimetype];
    const fileName = file.originalname.replace(" ", "-");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${fileName}-${uniqueSuffix}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

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

router.post("/", uploadOptions.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json("No file");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Bad category");
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
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

router.put("/", uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Bad id");
  }

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Bad category");

  const product = await Product.findById(req.params.id);
  if (!category) return res.status(400).send("Bad product");

  const file = req.file;
  let imagepath;

  if (file) {
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = product.image;
  }

  Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagepath,
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

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Bad id");
    }
    const files = req.files;

    let imagesPaths = [];

    if (files) {
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      {
        new: true,
      }
    );
    if (!product) {
      return res.status(500).send("Error, not updated");
    }
    res.json(product);
  }
);

module.exports = router;
