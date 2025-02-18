const middlewareObj = {};
const Recipe = require("../models/recipes");
const Comment = require("../models/comments");
const Favorites = require("../models/favorites");
const User = require("../models/authentication");
//check if current user owns recipe
middlewareObj.checkRecipeOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Recipe.findOne({"slug": req.params.id}).then((foundRecipe) => {
            if(!foundRecipe){
                req.flash("error", "Recipe not found");
                return res.redirect("back");
            } else {
                if(foundRecipe.author.id.equals(req.user._id) || req.user.type === "mantainer") {
                   next();
                } else {
                    res.redirect("back");
                };
            };
        }).catch(err => {
            req.flash("error", "Recipe not found");
            return res.redirect("back");
        });
    } else {
        res.redirect("back");
    };
};
//check if current user owns the comment
middlewareObj.checkCommentOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id).then((foundComment) => {
            if(!foundComment){
                req.flash("error", "Comment not found");
                return res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id) || req.user.type === "mantainer") {
                    next();
                } else {
                    res.redirect("back");
                };
            };
        }).catch(err => {
            req.flash("error", "Comment not found");
            return res.redirect("back");
        });;
    } else {
        res.redirect("back");
    };
};
//check if user is already logged in
middlewareObj.isLoggedIn = (req, res, next) => {
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
    Favorites.findById(req.params.id).then((err, fav) => {
        if(!fav) {
            req.flash("error", err);
            return res.redirect("/kk/recipes");
        } else {
            next();
        };
    }).catch(err => {
        req.flash("error", err);
            return res.redirect("/kk/recipes");
    });;;
};

module.exports = middlewareObj;