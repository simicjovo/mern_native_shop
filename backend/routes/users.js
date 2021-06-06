const express = require("express");
const { User } = require("../models/user.model");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  User.find()
    .select("-passwordHash")
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.post("/", (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user
    .save()
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.get("/:id", (req, res) => {
  User.findById(req.params.id)
    .select("-passwordHash")
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.put("/:id", async (req, res) => {
  const userExist = await User.findById(req.params.id);
  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.passwordHash;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    },
    { new: true }
  );

  if (!user) return res.status(400).send("the user cannot be created!");

  res.send(user);
});

router.post("/register", (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user
    .save()
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.post("/login", async (req, res) => {
  if (!req.body.password) {
    return res.status(400).json("No password");
  }
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).send("User not found");
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );
    res.send(token);
  } else {
    res.status(400).send("Wrong password");
  }
});

router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.get("/get/count", async (req, res) => {
  const userCount = await User.countDocuments((count) => count);

  if (!userCount) {
    res.status(400).json("Error");
  }
  res.json(userCount);
});

module.exports = router;
