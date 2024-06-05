const Message = require("../models/messageSession");
const User = require("../models/user");
const io = require("../socket");
const Product = require("../models/product");
const Order = require("../models/order");
const nodemailer = require("nodemailer");
const senGridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");
const transporter = nodemailer.createTransport(
  senGridTransport({
    auth: {
      api_key: process.env.NODE_MAILER_KEY,
    },
  })
);

// --- Phương thức gửi thông tin chat đến khách hàng -----------
exports.getChatDataClient = (req, res, next) => {
  const userId = req.body.userId;

  Message.findOne({ userId: userId })
    .then((messageSession) => {
      res.status(200).json(messageSession);
    })
    .catch((err) => {
      console.log("err getChatClient:", err);
      res.status(500).json({
        message:
          "Something went wrong! You may be login again to resolve this!",
      });
    });
};
// --------------------------------------------------------------

// --- Phương thức để khách hàng gửi đoạn chat lên server -------
// --- Sử dụng socket.io để theo dõi trả lời từ admin-app -------
exports.addMessage = (req, res, next) => {
  const currentMessage = req.body.currentMessage;
  const userId = req.body.userId;

  Message.findOne({ userId: userId })
    .then((sessionMessage) => {
      if (!sessionMessage) {
        User.findById(userId)
          .then((user) => {
            const newSessionMessage = new Message({
              userId: userId,
              messages: [
                {
                  currentMessage: currentMessage,
                  date: new Date(),
                  userChat: userId,
                  userChatType: user.userType,
                },
              ],
            });
            return newSessionMessage.save();
          })
          .then((sessionMessage) => {
            io.getIo().emit("posts", {
              action: "addMessage",
              post: sessionMessage,
            });
            res.status(201).json(sessionMessage);
          })
          .catch((err) => {
            console.log("err User.findById in Add message:", err);
            res.status(500).json({
              message: err.message,
            });
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
            io.getIo().emit("posts", {
              action: "addMessage",
              post: sessionMessage,
            });
            res.status(201).json(sessionMessage);
          })
          .catch((err) => {
            connsole.log("err User.findById() in AddMessage else:", err);
            res.status(500).json({
              message: err.message,
            });
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
// ---------------------------------------------------------------

// --- Phương thức kết thúc đoạn chat ----------------------------
// --- Sử dụng socket.io để theo dõi đoạn chat -------------------
exports.deleteMessageSession = (req, res, next) => {
  const clientIdChat = req.body.clientMessageId;

  if (!clientIdChat) {
    res.status(403).json({
      message: "Cannot find this id!",
    });
    return;
  }

  Message.findOneAndDelete({ userId: clientIdChat })
    .then((result) => {
      io.getIo().emit("posts", {
        action: "deleteMessageSession",
        theSession: result,
      });
      res.status(201).json({
        message: "Delete the message session complete!",
      });
    })
    .catch((err) => {
      console.log("err Message.findOne deleteMessageSession:", err);
      res.status(500).json({
        message: "Something went wrong!",
      });
    });
};
// ----------------------------------------------------------------

// --- Phương thức thêm sản phẩm và giở hàng dành cho khách hàng --
exports.clientAddToCart = (req, res, next) => {
  const productIdAddCart = req.body.productIdAddCart;
  const numberToCart = req.body.numberToCart;

  Product.findById(productIdAddCart)
    .then((product) => {
      if (!product) {
        res.status(404).json({
          message: "The product cannot found!",
        });
        return;
      }
      User.findById(req.userId)
        .then((user) => {
          if (!user) {
            res.status(403).json({
              message: "The user is not exist!",
            });
            return;
          }
          return user.addToCart(product, numberToCart);
        })
        .then((result) => {
          res.status(201).json({
            message: "Add to cart successfully!",
          });
        })
        .catch((err) => {
          console.log("err User.findById clientAddToCart:", err);
          res.status(500).json({
            message: "Something went wrong! Cannot add to cart now!",
          });
        });
    })
    .catch((err) => {
      console.log("err Product.findById clientAddToCart:", err);
      res.status(500).json({
        message: "Something went wrong! Cannot add to cart now!",
      });
    });
};
// ---------------------------------------------------------------

// --- Phương thức lấy thông tin giỏ hàng ------------------------
exports.getCart = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        res.status(403).json({
          message: "The account is not exist!",
        });
        return;
      }
      res.status(200).json(user);
    })
    .catch((err) => {
      console.log("err User.findById getCart:", err);
      res.status(500).json({
        message: "Something went wrong! Cannot get data now!",
      });
    });
};
// ----------------------------------------------------------------

// --- Phương thức loại bỏ sản phẩm chỉ định ở giở hàng -----------
exports.removeCartItem = (req, res, next) => {
  const productId = req.body.productId;

  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        res.status(403).json({
          message: "This user cannot found!",
        });
        return;
      }
      const newItems = user.cart.items.filter((item) => {
        return item.productId.toString() !== productId.toString();
      });
      user.cart.items = newItems;
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Removed the item from cart!",
      });
    })
    .catch((err) => {
      console.log("err removeCartItem User.finById:", err);
      res.status(500).json({
        message: "Cannot remove this item now! Please try again later!",
      });
    });
};
// ----------------------------------------------------------------

// --- Phương thức cập nhật giỏ hàng ------------------------------
exports.updateCart = (req, res, next) => {
  const newItems = req.body.newItems;

  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        res.status(403).json({
          message: "This user not exist!",
        });
        return;
      }
      user.cart.items = newItems;
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Updated cart successfully!",
      });
    })
    .catch((err) => {
      console.log("err updateCart User.findById:", err);
      res.status(500).json({
        message: "Cannot update cart now! Please try again later!",
      });
    });
};
// ----------------------------------------------------------------

// --- Phương thức đặt hàng ---------------------------------------
// --- Sử dụng SendGrid và Nodemailer để gửi email cho khách hàng -
exports.userOrder = async (req, res, next) => {
  const order = req.body.order;
  const localDate = new Date();
  const day = localDate.getDate().toString().padStart(2, "0");
  const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
  const year = localDate.getFullYear();
  const hours = localDate.getHours().toString().padStart(2, "0");
  const minutes = localDate.getMinutes().toString().padStart(2, "0");
  const seconds = localDate.getSeconds().toString().padStart(2, "0");
  const orderDate = `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  const errors = validationResult(req);
  const htmlLoop =
    order &&
    order.orderItems.length > 0 &&
    order.orderItems.map((item) => {
      return `
<tr>          
  <td style="font-size:18px;">${item.currentProd.name}</td>          
  <td style="font-size:18px;"><img src="${
    item.currentProd.imageUrls[0]
  }" style="object-fit:fill; width:100%; height:100%;" alt="${
        item.currentProd.name
      }"></td>
  <!-- <td style="font-size:18px;"><img src="https://e-commerce-website-server-p2i7.onrender.com/images/1716909526355-173090586-watch_1_4.jpeg" style="object-fit:fill; width:100%; height:100%;" alt="${
    item.currentProd.name
  }"></td> -->
  <td style="font-size:18px;">${item.currentProd.price.toLocaleString(
    "vi-VN"
  )} VND</td>          
  <td style="font-size:18px;">${item.quantity}</td>          
  <td style="font-size:18px;">${item.totalPrice.toLocaleString(
    "vi-VN"
  )} VND</td>
</tr>
`;
    });

  const htmlSender = `
    <h1>Hi: ${order.name}<h1>    
      <p style="font-size:12px;" >Địa chỉ: ${order.address}</p>
      <p style="font-size:12px;" >SĐT: ${order.phone}</p>          
    <table border="1" >
      <tr>
          <th style="font-size:12px;">Tên sản phẩm</th>
          <th style="font-size:12px;">Hình ảnh</th>
          <th style="font-size:12px;">Đơn giá</th>
          <th style="font-size:12px;">Số lượng</th>
          <th style="font-size:12px;">Thành tiền</th>
      </tr>
      ${htmlLoop.join("")} 
    </table>
    <h2 style="font-size:21px;">Tổng thanh toán:</h2>
    <p style="font-size:21px;">${order.orderPrice.toLocaleString(
      "vi-VN"
    )} VND</p>
    <p style="font-size:18px;">Ngày đặt hàng: ${orderDate}</p>
    <h4 style="font-size:18px;">Cảm ơn bạn!</h4>
  `;

  if (!errors.isEmpty()) {
    res.status(422).json(errors.array()[0]);
    return;
  }

  if (!order || !order.orderItems || !order.orderItems.length) {
    res.status(403).json({
      message: "No order to update!",
    });
    return;
  }

  if (
    order &&
    order.orderItems &&
    Array.isArray(order.orderItems) &&
    order.orderItems.length > 0
  ) {
    const orderRequireIds = order.orderItems.map((order) => {
      return order.currentProd._id;
    });
    const orderProducts = await Product.find({ _id: { $in: orderRequireIds } });

    let orderErrors = [];
    if (
      orderProducts &&
      Array.isArray(orderProducts) &&
      orderProducts.length > 0
    ) {
      for (let i = 0; i < orderProducts.length; i++) {
        const compareProd = order.orderItems.find((currentOrder) => {
          return (
            currentOrder.currentProd._id.toString() ===
            orderProducts[i]._id.toString()
          );
        });
        if (!compareProd) {
          orderErrors.push(
            `The product ${orderProducts[i].name} cannot found!`
          );
        } else {
          if (orderProducts[i].inventoryQuantity - compareProd.quantity < 0) {
            orderErrors.push(
              `Quanlity of this product ${orderProducts[i].name} is ${orderProducts[i].inventoryQuantity} in store now!`
            );
          }
        }
      }
    }

    if (orderErrors && Array.isArray(orderErrors) && orderErrors.length > 0) {
      res.status(403).json({
        message: orderErrors[0],
      });
      return;
    }
  }

  const newOrder = new Order({
    order: order,
    userId: req.userId,
    orderDate: new Date(),
  });

  newOrder
    .save()
    .then((result) => {
      User.findById(req.userId)
        .then((user) => {
          if (!user) {
            res.status(403).json({
              message: "Cannot found your account!",
            });
            return;
          }
          return user.clearCart();
        })
        .then((result) => {
          for (let i = 0; i < order.orderItems.length; i++) {
            Product.findById(order.orderItems[i].currentProd._id)
              .then((product) => {
                const newQuantity =
                  product.inventoryQuantity - order.orderItems[i].quantity;
                product.inventoryQuantity = newQuantity;
                product.save();
              })
              .catch((err) => {
                console.log("err Product.findById userOrder:", err);
                res.status(500).json({
                  message: "Something went wrong",
                });
              });
          }
          res.status(201).json({
            message: "Your order was done!",
          });
          return transporter.sendMail({
            to: result.email,
            from: "xitrumvndn@gmail.com",
            subject: "Yor new order was done!",
            html: htmlSender,
          });
        })
        .catch((err) => {
          console.log("err User.findById newOrder.save():", err);
          res.status(500).json({
            message: "Cannot order now! Please try again later!",
          });
        });
    })
    .catch((err) => {
      console.log("err userOrder newOrder.save():", err);
      res.status(500).json({
        message: "Cannot order now! Please try again later!",
      });
    });
};
// ----------------------------------------------------------------

// --- Phương thức lấy thông tin các lần order --------------------
exports.getOrder = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        res.status(403).json({
          message: "Cannot found your account! Please try again later!",
        });
        return;
      }
      Order.find({ userId: req.userId })
        .then((orders) => {
          res.status(200).json(orders);
        })
        .catch((err) => {
          console.log("err Order.findOne getOrder:", err);
          res.status(500).json({
            message: "Something went wrong! Please try again later!",
          });
        });
    })
    .catch((err) => {
      console.log("err User.findById() getOrder:", err);
      res.status(500).json({
        message: "Something went wrong! Please try again later!",
      });
    });
};
// ----------------------------------------------------------------

// --- Phương thức hiển thị thông tin chi tiết một order ----------
exports.orderDetail = (req, res, next) => {
  const orderId = req.body.orderId;

  if (!orderId) {
    res.status(404).json({
      message: "Nothing here!",
    });
    return;
  }

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        res.status(404).json({
          message: "This order not found!",
        });
        return;
      }
      res.status(200).json(order);
    })
    .catch((err) => {
      console.log("err orderDetail Order.findById:", err);
    });
};
// ---------------------------------------------------------------
