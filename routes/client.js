const express = require("express");
const router = express.Router();
const authCheck = require("../middleware/authCheck");
const clientControllers = require("../controllers/client");
const { check, body } = require("express-validator");

// -----------------------------------------------------------------
// --- Router kết nối client-app và server để ----------------------
// --- Thực hiện các hành động từ client-app -----------------------
// --- Sử dụng express-validator và middleware ---------------------
// --- Để kiểm tra tính hợp lệ của các thông tin -------------------
// -----------------------------------------------------------------

router.post("/addMessage", clientControllers.addMessage);

router.post(
  "/getChatDataClient",

  clientControllers.getChatDataClient
);

router.post("/deleteMessageSession", clientControllers.deleteMessageSession);

router.post(
  "/clientAddToCart",
  authCheck.checkToken,
  clientControllers.clientAddToCart
);

router.post("/getCart", authCheck.checkToken, clientControllers.getCart);

router.post(
  "/removeCartItem",
  authCheck.checkToken,
  clientControllers.removeCartItem
);

router.post("/updateCart", authCheck.checkToken, clientControllers.updateCart);

router.post(
  "/userOrder",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter an valid and real email!"),
    body("name", "Please enter a name!").isLength({ min: 1 }),
    body("address", "Please enter a real address for shipping!").isLength({
      min: 1,
    }),
    body("phone", "Please enter a number, a real phone for shipping!")
      .isLength({ min: 1 })
      .isNumeric(),
  ],
  authCheck.checkToken,
  clientControllers.userOrder
);

router.post("/getOrder", authCheck.checkToken, clientControllers.getOrder);

router.post(
  "/orderDetail",
  authCheck.checkToken,
  clientControllers.orderDetail
);

module.exports = router;
