const express = require("express");
const router = express.Router();
const productControllers = require("../controllers/products");

// -----------------------------------------------------------------
// --- Router kết nối đến server để lấy thông tin sản phẩm ---------
// -----------------------------------------------------------------

router.get("/getProducts", productControllers.getProducts);

module.exports = router;
