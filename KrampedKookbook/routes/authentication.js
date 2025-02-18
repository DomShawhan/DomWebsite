const express = require("express"),
  router = express.Router(),
  async = require("async"),
  nodemailer = require("nodemailer"),
  crypto = require("crypto"),
  multer = require('multer'),
  passport = require("passport");

const Recipe = require("../models/recipes"),
  Share= require("../models/share"),
  User = require("../models/authentication");

const middleware = require("../middleware");
const {cloudinary} = require('../../cloudinary');

const { storage } = require('../../cloudinary');
const upload = multer({ storage }); 
//USER PROFILE
router.get("/user/profile",middleware.isLoggedIn,  (req, res) => {
  User.findOne({"slug": req.user.slug}).then((user) => {
    if(!user) {
      req.flash("error", "User not found.");
      return res.redirect("back");
    };
    res.render("kk/user/userProfile", { user: user });
  }).catch((err) => {
    req.flash("error", err.message)
    return res.redirect("back");
  });
});
//Render register page
router.get("/register", middleware.notLoggedIn, (req, res) => {
  res.render("kk/user/signup");
});
//Register route
router.post("/register", middleware.notLoggedIn, (req, res) => {
  if(req.body.confirm === req.body.password) {
    var newUser = new User({ username: req.body.username, email: req.body.email, color: "blue", type: "user", shared: [], allShared: [], recSharedWith: [] });
    User.register(newUser, req.body.password).then((user) => {
      passport.authenticate("local")(req, res, () => {
        Share.find({"to": req.body.email}).then((shares) => {
          if(!shares) { 
            req.flash("success", "Welcome!");
            return res.redirect("/kk/recipes");
          } else {
            shares.forEach((share) => {
              if(share.allRecipes === false) {
                user.shared.push({recipeSlug: share.recipeSlug, recipeTitle: share.recipeTitle});
              } else {
                user.allShared.push({userEmail: share.from, userSlug: share.fromSlug})
              };
            });
            Share.deleteMany({"to": req.body.email}).then(()=> {
              user.save();
              req.flash("success", "Welcome!");
              return res.redirect("/kk/recipes");
            }).catch(err => {
              req.flash("error", err.message);
              return res.redirect("back");
            });
          };
        }).catch((err)=> {
          req.flash("error", err.message);
          return res.redirect("back");
        });
      });
    }).catch((err) => {
      if(!err.code) {
        req.flash("error", "Error:" + err.message);
        return res.redirect("/kk/register");
      } else if(err.code === 11000) {
        req.flash("error", "Error: Email already exists!");
        return res.redirect("/kk/register");
      }
    });
  } else {
    req.flash("error", "Passwords do not match");
    res.redirect("/kk/register");
  };
});
//Render login page
router.get("/login", middleware.notLoggedIn, (req, res) => {
  res.render("kk/user/login");
});
//Login
router.post("/login", middleware.notLoggedIn, passport.authenticate("local", 
    {
        successRedirect: "/kk/recipes", 
        failureRedirect: "/kk/login",
        successFlash: "Welcome back!",
        failureFlash: true
    }), (req, res) => {
});
 //Logout 
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged You Out");
  res.redirect("/kk/recipes");
});
//render forgot password page
router.get("/forgot", middleware.notLoggedIn, (req, res) => {
  res.render("kk/user/forgot");
});
//forgot password action
router.post("/forgot", middleware.notLoggedIn, (req, res) => {
  async.waterfall([
    (done) => {
      crypto.randomBytes(20, (err, buf) => {
        const token = buf.toString("hex");
        done(err, token);
      });
    },
    (token, done) => {
      User.findOne({ email: req.body.email }).then((user) => {
        if(!user) {
          req.flash("error", "No account with that email address exists.");
          return res.redirect("/kk/forgot");
        };

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        user.save((err) => {
          done(err, token, user);
        });
      }).catch(err => {
        req.flash("error", "No account with that email address exists.");
        return res.redirect("/kk/forgot");
      });
    },
    (token, user, done) => {
      const smtpTransport = nodemailer.createTransport({
          host: process.env.EMAILSERVICE,
          port: 587,
          secureConnection: false,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAILPASS
          }
        }),
        mailOptions = {
          to: user.email,
          from: process.env.EMAIL,
          subject: "Kramped Cookbook password reset",
          text: "You are recieving this because you(or someone else) have requested the reset of the password for your account for Kramped Cookbook." + 
          "Please click on the following link to complete the process " +
          "http://" + req.headers.host + "/kk/reset/" + token + "\n\n" + 
          "If you did not request this, please ignore and your password will remain unchanged."
        };
      smtpTransport.sendMail(mailOptions, (err) => {
        req.flash("success", "An email was sent to " + user.email + "with further instructions.");
        done(err, "done");
      });
    }
  ],(err) => {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("/kk/forgot");
    }
    res.redirect("/kk/forgot");
  });
});
//get reset password page
router.get("/reset/:token", middleware.notLoggedIn, (req, res) => {
  User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()}}).then((user) => {
    if(!user){
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/kk/forgot");
    }
    res.render("kk/user/reset", {token: req.params.token});
  }).catch(err => {
    req.flash("error", "Password reset token is invalid or has expired.");
    return res.redirect("/kk/forgot");
  });
});
//reset password
router.post("/reset/:token", middleware.notLoggedIn, (req, res) => {
  async.waterfall([
    (done) => {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()}}).then((user) => {
        if(!user){
          req.flash("error", "Password reset token is invalid or has expired.");
          return res.redirect("/kk/forgot");
        }
        if(req.body.password === req.body.confirm){
          user.setPassword(req.body.password, (err) => {
            user.resetPasswordExpires = undefined;
            user.resetPasswordtoken = undefined;

            user.save((err) => {
              req.logIn(user, (err) => {
                done(err, user);
              });
            });
          });
        } else {
          req.flash("error", "Passwords do not match.");
          return res.redirect("back");
        };
      }).catch(err => {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/kk/forgot");
      });
    }, (user, done) => {
      const smtpTransport = nodemailer.createTransport({
        host: process.env.EMAILSERVICE,
        port: 587,
        secureConnection: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAILPASS
        }
      });
      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL,
        subject: "Your password has been changed",
        text: "Hello, \n\n" + "This confirms that the password for your account " + user.email + " on Kramped Kookbook has been changed"
      };
      smtpTransport.sendMail(mailOptions, (err) => {
        req.flash("success", "Success! Your password has been changed.");
        done(err);
      })
    }
  ], (err) => {
    res.redirect("/kk/recipes");
  });
});
//get user settings page
router.get("/user/edit/settings", middleware.isLoggedIn, (req, res) => {
  if(req.isAuthenticated()){
    User.findOne({"slug": req.user.slug}).then((foundUser) => {
      if(!foundUser) {
        req.flash("error", "User not found");
        return res.redirect("back");
      } else {
        res.render("kk/user/userSettings", { user: foundUser });
      };
    }).catch(err => {
      req.flash("error", "User not found");
      return res.redirect("back");
    });
  } else {
    res.redirect("/kk/recipes");
  };
});
//update user
router.put("/user", middleware.isLoggedIn, (req, res) => {
  User.updateOne({"slug": req.user.slug}, req.body.user).then((foundUser) => {
    res.redirect("/kk/recipes");
  }).catch(err => {
    req.flash("error", err);
    return res.redirect("back");
  });
});
//change password
router.post("/user/password", middleware.isLoggedIn, (req, res) => {
  if(req.body.newpassword === req.body.confirmpassword) {
    User.findOne({"slug": req.user.slug}).then((user) => {
      if(!user) {
        req.flash("error", "User not found");
        return res.redirect("back");
      } else {
        user.changePassword(req.body.oldpassword, req.body.newpassword, (err) => {
          if(err) {
            req.flash("err", err.message);
            return res.redirect("back");
          } else {
            req.flash("success", "Password Changed Successfully");
            return res.redirect("/kk/recipes");
          };
        });
      };
    }).catch(err => {
      req.flash("error", "User not found");
      return res.redirect("back");
    });
  } else {
    req.flash("error", "Passwords do not match.");
    res.redirect("back");
  };
});
//search user recipes
router.get("/recipes/user/search/", middleware.isLoggedIn, (req, res) => {
  User.findOne({"slug": req.user.slug}).then((user) => {
    if(!user) {
      req.flash("error", "User not found");
      return res.redirect("/kk/user/" + req.user.slug);
    } else {
      Recipe.find({"title" : { "$regex": req.query.search, "$options": "i" }, "author.slug": req.user.slug}).then((recipes) => {
        res.render("kk/user/search", {recipes: recipes, user: user, search: req.query.search});
      }).catch(err => {
        res.redirect("/kk/recipes");
      });
    };
  }).catch(err => {
    req.flash("error", "User not found");
    return res.redirect("/kk/user/" + req.user.slug);
  });
});
//view all user recipes
router.get("/user", middleware.isLoggedIn, (req, res) => {
  User.findOne({"slug": req.user.slug}).then((foundUser) => {
    const numQuery = parseInt(req.query.number),
      numCook = req.cookies.number;
    let perPage;
    if(numQuery) {
        perPage = numQuery;
    } else if(numCook) {
        perPage = Number(numCook);
    } else {
        perPage = 20;
    }

    const pageQuery = parseInt(req.query.page),
      pageNumber = pageQuery ? pageQuery : 1;

    Recipe.find({ "author.slug": req.user.slug}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec((err, found) => {
      Recipe.countDocuments({ "author.slug": req.user.slug}).exec( (err, count) => {
        if(err) {
          req.flash("error", err);
          res.redirect("back");
        } else {
          res.render("kk/user/user", { user: foundUser, special: [], recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All" });
        };
      });
    });
  }).catch(err => {
    req.flash("error", "User not found");
    return res.redirect("back");
  });
});
//view all user recipes seperated by type
router.get("/user/all/:di", middleware.isLoggedIn, (req, res) => {
  User.findOne({"slug": req.user.slug}).then((foundUser) => {
    if(!foundUser) {
      req.flash("error", "User not found");
      return res.redirect("back");
    } else {
      if(req.params.di == "gluten" || req.params.di == "dairy" || req.params.di == "vegan" || req.params.di == "vegetarian") {
        const numQuery = parseInt(req.query.number),
          numCook = req.cookies.number;
        let perPage;

        if(numQuery) {
          perPage = numQuery;
        } else if(numCook) {
          perPage = Number(numCook);
        } else {
          perPage = 20;
        }
        const pageQuery = parseInt(req.query.page),
          pageNumber = pageQuery ? pageQuery : 1;

        if(req.params.di == "gluten") {
          Recipe.find({"gluten": true,"author.slug": req.user.slug }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec().then((found) => {
            Recipe.countDocuments({"gluten": true,"author.slug": req.user.slug }).exec().then((count) => {
              res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: req.params.di });
            }).catch(err => {
              req.flash("error", err);
              res.redirect("back");
            });
          }).catch(err => {
            req.flash("error", err);
            res.redirect("back");
          });
        } else if(req.params.di == "dairy") {
          Recipe.find({"dairy": true,"author.slug": req.user.slug }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec().then((found) => {
            Recipe.countDocuments({"dairy": true,"author.slug": req.user.slug }).exec().then((count) => {
              res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: req.params.di });
            }).catch(err => {
              req.flash("error", err);
              res.redirect("back");
            });
          }).catch(err => {
            req.flash("error", err);
            res.redirect("back");
          });
        } else if(req.params.di == "vegan") {
          Recipe.find({"vegan": true,"author.slug": req.user.slug }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec().then((found) => {
            Recipe.countDocuments({"vegan": true,"author.slug": req.user.slug }).exec().then((count) => {
              res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: req.params.di });
            }).catch(err => {
              req.flash("error", err);
              res.redirect("back");
            });
          }).catch(err => {
            req.flash("error", err);
            res.redirect("back");
          });
        } else if(req.params.di == "vegetarian") {
          Recipe.find({"vegetarian": true,"author.slug": req.user.slug }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec().then((found) => {
            Recipe.countDocuments({"vegetarian": true,"author.slug": req.user.slug }).exec().then((count) => {
              res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: req.params.di });
            }).catch(err => {
              req.flash("error", err);
              res.redirect("back");
            });
          }).catch(err => {
            req.flash("error", err);
            res.redirect("back");
          });
        };
      } else {
        res.redirect("/kk/user/" + foundUser._id)
      };
    };
  }).catch(err => {
    req.flash("error", "User not found");
    return res.redirect("back");
  });
});
//get user recipes by attribute
router.get("/user/:recipe_id", middleware.isLoggedIn, (req, res) => {
  User.findOne({"slug": req.user.slug}).then((foundUser) => {
    if(!foundUser) {
      req.flash("error", "User not found");
      return res.redirect("back");
    } else {
      if(req.params.recipe_id == "Appetizers" || req.params.recipe_id == "Bread" ||req.params.recipe_id == "Dessert" ||req.params.recipe_id == "Icing" || req.params.recipe_id == "Main") {
        const numQuery = parseInt(req.query.number),
          numCook = req.cookies.number;

        let perPage;

        if(numQuery) {
            perPage = numQuery;
        } else if(numCook) {
            perPage = Number(numCook);
        } else {
            perPage = 20;
        }
        const pageQuery = parseInt(req.query.page),
          pageNumber = pageQuery ? pageQuery : 1;
        Recipe.find({ "type": req.params.recipe_id, "author.slug": req.user.slug }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec().then((found) => {
          Recipe.countDocuments({ "type": req.params.recipe_id, "author.slug": req.user.slug }).exec().then((count) => {
            res.render("kk/user/user", { user: foundUser, special: [], recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.recipe_id });
          }).catch((err) => {
            req.flash("error", err);
            res.redirect("back")
          });
        }).catch((err) => {
          req.flash("error", err);
          res.redirect("back")
        });
      } else {
        res.redirect("/kk/user/" + foundUser._id)
      };
    };
  }).catch(err => {
    req.flash("error", "User not found");
    return res.redirect("back");
  });
});
//get user recipes based on recipe type and recipe attribute
router.get("/user/:recipe_id/:di", middleware.isLoggedIn, (req, res) => {
  User.findOne({"slug": req.user.slug}).then((foundUser) => {
    if(!foundUser) {
      req.flash("error", "User not found");
      return res.redirect("back")
    } else {
      if(req.params.recipe_id == "Appetizers" || req.params.recipe_id == "Bread" ||req.params.recipe_id == "Dessert" ||req.params.recipe_id == "Icing" || req.params.recipe_id == "Main") {
        if(req.params.di == "gluten" || req.params.di == "dairy" || req.params.di == "vegan" || req.params.di == "vegetarian") {
          const numQuery = parseInt(req.query.number),
            numCook = req.cookies.number;

          let perPage;

          if(numQuery) {
              perPage = numQuery;
          } else if(numCook) {
              perPage = Number(numCook);
          } else {
              perPage = 20;
          }
          const pageQuery = parseInt(req.query.page),
            pageNumber = pageQuery ? pageQuery : 1;
          if(req.params.di == "gluten") {
            Recipe.find({"type": req.params.recipe_id,"gluten": true,"author.slug": req.user.slug }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec().then((found) => {
              Recipe.countDocuments({"type": req.params.recipe_id,"gluten": true,"author.slug": req.user.slug }).exec().then((count) => {
                res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.recipe_id, special: req.params.di });
              }).catch(err => {
                req.flash("error", err);
                res.redirect("back");
              });
            }).catch(err => {
              req.flash("error", err);
              res.redirect("back");
            });
          } else if(req.params.di == "dairy") {
            Recipe.find({"type": req.params.recipe_id,"dairy": true,"author.slug": req.user.slug }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec().then((found) => {
              Recipe.countDocuments({"type": req.params.recipe_id,"dairy": true,"author.slug": req.user.slug }).exec().then((count) => {
                res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.recipe_id, special: req.params.di });
              }).catch(err => {
                req.flash("error", err);
                res.redirect("back");
              });
            }).catch(err => {
              req.flash("error", err);
              res.redirect("back");
            });
          } else if(req.params.di == "vegan") {
            Recipe.find({"type": req.params.recipe_id,"vegan": true,"author.slug": req.user.slug }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec().then((found) => {
              Recipe.countDocuments({"type": req.params.recipe_id,"vegan": true,"author.slug": req.user.slug }).exec().then((count) => {
                res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.recipe_id, special: req.params.di });
              }).catch(err => {
                req.flash("error", err);
                res.redirect("back");
              });
            }).catch(err => {
              req.flash("error", err);
              res.redirect("back");
            });
          } else if(req.params.di == "vegetarian") {
            Recipe.find({"type": req.params.recipe_id,"vegetarian": true,"author.slug": req.user.slug }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec().then((found) => {
              Recipe.countDocuments({"type": req.params.recipe_id,"vegetarian": true,"author.slug": req.user.slug }).exec().then((count) => {
                res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.recipe_id, special: req.params.di });
              }).catch(err => {
                req.flash("error", err);
                res.redirect("back");
              });
            }).catch(err => {
              req.flash("error", err);
              res.redirect("back");
            });
          };
        } else {
          res.redirect("/kk/user/" + foundUser._id);
        };
      } else {
        res.redirect("/kk/user/" + foundUser._id);
      };
    };
  }).catch(err => {
    req.flash("error", "User not found");
    return res.redirect("back")
  });
});
//err report action
router.post("/err-report", (req, res) => {
  async.waterfall([
    (done) => {
      var smtpTransport = nodemailer.createTransport({
        host: process.env.EMAILSERVICE,
        port: 587,
        secureConnection: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAILPASS
        }
      });
      var mailOptions = {
        to: req.body.email,
        from: process.env.EMAIL,
        subject: "Kramped Kookbook err report",
        text: "Your error report has been sent." + "We will get back to you shortly."
      };
      smtpTransport.sendMail(mailOptions, (err) => {
        done(err, "done");
      });
    },
    (user, done) => {
      var smtpTransport = nodemailer.createTransport({
        host: process.env.EMAILSERVICE,
        port: 587,
        secureConnection: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAILPASS
        }
      });
      var mailOptions = {
        to: process.env.EMAIL2,
        from: process.env.EMAIL,
        subject: "Kramped Kookbook err report",
        text: req.body.message + "   ------------   " + req.body.email
      };
      smtpTransport.sendMail(mailOptions, (err) => {
        req.flash("success", "Your report has been sent!");
        done(err, "done");
      });
    }
  ],(err) => {
    if(err) { 
      req.flash("error", err.message); 
      return res.redirect("/kk/recipes")
    }
    res.redirect("back");
  });
});
//mark message as read
router.post("/messages/:id", middleware.isLoggedIn, (req, res) => {
  User.findById(req.user.id).then((user) => {
    for(let i = 0; i < user.messages.length; i++) {
      if(user.messages[i].id === req.params.id) {
        user.messages[i].read = true;
      };
    };
    user.save();
    return res.send("success");
  }).catch(err => {
    return res.send(err);
  });
});
//delete message
router.post("/messages/delete/:id", middleware.isLoggedIn, (req, res) => {
  User.findById(req.user.id).then((user) => {
    for(let i = 0; i < user.messages.length; i++) {
      if(user.messages[i].id === req.params.id) {
        user.messages.splice(i, 1);
      };
    };
    user.save();
    return res.send("success");
  }).catch(err => {
    return res.send(err);
  });
});
//update user image
router.post("/user/img", upload.single("img"), middleware.isLoggedIn,  (req, res) => {
  User.findOne({"slug": req.user.slug}).then(async (err, user) => {
    if(!user) {
      return res.send({success: false, err: err.message});
    } else {
      if(user.img.img !== "https://res.cloudinary.com/dbf3twqu3/image/upload/v1622858258/KrampedKookbook/Screenshot_2021-06-04_215236_2_awi0kl.jpg") {
        cloudinary.uploader.destroy(user.img.filename, (err) => {
          if(err) {
            return res.send({success: false, err: err.message});
          };
        });
      };
      user.img.img = req.file.path;
      user.img.filename = req.file.filename;
      user.save();
      Recipe.find({"author.id": user.id}).then((recipes) => {
        if(recipes.length === 0) {
          return res.send({success: true, user: user});
        }
        recipes.forEach((recipe, i) => {
          recipe.author.img = user.img.img;
          recipe.save();
          if(i === recipes.length - 1) {
            res.send({success: true, user: user})
          };
        });
      }).catch(err => {
        return res.send({success: false, error: err});
      });
    };
  }).catch(err => {
    return res.send({success: false, err: err.message});
  });
});


module.exports = router;