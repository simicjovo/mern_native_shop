const express = require("express");
const { Order } = require("../models/order.model");
const { OrderItem } = require("../models/orderItem.model");
const { Product } = require("../models/product.model");
const router = express.Router();

router.get("/", (req, res) => {
  Order.find()
    .populate("user", "name")
    .populate("orderItems")
    .sort({ dateOrdered: -1 })
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.get("/:id", (req, res) => {
  Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderitem) => {
      let newOrderItem = new OrderItem({
        quantity: orderitem.quantity,
        product: orderitem.product,
      });
      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );

  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (element) => {
      const orderItem = await OrderItem.findById(element).populate(
        "product",
        "price"
      );

      const totalPrice = orderItem.product[0].price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  const order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    status: req.body.status,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order
    .save()
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.put("/:id", async (req, res) => {
  Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  )
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales) {
    return res.status(400).json("Error");
  }
  res.json(totalSales);
});

router.get("/get/count", async (req, res) => {
  const orderCount = await Order.countDocuments((count) => count);
  if (!orderCount) {
    res.status(500).json("error");
  }
  res.json(orderCount);
});

router.get("/get/userorders/:userid", (req, res) => {
  Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .sort({ dateOrdered: -1 })
    .then((result) => res.json(result))
    .catch((err) => res.status(400).json(err));
});

module.exports = router;
