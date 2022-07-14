var express = require("express");
var router = express.Router();

var Recipe = require("../models/recipes");
var middleware = require("../middleware");
var Favorites = require("../models/favorites");
var User = require("../models/authentication");

router.post("/recipes/:id/:idd/favorites", middleware.isLoggedIn, function(req, res){
    Recipe.findOne({"slug": req.params.id}, function(err, recipe){
        if(err || !recipe){
            req.flash("error", "Something went wrong.");
            return res.redirect("/kk/recipes");
        } else {
            User.findOne({"slug": req.params.idd}, function(err, user){
                if(err || !user){
                    req.flash("error", "Something went wrong.");
                    return res.redirect("/kk/recipes");
                } else {
                    var fav = {recipe_id: recipe.slug, recipe_name: recipe.title};
                    Favorites.create(fav, function(err, favorite){
                        if(err){
                            req.flash("error", "Something went wrong.");
                            res.redirect("/kk/recipes");
                        } else {
                            user.favorites.push(favorite);
                            user.save();
                            req.flash("success", "Added to favorites");
                            res.redirect("back");
                        };
                    });
                };
            });
        };
    });
});

router.post("/recipes/:id/:idd/favorites/delete", middleware.isLoggedIn, middleware.checkFavorites, function(req, res){
    if(req.user.slug === req.params.idd){
        Favorites.findByIdAndDelete(req.params.id, function(err){
            if(err){
                req.flash("error", err);
                res.redirect("/kk/recipes");
            } else {
                req.flash("success", "Favorite Deleted");
                res.redirect("back");
            };
        });
    };
});

router.post("/recipes/:id/favorites", function(req, res){
    req.flash("error", "Login");
    res.redirect("/kk/login");
});

router.get("/user/:id/favorites", middleware.isLoggedIn, function(req, res){
    if(req.user.slug === req.params.id){
        User.findOne({"slug": req.params.id}).populate("favorites").exec(function(err, user){
            if(err || !user){
                req.flash("error", "Something went wrong.");
                return res.redirect("/kk/recipes");
            } else {
                res.render("kk/user/favorites", {user: user, kind: "All"});
            };
        });
    } else{
        req.flash("error", "Something went wrong.");
        res.redirect("/kk/recipes");
    };
});

module.exports = router;