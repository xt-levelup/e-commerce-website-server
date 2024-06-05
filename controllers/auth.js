const User = require("../models/user");
// const Session = require("../models/session");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// --- CHỨC NĂNG ĐĂNG KÝ -------------------------------------
exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const phone = req.body.phone;
  const userType = req.body.userType;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json(errors.array()[0]);
    return;
  }

  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const user = new User({
        email: email,
        password: hashPassword,
        name: name,
        phone: phone,
        userType: userType,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      console.log("err signup:", err);
      res.status(500).json({
        message: "Something went wrong!",
      });
    });
};

// --------------------------------------------------------------

// --- CHỨC NĂNG LOGIN ------------------------------------------
// --- SỬ DỤNG jsonwebtoken Ở authCheck.js ----------------------
// --- TRONG middleware ĐỂ TẠO MỘT COOKIE ĐẾN CLIENT ------------

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json(errors.array()[0]);
    return;
  }

  User.findOne({ email: email })
    .then((user) => {
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString(),
        },
        process.env.SECRET_JWT,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        email: user.email,
        userId: user._id.toString(),
      });
    })
    .catch((err) => {
      console.log("err login:", err);
      res.status(500).json({
        message: "Something went wrong!",
      });
    });
};

// --------------------------------------------------------------
