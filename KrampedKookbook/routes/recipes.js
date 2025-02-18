const express = require("express"),
   router = express.Router();

const Recipe = require("../models/recipes"),
    User = require("../models/authentication");

const middleware = require("../middleware");

//Index
router.get("/", (req, res) => {
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

    Recipe.find({"public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).then((found) => {
        Recipe.countDocuments({"public": true}).then((count) => {
            console.log(found);
            res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: [] });
        }).catch((err) => {
            if(err){
                res.send(err);
            }
        });
    }).catch((err) => {
        if(err){
            res.send(err);
        }
    });
});
//search
router.get("/search/", (req, res) => {
    Recipe.find({"title" : { "$regex": req.query.search, "$options": "i" }, "public": true}).then((recipes) => {
        res.render("kk/recipes/search", {recipes: recipes, search: req.query.search});
    }).catch((err) => {
        if(err){
            req.flash("error", "Something Went Wrong");
            res.redirect("/kk/recipes");
        }
    });
});
//sort by type
router.get("/sort/:id", (req, res) => {
    if(req.params.id == "Appetizer" || req.params.id == "Bread" || req.params.id == "Dessert" || req.params.id == "Icing" || req.params.id == "Main") {
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
        Recipe.find({"type" : req.params.id, "public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).then((found) => {
            Recipe.countDocuments({"type" : req.params.id, "public": true}).then((count) => {
                res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.id, special: []});
            }).catch((err) => {
                if(err){
                    req.flash("error", "Something Went Wrong");
                    res.redirect("/kk/recipes");
                }
            });
        }).catch((err) => {
            if(err){
                req.flash("error", "Something Went Wrong");
                res.redirect("/kk/recipes");
            }
        });
    } else {
        res.redirect("/kk/recipes");
    };
});
//sort by type and attribute
router.get("/sort/:id/:di", (req, res) => {
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
            Recipe.find({"type": req.params.id, [req.params.di]: true, "public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).then((found) => {
                Recipe.countDocuments({"type": req.params.id, "gluten": true, "public": true}).exec((count) => {
                    res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: req.params.id, special: req.params.di});
                }).catch((err) => {
                    if(err){
                        req.flash("error", "Something Went Wrong");
                        res.redirect("/kk/recipes");
                    }
                });
            }).catch((err) => {
                if(err){
                    req.flash("error", "Something Went Wrong");
                    res.redirect("/kk/recipes");
                }
            });
        } else {
            res.redirect("/kk/recipes");
        };
    }else {
        res.redirect("/kk/recipes");
    };
});
//sort by attribute
router.get("/sor/:di", (req, res) => {
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
        Recipe.find({[req.params.di]: true, "public": true}).sort("normal").skip((perPage * pageNumber) - perPage).limit(perPage).then((found) => {
            Recipe.countDocuments({"gluten": true, "public": true}).then((count) => {
                res.render("kk/recipes/index", {recipes: found, perPage: perPage, current: pageNumber, pages: Math.ceil(count / perPage), kind: "All", special: req.params.di});
            }).catch((err) => {
                if(err){
                    req.flash("error", "Something Went Wrong");
                    res.redirect("/kk/recipes");
                }
            });
        }).catch((err) => {
        if(err){
            req.flash("error", "Something Went Wrong");
            res.redirect("/kk/recipes");
        }
    }).catch((err) => {
        if(err){
            req.flash("error", "Something Went Wrong");
            res.redirect("/kk/recipes");
        }
    });
    } else {
        res.redirect("/kk/recipes");
    };
});
//New
router.get("/new/new", middleware.isLoggedIn, (req, res) => {
    res.render("kk/recipes/new");
});
//Create
router.post("/", middleware.isLoggedIn, (req, res) => {
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
    Recipe.create(newRecipe).then((newRecipe) => {
        req.flash("success", "Recipe Created");
        res.redirect("/kk/recipes/" + newRecipe.slug + "/ask");
    }).catch((err) => {
        if(err){
            req.flash("error", "Something Went Wrong");
            res.redirect("/kk/recipes");
        }
    });
});

//Show
router.get("/show/:id", (req, res) => {
    Recipe.findOne({"slug": req.params.id}).populate("ingredients").populate("comments").populate("img").then((found) => {
            if(found.public === true) {
                if(req.user) {
                    User.findOne({"username": req.user.username}).populate("favorites").then((user) => {
                        res.render("kk/recipes/show", {recipe: found, user: user});
                    }).catch((err) => {
                        req.flash("error", err);
                        return res.redirect("/kk/recipes");
                    });
                } else{
                    res.render("kk/recipes/show", {recipe: found});
                };
            } else if(req.user) { 
                if(found.author.id.equals(req.user._id)){
                    User.findOne({"username": req.user.username}).populate("favorites").then((user) => {
                        res.render("kk/recipes/show", {recipe: found, user: user});
                    }).catch((err) => {
                        req.flash("error", err);
                        return res.redirect("/kk/recipes");
                    });;
                } else if(found.shared.some(foun => foun.userEmail === req.user.email)) {
                    User.findOne({"username": req.user.username}).populate("favorites").then((user) => {
                        res.render("kk/recipes/show", {recipe: found, user: user});
                    }).catch((err) => {
                        req.flash("error", err);
                        return res.redirect("/kk/recipes");
                    });
                } else if(req.user.allShared.some(allShare => allShare.userSlug === found.author.slug)) {
                    User.findOne({"username": req.user.username}).populate("favorites").then((user) => {
                            res.render("kk/recipes/show", {recipe: found, user: user});
                    }).catch((err) => {
                        req.flash("error", err);
                        return res.redirect("/kk/recipes");
                    });
                } else {
                    res.redirect("/kk/recipes");
                }
            } else {
                res.redirect("/kk/recipes");
            };
    }).catch((err) => {
        req.flash("error", err);
        return res.redirect("/kk/recipes");
    });
});
//Edit
router.get("/:id/edit", middleware.checkRecipeOwnership, (req, res) => {
    Recipe.findOne({"slug": req.params.id}).then((found) => {
        res.render("kk/recipes/edit", {recipe: found});
    }).catch((err) => {
        req.flash("error", "Item not found.");
        return res.redirect("/kk/recipes");
    });;
});

module.exports = router;