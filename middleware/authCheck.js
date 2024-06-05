const jwt = require("jsonwebtoken");
const User = require("../models/user");
const deleteImageFiles = require("../util/imageRemove");

// --- PHƯƠNG THỨC KIỂM TRA USER KHÁCH HÀNG ------------------
// --- SỬ DỤNG  jsonwebtoken ĐỂ TRẢ VỀ MỘT COOKIE ------------
// --- CÓ GIỚI HẠN THỜI GIAN 1H ------------------------------

exports.checkToken = (req, res, next) => {
  const getAuth = req.get("Authorization");

  if (!getAuth) {
    res.status(401).json({
      message: "Not authenticated!",
    });
    return;
  }

  const token = getAuth.split(" ")[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, "supersecretxt");
  } catch (err) {
    console.log("err decoded token:", err);
    res.status(500).json({
      message: err.message,
    });
    return;
  }

  if (!decodedToken) {
    res.status(401).json({
      message: "Wrong token!",
    });
    return;
  }
  req.userId = decodedToken.userId;
  next();
};

// -----------------------------------------------------------

// --- PHƯƠNG THỨC KIỂM TRA USER ADMIN -----------------------
// --- SỬ DỤNG  jsonwebtoken ĐỂ TRẢ VỀ MỘT COOKIE ------------
// --- CÓ GIỚI HẠN THỜI GIAN 1H ------------------------------

exports.checkAdmin = (req, res, next) => {
  const getAuth = req.get("Authorization");

  if (!getAuth) {
    res.status(401).json({
      message: "Not authenticated!",
    });
    return;
  }

  const token = getAuth.split(" ")[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, "supersecretxt");
  } catch (err) {
    console.log("err decoded token:", err);
    console.log("err.message decoded token:", err.message);
    deleteImageFiles.deleteFiles(
      req.files.map((image) => {
        return image.path;
      })
    );

    res.status(500).json({ message: err.message });
    return;
  }

  if (!decodedToken) {
    res.status(401).json({
      message: "Wrong token!",
    });
    return;
  }

  req.userId = decodedToken.userId;

  User.findById(req.userId)
    .then((user) => {
      if (user.userType !== "admin") {
        res.status(404).json({
          message: "You are not administrator! Choose another task!",
        });
        return;
      }
      next();
    })
    .catch((err) => {
      console.log("err user find id checkAdmin:", err);
      res.status(500).json({
        message: err.message,
      });
    });
};

// -----------------------------------------------------------

// --- PHƯƠNG THỨC KIỂM TRA USER TƯ VẤN VIÊN -----------------
// --- SỬ DỤNG  jsonwebtoken ĐỂ TRẢ VỀ MỘT COOKIE ------------
// --- CÓ GIỚI HẠN THỜI GIAN 1H ------------------------------

exports.checkCounselor = (req, res, next) => {
  const getAuth = req.get("Authorization");

  if (!getAuth) {
    res.status(401).json({
      message: "Not authenticated!",
    });
    return;
  }

  const token = getAuth.split(" ")[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, "supersecretxt");
  } catch (err) {
    console.log("err decoded token:", err);
    console.log("err.message decoded token:", err.message);
    deleteImageFiles.deleteFiles(
      req.files &&
        req.files.map((image) => {
          return image.path;
        })
    );
    res.status(500).json({ message: err.message });
    return;
  }

  if (!decodedToken) {
    res.status(401).json({
      message: "Wrong token!",
    });
    return;
  }

  req.userId = decodedToken.userId;

  User.findById(req.userId)
    .then((user) => {
      if (user.userType === "normal") {
        res.status(404).json({
          message: "You are not authorized!",
        });
        return;
      }
      next();
    })
    .catch((err) => {
      console.log("err user find id:", err);
      res.status(500).json({
        message: err.message,
      });
    });
};

// -----------------------------------------------------------
