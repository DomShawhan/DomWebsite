var express = require("express");
var router = express.Router();
var passport = require("passport");
var Recipe = require("../models/recipes");
var Share= require("../models/share");
var User = require("../models/authentication");
var recipes = require("../models/recipes");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var middleware = require("../middleware");
const { route } = require("./recipes");
const {cloudinary} = require('../../cloudinary');
const favorites = require("../models/favorites");
var fs = require('fs'); 
var path = require('path'); 
var multer = require('multer');
const {storage} = require('../../cloudinary');
var upload = multer({ storage }); 
//USER PROFILE
router.get("/user/:id/profile",middleware.isLoggedIn, middleware.checkUserEqualReqUser, (req, res) => {
  User.findOne({"slug": req.params.id}, (err, user) => {
    if(err) {
      req.flash("error", err.message)
      return res.redirect("back");
    } else {
      if(!user) {
        req.flash("error", "User not found.");
        return res.redirect("back");
      };
      res.render("kk/user/userProfile", { user: user });
    };
  });
});

router.get("/register", middleware.notLoggedIn, function (req, res) {
  if(req.isAuthenticated()){
    req.flash("error", "You are already signed in");
    res.redirect("/kk/recipes");
  } else{
    res.render("kk/user/signup");
  };
});
  
router.post("/register", middleware.notLoggedIn, function (req, res) {
  if(req.isAuthenticated()){
    req.flash("error", "You are already signed in");
    res.redirect("/kk/recipes");
  } else{
    if(req.body.confirm === req.body.password) {
      var newUser = new User({ username: req.body.username, email: req.body.email, color: "blue", type: "user", shared: [], allShared: [], recSharedWith: [] });
      User.register(newUser, req.body.password, function (err, user) {
        if (err) {
          if(!err.code) {
            req.flash("error", "Error:" + err.message);
            return res.redirect("/kk/register");
          } else if(err.code === 11000) {
            req.flash("error", "Error: Email already exists!");
            return res.redirect("/kk/register");
          }
        };
        passport.authenticate("local")(req, res, function () {
          Share.find({"to": req.body.email}, (err, shares) => {
            if(err) {
              req.flash("error", err.message || !shares);
              return res.redirect("back");
            } else if(!shares) { 
              req.flash("success", "Welcome!");
              res.redirect("/kk/recipes");
            } else {
              shares.forEach((share) => {
                if(share.allRecipes === false) {
                  user.shared.push({recipeSlug: share.recipeSlug, recipeTitle: share.recipeTitle});
                } else {
                  user.allShared.push({userEmail: share.from, userSlug: share.fromSlug})
                };
              });
              Share.deleteMany({"to": req.body.email}, (err)=> {
                if(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
                } else {
                  user.save();
                  req.flash("success", "Welcome!");
                  res.redirect("/kk/recipes");
                };
              });
            };
          });
        });
      });
    } else {
      req.flash("error", "Passwords do not match");
      res.redirect("/kk/register");
    };
  };
});
  
router.get("/login", middleware.notLoggedIn, function (req, res) {
  if(req.isAuthenticated()){
    req.flash("error", "You are already logged in!");
    res.redirect("/kk/recipes");
  } else {
    res.render("kk/user/login");
  };
});
  
router.post("/login", middleware.notLoggedIn, passport.authenticate("local", 
    {
        successRedirect: "/kk/recipes", 
        failureRedirect: "/kk/login",
        successFlash: "Welcome back!",
        failureFlash: true
    }), function(req, res){
});
  
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged You Out");
    res.redirect("/kk/recipes");
});

router.get("/forgot", middleware.notLoggedIn, function(req, res){
  res.render("kk/user/forgot");
});

router.post("/forgot", middleware.notLoggedIn, function(req, res){
  async.waterfall([
    function(done){
      crypto.randomBytes(20, function(err, buf){
        var token = buf.toString("hex");
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user){
        if(!user) {
          req.flash("error", "No account with that email address exists.");
          return res.redirect("/kk/forgot");
        };

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        user.save(function(err){
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
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
        to: user.email,
        from: process.env.EMAIL,
        subject: "Kramped Cookbook password reset",
        text: "You are recieving this because you(or someone else) have requested the reset of the password for your account for Kramped Cookbook." + 
        "Please click on the following link to complete the process " +
        "http://" + req.headers.host + "/kk/reset/" + token + "\n\n" + 
        "If you did not request this, please ignore and your password will remain unchanged."
        
      };
      smtpTransport.sendMail(mailOptions, function(err){
        req.flash("success", "An email was sent to " + user.email + "with further instructions.");
        done(err, "done");
      });
    }
  ],function(err){
    if(err) return next(err);
    res.redirect("/kk/forgot");
  });
});

router.get("/reset/:token", middleware.notLoggedIn, function(req, res){
  User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()}}, function(err, user){
    if(!user){
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/kk/forgot");
    }
    res.render("kk/user/reset", {token: req.params.token});
  });
});

router.post("/reset/:token", middleware.notLoggedIn, function(req, res){
  async.waterfall([
    function(done){
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()}}, function(err, user){
        if(!user){
          req.flash("error", "Password reset token is invalid or has expired.");
          return res.redirect("/kk/forgot");
        }
        if(req.body.password === req.body.confirm){
          user.setPassword(req.body.password, function(err){
            user.resetPasswordExpires = undefined;
            user.resetPasswordtoken = undefined;

            user.save(function(err){
              req.logIn(user, function(err){
                done(err, user);
              });
            });
          });
        } else {
          req.flash("error", "Passwords do not match.");
          return res.redirect("back");
        };
      });
    }, function(user, done){
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
        to: user.email,
        from: process.env.EMAIL,
        subject: "Your password has been changed",
        text: "Hello, \n\n" + "This confirms that the password for your account " + user.email + " on Kramped Kookbook has been changed"
      };
      smtpTransport.sendMail(mailOptions, function(err){
        req.flash("success", "Success! Your password has been changed.");
        done(err);
      })
    }
  ], function(err){
    res.redirect("/kk/recipes");
  });
});

router.get("/user/:id/edit/settings", function(req, res) {
  if(req.isAuthenticated()){
    User.findOne({"slug": req.params.id}, function(err, foundUser){
      if(err || !foundUser) {
        req.flash("error", "User not found");
        return res.redirect("back");
      } else {
        if(req.user.slug === req.params.id || req.user.type === "mantainer") {
          res.render("kk/user/userSettings", { user: foundUser });
        } else {
          res.redirect("/kk/recipes");
        };
      };
    });
  } else {
    res.redirect("/kk/recipes");
  };
});

router.put("/user/:id", middleware.checkUser, function(req, res) {
  if(req.isAuthenticated()){
    if(req.user.slug === req.params.id || req.user.type === "mantainer") {
      User.updateOne({"slug": req.params.id}, req.body.user, function(err, foundUser){
        if(err) {
          req.flash("error", err);
          res.redirect("back");
        } else {
          res.redirect("/kk/recipes");
        };
      });
    }else {
      res.redirect("/kk/recipes");
    };
  } else {
    res.redirect("/kk/recipes");
  };
});

router.post("/user/:id/password", middleware.isLoggedIn, function(req, res){
  if(req.user.slug === req.params.id) {
    if(req.body.newpassword === req.body.confirmpassword) {
      User.findOne({"slug": req.params.id}, function(err, user){
        if(err || !user) {
          req.flash("error", "User not found");
          return res.redirect("back");
        } else {
          user.changePassword(req.body.oldpassword, req.body.newpassword, function(err) {
            if(err) {
              req.flash("err", err.message);
              res.redirect("back");
           } else {
              req.flash("success", "Password Changed Successfully");
              res.redirect("/kk/recipes");
            };
          });
        };
      });
    } else {
      req.flash("error", "Passwords do not match.");
      res.redirect("back");
    };
  };
});

router.get("/recipes/:id/search/", middleware.isLoggedIn, function(req, res){
  if(req.user.slug === req.params.id) {
    User.findOne({"slug": req.params.id}, function(err, user){
      if(err || !user) {
        req.flash("error", "User not found");
        return res.redirect("/kk/user/" + req.params.id);
      } else {
        Recipe.find({"title" : { "$regex": req.query.search, "$options": "i" }, "author.slug": req.params.id}, function(err, recipes){
          if(err){
            res.redirect("/kk/recipes");
          } else {
            res.render("kk/user/search", {recipes: recipes, user: user, search: req.query.search});
          };
      });
      };
    });
  };
});

router.get("/user/:id", function(req, res) {
  if(req.isAuthenticated()){
    User.findOne({"slug": req.params.id}, function(err, foundUser){
      if(err) {
        req.flash("error", "User not found");
        return res.redirect("back");
      } else {
        if(req.user.slug === req.params.id || req.user.type === "mantainer") {
          var numQuery = parseInt(req.query.number);
          var perPage;
          var numCook = req.cookies.number;
          if(numQuery) {
              perPage = numQuery;
          } else if(numCook) {
              perPage = Number(numCook);
          } else {
              perPage = 20;
          }
          var pageQuery = parseInt(req.query.page);
          var pageNumber = pageQuery ? pageQuery : 1;
          Recipe.find({ "author.slug": req.params.id}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
            Recipe.countDocuments({ "author.slug": req.params.id}).exec(function (err, count) {
              if(err) {
                req.flash("error", err);
                res.redirect("back");
              } else {
                res.render("kk/user/user", { user: foundUser, special: [], recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All" });
              };
            });
          });
        } else {
          res.redirect("/kk/recipes");
        };
      };
    });
  } else {
    res.redirect("/kk/recipes");
  };
});

router.get("/user/:id/all/:di", function(req, res) {
  if(req.isAuthenticated()){
    User.findOne({"slug": req.params.id}, function(err, foundUser){
      if(err || !foundUser) {
        req.flash("error", "User not found");
        return res.redirect("back");
      } else {
        if (!foundUser) {
          req.flash("error", "Item not found.");
          return res.redirect("back");
        }
        if(req.user.slug === req.params.id || req.user.type === "mantainer") {
          if(req.params.di == "gluten" || req.params.di == "dairy" || req.params.di == "vegan" || req.params.di == "vegetarian") {
            var numQuery = parseInt(req.query.number);
            var perPage;
            var numCook = req.cookies.number;
            if(numQuery) {
                perPage = numQuery;
            } else if(numCook) {
                perPage = Number(numCook);
            } else {
                perPage = 20;
            }
            var pageQuery = parseInt(req.query.page);
            var pageNumber = pageQuery ? pageQuery : 1;
            if(req.params.di == "gluten") {
              Recipe.find({"gluten": true,"author.slug": req.params.id }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                Recipe.countDocuments({"gluten": true,"author.slug": req.params.id }).exec(function (err, count) {
                  if(err) {
                    req.flash("error", err);
                    res.redirect("back");
                  } else {
                    res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: req.params.di });
                  };
                });
              });
            } else if(req.params.di == "dairy") {
              Recipe.find({"dairy": true,"author.slug": req.params.id }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                Recipe.countDocuments({"dairy": true,"author.slug": req.params.id }).exec(function (err, count) {
                  if(err) {
                    req.flash("error", err);
                    res.redirect("back");
                  } else {
                    res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: req.params.di });
                  };
                });
              });
            } else if(req.params.di == "vegan") {
              Recipe.find({"vegan": true,"author.slug": req.params.id }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                Recipe.countDocuments({"vegan": true,"author.slug": req.params.id }).exec(function (err, count) {
                  if(err) {
                    req.flash("error", err);
                    res.redirect("back");
                  } else {
                    res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: req.params.di });
                  };
                });
              });
            } else if(req.params.di == "vegetarian") {
              Recipe.find({"vegetarian": true,"author.slug": req.params.id }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                Recipe.countDocuments({"vegetarian": true,"author.slug": req.params.id }).exec(function (err, count) {
                  if(err) {
                    req.flash("error", err);
                    res.redirect("back");
                  } else {
                    res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: req.params.di });
                  };
                });
              });
            };
          } else {
            res.redirect("/kk/user/" + foundUser._id)
          };
        } else {
          res.redirect("/kk/recipes");
        };
      };
    });
  } else {
    res.redirect("/kk/recipes");
  };
});

router.get("/user/:id/:recipe_id", function(req, res) {
  if(req.isAuthenticated()){
    User.findOne({"slug": req.params.id}, function(err, foundUser){
      if(err || !foundUser) {
        req.flash("error", "User not found");
        return res.redirect("back");
      } else {
        if (!foundUser) {
          req.flash("error", "Item not found.");
          return res.redirect("back");
        }
        if(req.user.slug === req.params.id || req.user.type === "mantainer") {
          if(req.params.recipe_id == "Appetizers" || req.params.recipe_id == "Bread" ||req.params.recipe_id == "Dessert" ||req.params.recipe_id == "Icing" || req.params.recipe_id == "Main") {
            var numQuery = parseInt(req.query.number);
            var perPage;
            var numCook = req.cookies.number;
            if(numQuery) {
                perPage = numQuery;
            } else if(numCook) {
                perPage = Number(numCook);
            } else {
                perPage = 20;
            }
            var pageQuery = parseInt(req.query.page);
            var pageNumber = pageQuery ? pageQuery : 1;
            Recipe.find({ "type": req.params.recipe_id, "author.slug": req.params.id }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
              Recipe.countDocuments({ "type": req.params.recipe_id, "author.slug": req.params.id }).exec(function (err, count) {
                if(err) {
                  req.flash("error", err);
                    res.redirect("back")
                } else {
                  res.render("kk/user/user", { user: foundUser, special: [], recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.recipe_id });
                };
              });
            });
          } else {
            res.redirect("/kk/user/" + foundUser._id)
          };
        } else {
          res.redirect("/kk/recipes");
        };
      };
    });
  } else {
    res.redirect("/kk/recipes");
  };
});

router.get("/user/:id/:recipe_id/:di", function(req, res) {
  if(req.isAuthenticated()){
    User.findOne({"slug": req.params.id}, function(err, foundUser){
      if(err || !foundUser) {
        req.flash("error", "User not found");
        return res.redirect("back")
      } else {
        if (!foundUser) {
          req.flash("error", "Item not found.");
          return res.redirect("back");
        }
        if(req.user.slug === req.params.id || req.user.type === "mantainer") {
          if(req.params.recipe_id == "Appetizers" || req.params.recipe_id == "Bread" ||req.params.recipe_id == "Dessert" ||req.params.recipe_id == "Icing" || req.params.recipe_id == "Main") {
            if(req.params.di == "gluten" || req.params.di == "dairy" || req.params.di == "vegan" || req.params.di == "vegetarian") {
              var numQuery = parseInt(req.query.number);
              var perPage;
              var numCook = req.cookies.number;
              if(numQuery) {
                  perPage = numQuery;
              } else if(numCook) {
                  perPage = Number(numCook);
              } else {
                  perPage = 20;
              }
              var pageQuery = parseInt(req.query.page);
              var pageNumber = pageQuery ? pageQuery : 1;
              if(req.params.di == "gluten") {
                Recipe.find({"type": req.params.recipe_id,"gluten": true,"author.slug": req.params.id }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                  Recipe.countDocuments({"type": req.params.recipe_id,"gluten": true,"author.slug": req.params.id }).exec(function (err, count) {
                    if(err) {
                      req.flash("error", err);
                      res.redirect("back");
                    } else {
                      res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.recipe_id, special: req.params.di });
                    };
                  });
                });
              } else if(req.params.di == "dairy") {
                Recipe.find({"type": req.params.recipe_id,"dairy": true,"author.slug": req.params.id }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                  Recipe.countDocuments({"type": req.params.recipe_id,"dairy": true,"author.slug": req.params.id }).exec(function (err, count) {
                    if(err) {
                      req.flash("error", err);
                      res.redirect("back");
                    } else {
                      res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.recipe_id, special: req.params.di });
                    };
                  });
                });
              } else if(req.params.di == "vegan") {
                Recipe.find({"type": req.params.recipe_id,"vegan": true,"author.slug": req.params.id }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                  Recipe.countDocuments({"type": req.params.recipe_id,"vegan": true,"author.slug": req.params.id }).exec(function (err, count) {
                    if(err) {
                      req.flash("error", err);
                      res.redirect("back");
                    } else {
                      res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.recipe_id, special: req.params.di });
                    };
                  });
                });
              } else if(req.params.di == "vegetarian") {
                Recipe.find({"type": req.params.recipe_id,"vegetarian": true,"author.slug": req.params.id }).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                  Recipe.countDocuments({"type": req.params.recipe_id,"vegetarian": true,"author.slug": req.params.id }).exec(function (err, count) {
                    if(err) {
                      req.flash("error", err);
                      res.redirect("back");
                    } else {
                      res.render("kk/user/user", { user: foundUser, recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.recipe_id, special: req.params.di });
                    };
                  });
                });
              };
            } else {
              res.redirect("/kk/user/" + foundUser._id);
            };
          } else {
            res.redirect("/kk/user/" + foundUser._id);
          };
        } else {
          res.redirect("/kk/recipes");
        };
      };
    });
  } else {
    res.redirect("/kk/recipes");
  };
});
//Here
router.post("/err-report", function(req, res) {
  async.waterfall([
    function(done) {
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
      smtpTransport.sendMail(mailOptions, function(err){
        done(err, "done");
      });
    },
    function(user, done) {
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
      smtpTransport.sendMail(mailOptions, function(err){
        req.flash("success", "Your report has been sent!");
        done(err, "done");
      });
    }
  ],function(err){
    if(err) { req.flash("error", err.message); console.log(err); return res.redirect("/kk/recipes")}
    res.redirect("back");
  });
});

router.post("/messages/:id", (req, res) => {
  if(req.isAuthenticated()) {
    User.findById(req.user.id, (err, user) => {
      if(err) {
        return res.send(err);
      } else {
        for(let i = 0; i < user.messages.length; i++) {
          if(user.messages[i].id === req.params.id) {
            user.messages[i].read = true;
          };
        };
        user.save();
        return res.send("success");
      };
    });
  } else {
    return res.send("Not logged in.");
  };
});

router.post("/messages/delete/:id", (req, res) => {
  if(req.isAuthenticated()) {
    User.findById(req.user.id, (err, user) => {
      if(err) {
        return res.send(err);
      } else {
        for(let i = 0; i < user.messages.length; i++) {
          if(user.messages[i].id === req.params.id) {
            user.messages.splice(i, 1);
          };
        };
        user.save();
        return res.send("success");
      };
    });
  } else {
    return res.send("Not logged in.");
  };
});

router.post("/user/:id/img", upload.single("img"), middleware.isLoggedIn, middleware.checkUserEqualReqUser, (req, res) => {
  User.findOne({"slug": req.params.id}, async (err, user) => {
    if(err) {
      return res.send({success: false, err: err.message});
    } else {
      if(!user) {
        return res.send({success: false, err: err.message});
      };
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
      Recipe.find({"author.id": user.id}, (err, recipes) => {
        if(err) {
          return res.send(err);
        } else {
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
        };
      });
    };
  });
});


module.exports = router;