const express = require("express"),
   router = express.Router();

const Recipe = require("../models/recipes"),
    User = require("../models/authentication");

const middleware = require("../middleware");

//Index
router.get("/", function(req, res){
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
//search
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
//sort by type
router.get("/sort/:id", function(req, res){
    if(req.params.id == "Appetizer" || req.params.id == "Bread" ||req.params.id == "Dessert" ||req.params.id == "Icing" || req.params.id == "Main") {
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
//sort by type and attribute
router.get("/sort/:id/:di", function(req, res){
    if(req.params.id == "Appetizer" || req.params.id == "Bread" ||req.params.id == "Dessert" ||req.params.id == "Icing" || req.params.id == "Main") {
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
//sort by attribute
router.get("/sor/:di", function(req, res){
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
//Create
router.post("/", middleware.isLoggedIn, function(req, res){
    req.body.recipe.description = req.sanitize(req.body.recipe.description);
    req.body.recipe.directions = req.sanitize(req.body.recipe.directions);
    const title = req.body.recipe.title,
        type = req.body.recipe.type;
        author = {
            id: req.user._id,
            username: req.user.username,
            slug: req.user.slug,
            img: req.user.img.img
        },
        normal = title.toLowerCase(),
        description = req.body.recipe.description,
        directions = req.body.recipe.directions,
        public = req.body.recipe.public,
        serves = req.body.recipe.serves,
        gluten = req.body.recipe.gluten ? true : false,
        dairy = req.body.recipe.dairy ? true : false,
        vegan = req.body.recipe.vegan ? true : false,
        vegetarian = req.body.recipe.vegetarian ? true : false,
        createdby = req.body.recipe.createdby,
        ingredient = [];
    if(typeof req.body.recipe.ingredient_amount === "string") {
        const ingreObj = {
            amount: req.body.recipe.ingredient_amount,
            name: req.body.recipe.ingredient_name
        };
        ingredient.push(ingreObj);
    } else {
        for(let i = 0; i < req.body.recipe.ingredient_amount.length; i++) {
            const ingreObj = {
                amount: req.body.recipe.ingredient_amount[i],
                name: req.body.recipe.ingredient_name[i]
            };
            ingredient.push(ingreObj);
        };
    };
    const newRecipe = { file: "type", normal: normal, shared: [], createdby: createdby, title: title, type: type, author: author,  description: description,  directions: directions, serves: serves, public: public, gluten: gluten, dairy: dairy, vegan: vegan, vegetarian: vegetarian, img: [], ingredients: ingredient };
    Recipe.create(newRecipe, function(err, newRecipe){
        if(err){
            req.flash("error", "Something went wrong.");
            return res.redirect("back");
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
                if(found.author.id.equals(req.user._id)){
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