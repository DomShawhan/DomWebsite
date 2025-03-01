const express = require("express"),
    router = express.Router(),
    async = require("async"),
    nodemailer = require("nodemailer");

const middleware = require("../middleware"),
    messages = require("../functions/messages");

const Recipe = require("../models/recipes"),
    Share = require("../models/share"),
    User = require("../models/authentication");
//share recipe
router.post("/recipes/:id/share", middleware.checkRecipeOwnership, (req, res) => {
    Recipe.findOne({"slug": req.params.id}).then(async (err, recipe) => {
        const doesUserExit = await User.exists({"email": req.body.email});
        if(doesUserExit === true) {
            if(!recipe.shared) {
                recipe.shared = [];
            };
            if(recipe.shared.includes({"userEmail": req.body.email})) {
                req.flash("error", "You have already shared this recipe with " + req.body.email);
                res.redirect("back");
            } else {
                User.findOne({"email": req.body.email}).then((check)=> {
                    check.shared = [];
                    check.shared.push({recipeSlug: recipe.slug, recipeTitle: recipe.title});
                    check.save();
                    recipe.shared.push({userEmail: check.email});
                    recipe.save();
                    messages.create(req, res, check.slug, "<em>" + req.user.username + "</em>" + " shared <a href=\"/kk/recipes/show/"+ recipe.slug+ "\">" + recipe.title + "</a> with you.");
                    req.flash("success", "You have successfully shared this recipe with " +  req.body.email);
                    return res.redirect("back");
                }).catch(err => {
                    req.flash("error", err.message);
                    res.redirect("back");
                });
            };
        } else {
            let newShare = {
                from: req.user.email,
                to: req.body.email,
                toHasAccount: false,
                allRecipes: false,
                recipeSlug: recipe.slug,
                recipeTitle: recipe.title
            }
            if(Share.exists(newShare) === true) {
                Share.deleteMany(newShare);
            } else {
                if(!recipe.shared) {
                    recipe.shared = [];
                };
                recipe.shared.push({userEmail: req.body.email});
                recipe.save();
            }
            Share.create(newShare).then((share) => {
                async.waterfall([
                    (user, done) => {
                        var smtpTransport = nodemailer.createTransport({
                            service: process.env.EMAILSERVICE,
                            port: 587,
                            secure: true,
                            auth: {
                            user: process.env.EMAIL,
                            pass: process.env.EMAILPASS
                            }
                        });
                        var mailOptions = {
                            to: req.body.email,
                            from: process.env.EMAIL,
                            subject: "Invitation for a recipe share from " + recipe.author.username,
                            html: "Hello, <br><br>" + recipe.author.username + " has shared " + recipe.title + " with you on Kramped Kookbook. Create an account with your email <a href='http://" + req.headers.host + "/kk/register'>here</a> and you will be able to view the recipe. <br><br> Regards,<br><br> Kramped Kookbook"
                        };
                        smtpTransport.sendMail(mailOptions, (err) => {
                            req.flash("success", "Your share invite has been sent!");
                            res.redirect("/kk/recipes/show/" + req.params.id);
                            done(err, "done");
                        });
                    }
                ], (err) => {
                    if(err) { req.flash("error", err); console.log(err); return res.redirect("/kk/recipes")}
                    res.redirect("/kk/recipes/show/" + req.params.id);
                });
            }).catch(err => {
                req.flash("error", err.message);
                res.redirect("back");
            });
        };
    }).catch(err => {
        req.flash("error", err.message);
        res.redirect("back");
    });
});
//GET ALL SHARED RECIPES
router.get("/user/shared", middleware.isLoggedIn, (req, res) => {
    User.findOne({"slug": req.user.slug}).then(async(user) => {
        let recip = new Array;
        if(user.allShared.length > 0) {
            for(let j = 0; j < user.allShared.length; j++) {
                Recipe.find({"author.slug": user.allShared[j].userSlug}).then(async(recs) => {
                    for (let i = 0; i < recs.length; i++) {
                        recip.push(recs[i]);
                    };
                    if(j === (user.allShared.length - 1)) {
                        res.render("kk/user/share", {user: user, recipes: recip }); 
                    };
                }).catch(err => {
                    req.flash("error", err.message);
                    res.redirect("back");
                });
            };
        } else {
            res.render("kk/user/share", {user: user, recipes: [] });   
        };
    }).catch(err => {
        req.flash("error", err.message);
        res.redirect("back");
    });
});
//share all recipes
router.post("/recipe/:id/shared/:email", middleware.checkRecipeOwnership, async(req, res) => {
    Recipe.findOne({"slug": req.params.id}).then(async (recipe) => {
        if(!recipe) {
            return res.send("Error: Recipe not found");
        } else {
            let doesUserExist = await User.exists({"email": req.params.email});
            if(doesUserExist === true) {
                User.findOne({"email": req.params.email}).then((user) => {
                    if(!user) {
                        return res.send("Error: Email not found");
                    } else {
                        for(let i = 0; i < user.shared.length; i++) {
                            if(user.shared[i].recipeSlug === req.params.id) {
                                user.shared.splice(i, 1);
                                i--;
                            };
                        };
                        for(let i = 0; i < recipe.shared.length; i++) {
                            if(recipe.shared[i].userEmail === req.params.email) {
                                recipe.shared.splice(i, 1);
                                i--;
                            };
                        };
                        messages.create(req, res, user.slug,"<em>" + req.user.username + "</em>" + " stopped sharing " + recipe.title + " with you.");
                        user.save();
                        recipe.save();
                        return res.send("deleted");
                    };
                }).catch(err => {
                    return res.send("Error: Email not found");
                });
            } else {
                for(let i = 0; i < recipe.shared.length; i++) {
                    if(recipe.shared[i].userEmail === req.params.email) {
                        recipe.shared.splice(i, 1);
                        i--;
                    };
                };
                recipe.save();
                if(Share.exists({"recipeSlug": req.params.id, "to": req.params.email})) {
                    Share.deleteOne({"recipeSlug": req.params.id, "to": req.params.email}).catch((err) => {
                        if(err) {
                            return res.send("Error: Recipe not found");
                        };
                    });
                };
                return res.send("deleted");
            };
        };
    }).catch(err => {
        return res.send("Error: Recipe not found");
    });
});
//SHARE ALL
router.post("/recipes/share/all", middleware.isLoggedIn, async (req, res) => {
    let doesUserExist = await User.exists({"email": req.body.email});
    if(doesUserExist === true) {
        User.findOne({"email": req.body.email}).then((user) => {
            if(!user.allShared) {
                user.allShared = [];
            };
            if(!req.user.recSharedWith) {
                req.user.recSharedWith = [];
            }
            user.allShared.push({userSlug: req.user.slug, userEmail: req.user.email});
            user.save();
            req.user.recSharedWith.push({userEmail: user.email});
            req.user.save();
            messages.create(req, res, user.slug, "<em>" + req.user.username + "</em>" + " shared all of their recipes with you.");
            req.flash("success", "You have shared all your recipes with " + user.email);
            return res.redirect("back");
        }).catch(err => {
            req.flash("error", err.message);
            res.redirect("back");
        });
    } else {
        let newShare = {
            from: req.user.email,
            to: req.body.email,
            fromSlug: req.user.slug, 
            toHasAccount: false,
            allRecipes: true
        }
        let doesShareExist = await Share.exists(newShare);
        if(doesShareExist === true) {
            Share.deleteMany(newShare).catch((err)=> {
                req.flash("error", err.message);
                res.redirect("back");
            });
        } else {
            User.findOne({"slug": req.user.slug}).then((user) => {
                    if(!user.recSharedWith) {
                        user.recSharedWith = [];
                    }
                    user.recSharedWith.push({userEmail: req.body.email});
                    user.save();
            }).catch(err => {
                req.flash("error", err.message);
                res.redirect("back");
            });
        };
        Share.create(newShare).then((share) => {
            async.waterfall([
                (user, done) => {
                    var smtpTransport = nodemailer.createTransport({
                        service: process.env.EMAILSERVICE,
                        port: 587,
                        secure: true,
                        auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAILPASS
                        }
                    });
                    console.log("here")
                    var mailOptions = {
                        to: req.body.email,
                        from: process.env.EMAIL,
                        subject: "Invitation for a recipe share from " + req.user.username,
                        html: "Hello, <br><br>" + req.user.username + " has shared all of their recipes with you on Kramped Kookbook. Create an account with your email <a href='http://" + req.headers.host + "/kk/register'>here</a> and you will be able to view the recipe. <br><br> Regards,<br><br> Kramped Kookbook"
                    };
                    smtpTransport.sendMail(mailOptions, (err) => {
                        req.flash("success", "Your share invite has been sent!");
                        res.redirect("back");
                        done(err, "done");
                    });
                }
            ], (err) => {
                if(err) { req.flash("error", err); console.log(err); return res.redirect("/kk/recipes")}
                res.redirect("/kk/recipes/show/" + req.params.id);
            });
        }).catch(err => {
            req.flash("error", err.message);
            res.redirect("back");
        });
    };
});
//DELETE ALL SHARED RECIPES
router.post("/recipes/share/all/delete/:id", middleware.isLoggedIn, async (req, res)=> {
    let doesUserExist = await User.exists({"email": req.params.id});
    if(doesUserExist === true) {
        User.findOne({"email": req.params.id}).then((user) => {
            for(let i = 0; i < user.allShared.length; i++) {
                if(user.allShared[i].userEmail === req.user.email) {
                    user.allShared.splice(i, 1);
                    i--;
                };
            };
            user.save();
            for (let i = 0; i < req.user.recSharedWith.length; i++) {
                const recShared = req.user.recSharedWith[i];
                if(recShared.userEmail === user.email) {
                    req.user.recSharedWith.splice(i, 1);
                    i--;
                };
            };
            req.user.save();
            res.send("success");
        }).catch(err => {
            res.send(err.message);
        });
    } else {
        let doesShareExist = await Share.exists({"to": req.params.id});
        if (doesShareExist === true) {
            Share.deleteMany({"to": req.params.id}).then(() => {
                for (let i = 0; i < req.user.recSharedWith.length; i++) {
                    const recShared = req.user.recSharedWith[i];
                    if(recShared.userEmail === req.params.id) {
                        req.user.recSharedWith.splice(i, 1);
                        i--;
                    };
                };
                req.user.save();
                res.send("success");
            }).catch(err => {
                res.send(err.message);
            });
        } else {
            res.send("You have not shared your recipes with that user.");
        };
    };
});

module.exports = router;