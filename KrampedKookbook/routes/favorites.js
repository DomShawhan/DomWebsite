const express = require("express"),
    router = express.Router();

const Recipe = require("../models/recipes"),
    middleware = require("../middleware"),
    Favorites = require("../models/favorites"),
    User = require("../models/authentication");
//create new favorite
router.post("/recipes/:id/favorites", middleware.isLoggedIn, (req, res) => {
    Recipe.findOne({"slug": req.params.id}).then((recipe) =>{
        if(!recipe){
            req.flash("error", "Something went wrong.");
            return res.redirect("/kk/recipes");
        } else {
            User.findOne({"slug": req.user.slug}).then((user) => {
                if(!user){
                    req.flash("error", "Something went wrong.");
                    return res.redirect("/kk/recipes");
                } else {
                    const fav = {recipe_id: recipe.slug, recipe_name: recipe.title};
                    Favorites.create(fav).then((favorite) => {
                        user.favorites.push(favorite);
                        user.save();
                        req.flash("success", "Added to favorites");
                        res.redirect("back");
                    }).catch(err => {
                        req.flash("error", "Something went wrong.");
                        res.redirect("/kk/recipes");
                    });
                };
            }).catch(err => {
                req.flash("error", "Something went wrong.");
                return res.redirect("/kk/recipes");
            });
        };
    }).catch(err => {
        req.flash("error", "Something went wrong.");
        return res.redirect("/kk/recipes");
    });
});
//delete favorite
router.post("/recipes/:id/favorites/delete", middleware.isLoggedIn, middleware.checkFavorites, (req, res) => {
    Favorites.findByIdAndDelete(req.params.id).then(() => {
        req.flash("success", "Favorite Deleted");
        res.redirect("back");
    }).catch(err => {
        req.flash("error", err);
        res.redirect("/kk/recipes");
    });
});
//get all user favorites
router.get("/user/favorites", middleware.isLoggedIn, (req, res) => {
    User.findOne({"slug": req.user.slug}).populate("favorites").exec().then((user) => {
        if(!user){
            req.flash("error", "Something went wrong.");
            return res.redirect("/kk/recipes");
        } else {
            res.render("kk/user/favorites", {user: user, kind: "All"});
        };
    }).catch(err => {
        req.flash("error", "Something went wrong.");
        return res.redirect("/kk/recipes");
    });
});

module.exports = router;