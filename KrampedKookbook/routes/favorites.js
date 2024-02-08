const express = require("express"),
    router = express.Router();

const Recipe = require("../models/recipes"),
    middleware = require("../middleware"),
    Favorites = require("../models/favorites"),
    User = require("../models/authentication");
//create new favorite
router.post("/recipes/:id/favorites", middleware.isLoggedIn, function(req, res){
    Recipe.findOne({"slug": req.params.id}, function(err, recipe){
        if(err || !recipe){
            req.flash("error", "Something went wrong.");
            return res.redirect("/kk/recipes");
        } else {
            User.findOne({"slug": req.user.slug}, function(err, user){
                if(err || !user){
                    req.flash("error", "Something went wrong.");
                    return res.redirect("/kk/recipes");
                } else {
                    const fav = {recipe_id: recipe.slug, recipe_name: recipe.title};
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
//delete favorite
router.post("/recipes/:id/favorites/delete", middleware.isLoggedIn, middleware.checkFavorites, function(req, res){
    Favorites.findByIdAndDelete(req.params.id, function(err){
        if(err){
            req.flash("error", err);
            res.redirect("/kk/recipes");
        } else {
            req.flash("success", "Favorite Deleted");
            res.redirect("back");
        };
    });
});
//get all user favorites
router.get("/user/favorites", middleware.isLoggedIn, function(req, res){
    User.findOne({"slug": req.user.slug}).populate("favorites").exec(function(err, user){
        if(err || !user){
            req.flash("error", "Something went wrong.");
            return res.redirect("/kk/recipes");
        } else {
            res.render("kk/user/favorites", {user: user, kind: "All"});
        };
    });
});

module.exports = router;