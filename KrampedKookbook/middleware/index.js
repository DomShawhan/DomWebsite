var middlewareObj = {};
var Recipe = require("../models/recipes");
var Comment = require("../models/comments");
const favorites = require("../models/favorites");
const User = require("../models/authentication");

middlewareObj.checkRecipeOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Recipe.findOne({"slug.type": req.body.id}, function(err, foundRecipe){
            if(err || !foundRecipe){
                req.flash("error", "Recipe not found");
                return res.redirect("back");
            } else {
                if(foundRecipe.author.id.equals(req.user._id) || req.user.type === "mantainer") {
                   next();
                } else {
                    res.redirect("back");
                };
            };
        });
    } else {
        res.redirect("back");
    };
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err || !foundComment){
                    req.flash("error", "Comment not found");
                    return res.redirect("back");
                } else {
                    if(foundComment.author.id.equals(req.user._id)|| req.user.type === "mantainer") {
                        next();
                    } else {
                        res.redirect("back");
                    };
                };
            });
    } else {
        res.redirect("back");
    };
};

middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()){
      return next();
    };
    req.flash("error", "Login First");
    res.redirect("/kk/login");
};

middlewareObj.notLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        req.flash("error", "You are already logged in.");
        res.redirect("back");
    } else {
        next();
    };
};

middlewareObj.checkFavorites = (req, res, next) => {
    favorites.findById(req.params.id, (err, fav) => {
        if(err || !fav) {
            req.flash("error", err);
            return res.redirect("/kk/recipes");
        } else {
            next();
        };
    });
};

middlewareObj.checkUser = (req, res, next) => {
    User.findOne({"slug": req.params.id}, (err, user) => {
        if(err || !user) {
            req.flash("error", err);
            return res.redirect("/kk/recipes");
        } else {
            next();
        };
    });
};

middlewareObj.checkUserEqualReqUser = (req, res , next) => {
    if(req.user.slug === req.params.id) {
        next();
    } else {
        res.redirect("back");
    };
};

module.exports = middlewareObj;