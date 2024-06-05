const Product = require("../models/product");

// --- Phương thức trả về thông tin các sản phẩm đang bán --------
exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.status(200).json(products);
    })
    .catch((err) => {
      console.log("err getProducts:", err);
      res.status(500).json({
        message: err.message,
      });
    });
};
// ---------------------------------------------------------------
