const middlewareObj = {};
const Recipe = require("../models/recipes");
const Comment = require("../models/comments");
const favorites = require("../models/favorites");
const User = require("../models/authentication");
//check if current user owns recipe
middlewareObj.checkRecipeOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Recipe.findOne({"slug": req.params.id}, function(err, foundRecipe){
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
//check if current user owns the comment
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
//check if user is already logged in
middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()){
      return next();
    };
    req.flash("error", "Login First");
    res.redirect("/kk/login");
};
//confirm that the user is not logged in
middlewareObj.notLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        req.flash("error", "You are already logged in.");
        res.redirect("back");
    } else {
        next();
    };
};
//check if the recipe is a favorite
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

module.exports = middlewareObj;