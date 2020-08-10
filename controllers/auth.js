const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodeMailer = require("nodemailer");
const crypto = require("crypto");
const sendGridTransport = require("nodemailer-sendgrid-transport");
const user = require("../models/user");
const { validationResult } = require("express-validator/check");

const transporter = nodeMailer.createTransport(
  sendGridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);
exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
    errorMessage: message,
    oldInput : { email : "", password : "" }
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
      const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput : { email : email, password : password }
    });
  }
    user.find({email})
      bcrypt
        .compare(password, req.user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.user = req.user;
            req.session.isAuthenticated = true;
            req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          } else {
            req.flash("error", "Invalid email or password.");
            res.redirect("/login");
          }
        })
        .catch((error) => {
          console.log(error);
          res.redirect("/login");
        })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput : { email : email, password : password, confirmPassword : req.body.confirmPassword }
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "shridutt270@gmail.com",
        subject: "signup succeeded!",
        html: "<h1>Wlecom to Shridutt's Shop</h1>",
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
    errorMessage: message,
    oldInput : { email : "", password : "", confirmPassword : "" }
  });
};

exports.getRestPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset password",
    isAuthenticated: false,
    errorMessage: message,
  });
};

exports.postRestPassword = (req, res, next) => {
  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      res.redirect("/reset");
      console.log(error);
            console.log(error);            
      console.log(error);
    }
    const token = buffer.toString("hex");
    User.findOne({
      email: req.body.email,
    })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with this email was found");
          return res.redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "shridutt270@gmail.com",
          subject: "signup succeeded!",
          html: `
                <p> You requested for password reset.</p>
                <p> Please click this link <a href="http://localhost:3000/reset/${token}">to reset you password</a>
                `,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  const token = req.params.token;
  user
    .findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((er) => {
      console.log(er);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((er) => {
      console.log(er);
    });
};
