const express = require("express");
const route = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { check, body } = require("express-validator");
const authControllers = require("../controllers/auth");

// -----------------------------------------------------------------
// --- Router kết nối đến server để đăng ký và đăng nhập -----------
// --- Sử dụng express-validator và middleware ---------------------
// --- Để kiểm tra tính hợp lệ của các thông tin -------------------
// -----------------------------------------------------------------

route.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter an valid email!")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            throw new Error(
              "This email exists already, please choose another one!"
            );
          }
          return true;
        });
      }),
    body(
      "password",
      "Please enter password only numbers and text at least 9 characters!"
    )
      .isLength({ min: 9 })
      .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("The passwords have to match!");
      }
      return true;
    }),
  ],
  authControllers.postSignup
);

route.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please an valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            throw new Error("This account not exist!");
          }
          return true;
        });
      }),
    body("password").custom(async (value, { req }) => {
      const userDoc = await User.findOne({ email: req.body.email });
      const doMatch = await bcrypt.compare(value, userDoc.password);
      console.log("domatch:", doMatch);
      if (!doMatch) {
        throw new Error("Password is not correct!");
      }
      return true;
    }),
  ],
  authControllers.postLogin
);

module.exports = route;
