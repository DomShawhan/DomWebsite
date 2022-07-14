var express = require("express");
var router = express.Router();

var Recipe = require("../models/recipes");
var middleware = require("../middleware");
var User = require("../models/authentication");
var Comment = require("../models/comments");
var Favorites = require("../models/favorites");
var fs = require("fs");
var path = require("path");

//Index
router.get("/", function(req, res){
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
    Recipe.find({"public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
        Recipe.countDocuments({"public": true}).exec(function (err, count) {
            if(err){
                res.send(err);
            } else {
                res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: [] });
            };
        });
    });
});

router.get("/search/", function(req, res){
    Recipe.find({"title" : { "$regex": req.query.search, "$options": "i" }, "public": true}, function(err, recipes){
        if(err){
            req.flash("error", "Something Went Wrong");
            res.redirect("/kk/recipes");
        } else {
            res.render("kk/recipes/search", {recipes: recipes, search: req.query.search});
        };
    });
});

router.get("/sort/:id", function(req, res){
    if(req.params.id == "Appetizer" || req.params.id == "Bread" ||req.params.id == "Dessert" ||req.params.id == "Icing" || req.params.id == "Main") {
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
        Recipe.find({"type" : req.params.id, "public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
            Recipe.countDocuments({"type" : req.params.id, "public": true}).exec(function (err, count) {
                if(err){
                    req.flash("error", err)
                    res.redirect("/kk/recipes");
                } else {
                    res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.id, special: []});
                };
            });
        });
    } else {
        res.redirect("/kk/recipes");
    };
});

router.get("/sort/:id/:di", function(req, res){
    if(req.params.id == "Appetizer" || req.params.id == "Bread" ||req.params.id == "Dessert" ||req.params.id == "Icing" || req.params.id == "Main") {
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
                Recipe.find({"type": req.params.id, "gluten": true, "public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                    Recipe.countDocuments({"type": req.params.id, "gluten": true, "public": true}).exec(function (err, count) {
                        if(err){
                            req.flash("error", err)
                            res.redirect("/kk/recipes");
                        } else {
                            res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.id, special: req.params.di});
                        };
                    });
                });
            } else if(req.params.di == "dairy") {
                Recipe.find({"type": req.params.id, "dairy": true, "public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                    Recipe.countDocuments({"type": req.params.id, "dairy": true, "public": true}).exec(function (err, count) {
                        if(err){
                            req.flash("error", err)
                            res.redirect("/kk/recipes");
                        } else {
                            res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.id, special: req.params.di});
                        };
                    });
                });
            } else if(req.params.di == "vegan") {
                Recipe.find({"type": req.params.id, "vegan": true, "public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                    Recipe.countDocuments({"type": req.params.id, "vegan": true, "public": true}).exec(function (err, count) {
                        if(err){
                            req.flash("error", err)
                            res.redirect("/kk/recipes");
                        } else {
                            res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.id, special: req.params.di});
                        };
                    });
                });
            } else if(req.params.di == "vegetarian") {
                Recipe.find({"type": req.params.id, "vegetarian": true, "public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                    Recipe.countDocuments({"type": req.params.id, "vegetarian": true, "public": true}).exec(function (err, count) {
                        if(err){
                            req.flash("error", err)
                            res.redirect("/kk/recipes");
                        } else {
                            res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.id, special: req.params.di});
                        };
                    });
                });
            };
        } else {
            res.redirect("/kk/recipes");
        };
    }else {
        res.redirect("/kk/recipes");
    };
});

router.get("/sor/:di", function(req, res){
    var di = req.params.di;
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
    if(req.params.di == "gluten" || req.params.di == "dairy" || req.params.di == "vegan" || req.params.di == "vegetarian") {
        if(req.params.di == "gluten") {
            Recipe.find({"gluten": true, "public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                Recipe.countDocuments({"gluten": true, "public": true}).exec(function (err, count) {
                    if(err){
                        req.flash("error", err)
                        res.redirect("/kk/recipes");
                    } else {
                        res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: req.params.di});
                    };
                });
            });
        } else if(req.params.di == "dairy") {
            Recipe.find({"dairy": true, "public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                Recipe.countDocuments({"dairy": true, "public": true}).exec(function (err, count) {
                    if(err){
                        req.flash("error", err)
                        res.redirect("/kk/recipes");
                    } else {
                        res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: req.params.di});
                    };
                });
            });
        } else if(req.params.di == "vegan") {
            Recipe.find({"vegan": true, "public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                Recipe.countDocuments({"vegan": true, "public": true}).exec(function (err, count) {
                    if(err){
                        req.flash("error", err)
                        res.redirect("/kk/recipes");
                    } else {
                        res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: req.params.di});
                    };
                });
            });
        } else if(req.params.di == "vegetarian") {
            Recipe.find({"vegetarian": true, "public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, found) {
                Recipe.countDocuments({"vegetarian": true, "public": true}).exec(function (err, count) {
                    if(err){
                        req.flash("error", err)
                        res.redirect("/kk/recipes");
                    } else {
                        res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: req.params.di});
                    };
                });
            });
        };
    } else {
        res.redirect("/kk/recipes");
    };
});
//New
router.get("/new/new", middleware.isLoggedIn, function(req, res){
    res.render("kk/recipes/new");
});

router.post("/", middleware.isLoggedIn, function(req, res){
    req.body.recipe.description = req.sanitize(req.body.recipe.description);
    req.body.recipe.directions = req.sanitize(req.body.recipe.directions);
    var title = req.body.recipe.title;
    var type = req.body.recipe.type;
    var author = {
        id: req.user._id,
        username: req.user.username,
        slug: req.user.slug,
        img: req.user.img.img
    };
    var normal = title.toLowerCase();
    var description = req.body.recipe.description;
    var directions = req.body.recipe.directions;
    var public = req.body.recipe.public;
    var serves = req.body.recipe.serves;
    var gluten = req.body.recipe.gluten ? true : false;
    var dairy = req.body.recipe.dairy ? true : false;
    var vegan = req.body.recipe.vegan ? true : false;
    var vegetarian = req.body.recipe.vegetarian ? true : false;
    var createdby = req.body.recipe.createdby;
    var ingredient = [];
    if(typeof req.body.recipe.ingredient_amount === "string") {
        var ingreObj = {
            amount: req.body.recipe.ingredient_amount,
            name: req.body.recipe.ingredient_name
        };
        ingredient.push(ingreObj);
    } else {
        for(var i = 0; i < req.body.recipe.ingredient_amount.length; i++) {
            var ingreObj = {
                amount: req.body.recipe.ingredient_amount[i],
                name: req.body.recipe.ingredient_name[i]
            };
            ingredient.push(ingreObj);
        };
    };
    var newRecipe = { file: "type", normal: normal, shared: [], createdby: createdby, title: title, type: type, author: author,  description: description,  directions: directions, serves: serves, public: public, gluten: gluten, dairy: dairy, vegan: vegan, vegetarian: vegetarian, img: [], ingredients: ingredient };
    Recipe.create(newRecipe, function(err, newRecipe){
        if(err){
            req.flash("error", "Something went wrong.");
            res.redirect("back");
        } else {
            req.flash("success", "Recipe Created");
            res.redirect("/kk/recipes/" + newRecipe.slug + "/ask");
        };
    });
});

//Show
router.get("/show/:id", function(req,res){
    Recipe.findOne({"slug": req.params.id}).populate("ingredients").populate("comments").populate("img").exec(function(err, found){
        if(err || !found) {
            req.flash("error", err);
            return res.redirect("/kk/recipes");
        } else {
            if(found.public === true) {
                if(req.user){
                    User.findOne({"username": req.user.username}).populate("favorites").exec(function(err, user){
                        if(err){
                            req.flash("error", err);
                            return res.redirect("back");
                        } else {
                            res.render("kk/recipes/show", {recipe: found, user: user});
                        };
                    });
                } else{
                    res.render("kk/recipes/show", {recipe: found});
                };
            } else if(req.user) { 
                if(found.author.id.equals(req.user._id) || req.user.type === "mantainer"){
                    User.findOne({"username": req.user.username}).populate("favorites").exec(function(err, user){
                        if(err){
                            req.flash("error", err);
                            return res.redirect("back");
                        } else {
                            res.render("kk/recipes/show", {recipe: found, user: user});
                        };
                    });
                } else if(found.shared.some(foun => foun.userEmail === req.user.email)) {
                    User.findOne({"username": req.user.username}).populate("favorites").exec(function(err, user){
                        if(err){
                            req.flash("error", err);
                            return res.redirect("back");
                        } else {
                            res.render("kk/recipes/show", {recipe: found, user: user});
                        };
                    });
                } else if(req.user.allShared.some(allShare => allShare.userSlug === found.author.slug)) {
                    User.findOne({"username": req.user.username}).populate("favorites").exec(function(err, user){
                        if(err){
                            req.flash("error", err);
                            return res.redirect("back");
                        } else {
                            res.render("kk/recipes/show", {recipe: found, user: user});
                        };
                    });
                } else {
                    res.redirect("/kk/recipes");
                }
            } else {
                res.redirect("/kk/recipes");
            };
        };
    });
});
//Edit
router.get("/:id/edit", middleware.checkRecipeOwnership, function(req, res){
    Recipe.findOne({"slug": req.params.id}, function(err, found){
        if(err || !found) {
            req.flash("error", "Item not found.");
            return res.redirect("/kk/recipes");
        } else {
            res.render("kk/recipes/edit", {recipe: found});
        };
    });
});

module.exports = router;