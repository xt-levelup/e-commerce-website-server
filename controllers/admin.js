const { validationResult } = require("express-validator");
const Product = require("../models/product");
const deleteImageFiles = require("../util/imageRemove");
const User = require("../models/user");
const Order = require("../models/order");
const Message = require("../models/messageSession");
const io = require("../socket");

// --- Phương thức tạo mới sản phẩm ---------------------------
exports.addProduct = (req, res, next) => {
  const name = req.body.name;
  const price = req.body.price;
  const category = req.body.category;
  const shortDesc = req.body.shortDesc;
  const longDesc = req.body.longDesc;
  const imageFiles = req.files;
  const authHeader = req.get("Authorization");
  const initQuantity = req.body.initQuantity;
  const inventoryQuantity = req.body.inventoryQuantity;
  const userId = req.body.userId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json(errors.array()[0]);
    return;
  }
  if (!imageFiles || !imageFiles.length) {
    res.status(422).json({
      message: "Please choose images, max to 5 images!",
    });
    return;
  }

  const product = new Product({
    name: name,
    price: parseFloat(price),
    category: category,
    short_desc: shortDesc,
    long_desc: longDesc,
    imageUrls: imageFiles.map((image) => {
      return image.path;
    }),
    initQuantity: initQuantity,
    inventoryQuantity: inventoryQuantity,
    userId: req.userId,
  });

  product
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Add product successfully!",
      });
    })
    .catch((err) => {
      console.log("err save product:", err);
      deleteImageFiles.deleteFiles(
        imageFiles.map((image) => {
          return image.path;
        })
      );
      res.status(500).json({
        message: err.message || "Cannot add product now!",
      });
    });
};
// -----------------------------------------------------------

// --- Phương thức chỉnh sửa sản phẩm ------------------------
exports.editProduct = (req, res, next) => {
  const name = req.body.name;
  const price = req.body.price;
  const category = req.body.category;
  const shortDesc = req.body.shortDesc;
  const longDesc = req.body.longDesc;
  const imageFiles = req.files;
  const authHeader = req.get("Authorization");
  const initQuantity = req.body.initQuantity;
  const inventoryQuantity = req.body.inventoryQuantity;
  const userId = req.body.userId;
  const productId = req.body.productId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json(errors.array()[0]);
    return;
  }
  if (!imageFiles || !imageFiles.length) {
    res.status(422).json({
      message: "Please choose images, max to 5 images!",
    });
    return;
  }

  Product.findById(productId)
    .then((product) => {
      deleteImageFiles.deleteFiles(product.imageUrls);
      product.name = name;
      product.price = parseFloat(price);
      product.category = category;
      product.short_desc = shortDesc;
      product.long_desc = longDesc;
      product.imageUrls = imageFiles.map((image) => {
        return image.path;
      });
      product.initQuantity = initQuantity;
      product.inventoryQuantity = inventoryQuantity;
      product.userId = req.userId;
      return product.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Updated successfully!",
      });
    })
    .catch((err) => {
      console.log("Update product err:", err);
      res.status(500).json({
        message: "Something thing went wrong when trying edit!",
      });
    });
};
// --------------------------------------------------------------

// --- Phương thức xóa sản phầm ---------------------------------
exports.deleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  const authHeader = req.get("Authorization");

  Product.findByIdAndDelete(productId)
    .then((result) => {
      res.status(201).json({
        message: "Deleted the product successfully!",
      });
    })
    .catch((err) => {
      console.log("err delete product:", err);
      res.status(500).json({ message: err.message });
    });
};
// --------------------------------------------------------------

// --- Phương thức lấy thông tin tất cả users -------------------
exports.getUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      return users;
    })
    .then((users) => {
      Order.find()
        .then((orders) => {
          res.status(200).json({
            users: users,
            orders: orders,
          });
        })
        .catch((err) => {
          console.log("err Order.find:", err);
          res.status(500).json({
            message: err.message,
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message,
      });
      console.log("Err getUsers:", err);
    });
};
// --------------------------------------------------------------

// Phương thức lấy các session chat -----------------------------
exports.getChats = (req, res, next) => {
  Message.find()
    .then((messageSessions) => {
      res.status(200).json(messageSessions);
    })
    .catch((err) => {
      console.log("err Message.find admin:", err);
      res.status(500).json({
        message: err.message,
      });
    });
};
// --------------------------------------------------------------

// --- Phương thức send message từ addmin-app -------------------
// --- Sử dụng socket.io để theo dõi các đoạn messenger ---------
exports.adminAddMessage = (req, res, next) => {
  const currentMessage = req.body.currentMessage;
  const userIdChat = req.body.userIdChat;
  const userId = req.body.userId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json(errors.array()[0]);
    return;
  }

  if (!currentMessage || !userIdChat) {
    res.status(403).json({
      message: "Message must be not empty and clearly user to send!",
    });
    return;
  }

  Message.findOne({ userId: userIdChat })
    .then((sessionMessage) => {
      if (!sessionMessage) {
        res.status(404).json({
          message: "This user closed this chat!",
        });
      } else {
        User.findById(userId)
          .then((user) => {
            sessionMessage.messages.push({
              currentMessage: currentMessage,
              date: new Date(),
              userChat: userId,
              userChatType: user.userType,
            });
            return sessionMessage.save();
          })
          .then((sessionMessage) => {
            io.getIo().emit("adminPosts", {
              action: "adminAddMessage",
            });
            res.status(201).json(sessionMessage);
          })
          .catch((err) => {
            console.log("err return sessionMessage add:", err);
            res.status(500).json({ message: err.message });
          });
      }
    })
    .catch((err) => {
      console.log("err Message.findOne:", err);
      res.status(500).json({
        message: err.message,
      });
    });
};
// --------------------------------------------------------------

// --- Phương thức thay đổi phân quyền user type ----------------
// --- Sử dụng middleware để check admin type -------------------
exports.userTypeUpdate = (req, res, next) => {
  const userTypeUpdate = req.body.userTypeUpdate;
  const updateUserId = req.body.updateUserId;

  User.findById(updateUserId)
    .then((user) => {
      user.userType = userTypeUpdate;
      return user.save();
    })
    .then(() => {
      res.status(201).json({
        message: "Updated user type!",
      });
    })
    .catch((err) => {
      console.log("err User.findById userTypeUpdate:", err);
      res.status(500).json({
        message: "Cannot change user type now!",
      });
    });
};
// -----------------------------------------------------------------
