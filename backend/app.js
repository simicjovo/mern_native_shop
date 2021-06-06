const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./middleware/jwt");

require("dotenv/config");

const app = express();

app.options("*", cors());

const productsRouter = require("./routes/product");
const categoriesRouter = require("./routes/categories");
const usersRouter = require("./routes/users");
const ordersRouter = require("./routes/orders");

app.use(express.json());
app.use(authJwt());

app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    writeConcern: {
      j: true,
    },
  })
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
