var express = require("express"),
  methodOverride = require("method-override"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  User = require("./models/authentication"),
  Favorites = require("./models/favorites"),
  Comment = require("./models/comments"),
  Share = require("./models/share"),
  Recipe = require("./models/recipes"),
  flash = require("connect-flash"),
  expressSanitizer = require("express-sanitizer"),
  async = require("async"),
  cookieParser = require("cookie-parser");

var recipeRoutes = require("./routes/recipes"),
    indexRoutes = require("./routes/authentication"),
    favoriteRoutes = require("./routes/favorites"),
    shareRoutes = require("./routes/share"),
    commentRoutes = require("./routes/comment");
    
var middleware = require("./middleware");
var app = module.exports = express();

require('dotenv/config'); 

const mongoSanitize = require('express-mongo-sanitize');
const {storage} = require('../cloudinary');
const {cloudinary} = require('../cloudinary');
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(process.env.DatabaseDP);
app.use(flash());
app.use(cookieParser());
app.locals.moment = require('moment');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(mongoSanitize());
app.use(expressSanitizer());
app.use(methodOverride("_method"));

app.use(require("express-session")({
    secret: "I am cool",
    resave: false,
    saveUninitialized: false
}));

var fs = require('fs'); 
var path = require('path'); 
var multer = require('multer');
const { inflate } = require("zlib");
  
var upload = multer({ storage }); 

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
/*User.find({}, (err, users) => {
    users.forEach((user, i) => {
        user.img = {};
        user.img.img = "https://res.cloudinary.com/dbf3twqu3/image/upload/v1622858258/KrampedKookbook/Screenshot_2021-06-04_215236_2_awi0kl.jpg";
        user.img.filename = "KrampedKookbook/Screenshot_2021-06-04_215236_2_awi0kl";

        if(i === users.length - 1) {
            console.log("finished")
        }
    })

    Recipe.find({}, (err, recipes) => {
        recipes.forEach((recipe, i) => {
            users.forEach(user => {
                if(recipe.author.slug === user.slug) {
                    recipe.author.img = user.img.img;
                    recipe.save();
                }
            })
        })
    })
})*/

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});  

app.get("/", function(req, res){
    res.render("kkstart");
});

app.post("/recipes/file", upload.array("recipe[pics]", 5), middleware.isLoggedIn, async (req, res) => {
    req.body.recipe.description = req.sanitize(req.body.recipe.description);
    var title = req.body.recipe.title;
    var normal = title.toLowerCase();
    var type = req.body.recipe.type;
    var author = {
        id: req.user._id,
        username: req.user.username,
        slug: req.user.slug,
        img: req.user.img.img
    };
    var serves = req.body.recipe.serves;
    var description = req.body.recipe.description;
    var public = req.body.recipe.public;
    var createdby = req.body.recipe.createdby;
    var gluten = req.body.recipe.gluten ? true : false;
    var dairy = req.body.recipe.dairy ? true : false;
    var vegan = req.body.recipe.vegan ? true : false;
    var vegetarian = req.body.recipe.vegetarian ? true : false;

    var newRecipe = { pics: [], normal: normal, shared: [], file: "image", createdby: createdby, title: title, serves: serves, type: type, author: author,  description: description, public: public, gluten: gluten, dairy: dairy, vegan: vegan, vegetarian: vegetarian, img: []};
    Recipe.create(newRecipe, async function(err, newRecipe){
        if(err){
            req.flash("error", "Something went wrong.");
            res.redirect("back");
        } else {
            if(req.files) {
                const pics = req.files.map(f => ({img: f.path, filename: f.filename}));
                newRecipe.pics.push(...pics);
                await newRecipe.save();
            }
            req.flash("success", "Recipe Created");
            res.redirect("/kk/recipes/" + newRecipe.slug + "/ask");
        };
    });
});

app.put("/recipes/:id", upload.array("recipe[pics]", 5), middleware.checkRecipeOwnership,  async (req, res) => {
    req.body.recipe.description = req.sanitize(req.body.recipe.description);
    req.body.recipe.directions = req.sanitize(req.body.recipe.directions);
    var normal = req.body.recipe.title.toLowerCase();
    var ingredient = [],
        recipeUpdate = {
            title: req.body.recipe.title,
            normal: normal,
            type: req.body.recipe.type,
            description: req.body.recipe.description,
            public: req.body.recipe.public,
            serves: req.body.recipe.serves,
            gluten: req.body.recipe.gluten ? true : false,
            dairy: req.body.recipe.dairy ? true : false,
            vegan: req.body.recipe.vegan ? true : false,
            vegetarian: req.body.recipe.vegetarian ? true : false
        };
    Recipe.findOne({"slug": req.params.id}, async (err, recipe) => {
        if(recipe.file === "type") {
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
            var directions = req.body.recipe.directions;
            recipeUpdate.directions = directions;
            recipeUpdate.ingredients = ingredient;
        } else if(recipe.file === "image") {
            if(req.body.picsDel) {
                if(typeof req.body.picsDel !== "string") {
                    for (let filename of req.body.picsDel) {
                        await cloudinary.uploader.destroy(filename, (err) => {
                            if(err) {
                                console.log(err);
                            };
                        });
                    };
                } else {
                    await cloudinary.uploader.destroy(req.body.picsDel, (err) => {
                        if(err) {
                            console.log(err);
                        };
                    });
                }
                await recipe.updateOne({ $pull: { pics: { filename: { $in: req.body.picsDel }}}})
            };
        };

        Recipe.updateOne({"slug": req.params.id}, recipeUpdate, async function(err, updater){
            if(err) {
                req.flash("error", "Item not found.");
                res.redirect("/kk/recipes");
            } else {
                if(req.files) {
                    const pics = req.files.map(f => ({img: f.path, filename: f.filename}));
                    recipe.pics.push(...pics);
                    await recipe.save();
                };
                req.flash("success", "Recipe Edit Completed");
                res.redirect("/kk/recipes/show/" + req.params.id);
            };
        });
    });
});

app.get("/recipes/:id/ask", middleware.checkRecipeOwnership, function(req,res) {
    Recipe.findOne({"slug": req.params.id}, function(err, found){
        if(err) {
            req.flash("error", "Item not found.");
            res.redirect("/kk/recipes");
        } else {
            if (!found) {
                req.flash("error", "Recipe not found");
                res.redirect("back");
            } else {
                if(found.img.length < 5) {
                    res.render("kk-images/ask", { recipe: found });
                } else {
                    req.flash("error", "There are the max number of images already.")
                    res.redirect("/kk/recipes/show/" + found.slug);
                };
            };
        };
    });
});

app.get("/recipes/:id/image/new", middleware.checkRecipeOwnership, function(req, res){
    Recipe.findOne({"slug": req.params.id}, function(err, found){
        if (err) {
            req.flash("error", "Item not found.");
            res.redirect("/kk/recipes");
        } else {
            if (!found) {
                req.flash("error", "Recipe not found");
                res.redirect("back");
            } else {
                if(found.img.length < 5) {
                    res.render("kk-images/new", { recipe: found });
                } else {
                    req.flash("error", "There are the max number of images already.")
                    res.redirect("/kk/recipes/show/" + found.slug);
                };
            };
        };
    });
});

app.post("/recipes/:id/image", middleware.checkRecipeOwnership, upload.single('img'), function(req, res){
    Recipe.findOne({"slug": req.params.id}, function(err, recipe){
        if(err){
            req.flash("error", "Item not found.");
            res.redirect("back");
        } else {
            if(req.file) {
                if(recipe.img.length < 5) {
                    var img = {img: req.file.path, number: recipe.img.length, filename: req.file.filename};
                    recipe.img.push(img);
                    recipe.save();
                    req.flash("success", "Image Added");
                    res.redirect("/kk/recipes/" + recipe.slug + "/image/new");
                } else {
                    req.flash("error", "Max number of image have been uploaded")
                    res.redirect("/kk/recipes/show/" + recipe.slug);
                };
            };
        };
    });
});

app.delete("/recipes/:id/image/:idd", middleware.checkRecipeOwnership, function(req, res){
    Recipe.findOne({"slug": req.params.id}, (err, recipe) => {
        if(err) {
            req.flash("error", "Item not found.");
            res.redirect("back");
        } else {
            if (!recipe) {
                req.flash("error", "Recipe not found");
                res.redirect("back");
            } else {
                var newimg = [];
                for(var i = 0; i < recipe.img.length; i++) {
                    if(recipe.img[i].number.toString() === req.params.idd) {
                        cloudinary.uploader.destroy(recipe.img[i].filename, (err) => {
                            if(err) {
                                return res.send(err);
                            };
                        });
                        continue;
                    } else {
                        newimg.push(recipe.img[i]);
                    };
                };
                recipe.img = newimg;
                recipe.save();
                req.flash("success", "Image deleted!")
                res.redirect("back");
            };
        };
    });
});

app.delete("/recipes/:id", /*middleware.checkRecipeOwnership,*/ async function(req, res){
    Recipe.findOne({"slug": req.params.id}, async (err, recipes) => {
        if(err || !recipes) {
            req.flash("error", "Item not found.");
            return res.redirect("/kk/recipes");
        } else {
            if(recipes.img && recipes.img.length > 0) {
                for(var i = 0; i < recipes.img.length; i++) {
                    cloudinary.uploader.destroy(recipes.img[i].filename, (err) => {
                        if(err) {
                            return res.send(err);
                        };
                    });
                    continue;
                };
            };
            if(recipes.pics && recipes.pics.length > 0) {
                for(var i = 0; i < recipes.pics.length; i++) {
                    cloudinary.uploader.destroy(recipes.pics[i].filename, (err) => {
                        if(err) {
                            return res.send(err);
                        };
                    });
                    continue;
                };
            };
            if(recipes.shared && recipes.shared.length > 0) {
                recipes.shared.forEach(async (shared) => {
                    let doesUserExist = await User.exists({"email": shared.userEmail});
                    if(doesUserExist === true) {
                        User.findOne({"email": shared.userEmail}, (err, user) => {
                            if(err) {
                                req.flash("err", err.message);
                                res.redirect("back");
                            } else {
                                for(let i = 0; i < user.shared.length; i++) {
                                    if(user.shared[i].recipeSlug) {
                                        user.shared.splice(i, 1)
                                    };
                                };
                                user.save();
                            };
                        });
                    } else {
                        let doesShareExist = await Share.exists({"to": shared.userEmail, "recipeSlug": recipes.slug});
                        if(doesShareExist === true) {
                            Share.deleteMany({"to": shared.userEmail, "recipeSlug": recipes.slug}, (err) => {
                                if(err) {
                                    req.flash("err", err.message);
                                    res.redirect("back");
                                };
                            });
                        };
                    };
                });
            };
            Recipe.deleteOne({"slug": req.params.id}, function(err, removedRec){
                if(err){
                    req.flash("error", "Item not found.");
                    return res.redirect("/kk/recipes/" + req.params.id);
                } else {
                    Comment.deleteMany( {_id: { $in: removedRec.comments } }, (err) => {
                        if(err) {
                            req.flash("error", "Item not found.");
                            return res.redirect("/kk/recipes");
                        } else {
                            Favorites.deleteMany({"recipe_id": req.params.id}).exec(function(err){
                                if(err){
                                    req.flash("error", "Item not found.");
                                    return res.redirect("/kk/recipes");
                                } else {
                                    req.flash("success", "Recipe Deleted");
                                    res.redirect("/kk/recipes");
                                };
                            });
                        };
                    });
                };
            });
        };
    });
});


app.use(favoriteRoutes);
app.use(shareRoutes);
app.use(indexRoutes);
app.use("/recipes/", recipeRoutes);
app.use("/recipes/:id/comments", commentRoutes);

app.get("*", function(req, res){
    req.flash("error", "Recipe not found");
    res.redirect("/kk/recipes");
});