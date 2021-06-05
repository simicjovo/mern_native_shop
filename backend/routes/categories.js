const express = require("express");
const { Category } = require("../models/category.model");
const router = express.Router();

router.get("/", (req, res) => {
  Category.find()
    .then((result) => res.json(result))
    .catch((err) => res.status(500).json(err));
});

router.get("/:id", (req, res) => {
  Category.findById(req.params.id)
    .then((result) => res.json(result))
    .catch((err) => res.status(500).json(err));
});

router.put("/:id", (req, res) => {
  Category.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  })
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();

  if (!category) {
    return res.status(404).send("Nemoguce napraviti kategoriju");
  }
  res.send(category);
});

router.delete("/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

module.exports = router;
