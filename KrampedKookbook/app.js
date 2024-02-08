// Require Modules
const express = require("express"),
  methodOverride = require("method-override"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  flash = require("connect-flash"),
  expressSanitizer = require("express-sanitizer"),
  async = require("async"),
  cookieParser = require("cookie-parser");
//Require Models
const User = require("./models/authentication"),
    Favorites = require("./models/favorites"),
    Comment = require("./models/comments"),
    Share = require("./models/share"),
    Recipe = require("./models/recipes");
//Require Routes
const recipeRoutes = require("./routes/recipes"),
    indexRoutes = require("./routes/authentication"),
    favoriteRoutes = require("./routes/favorites"),
    shareRoutes = require("./routes/share"),
    commentRoutes = require("./routes/comment");
    
const  middleware = require("./middleware");
const app = module.exports = express();

//Setup database
const mongoSanitize = require('express-mongo-sanitize');
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(process.env.DatabaseDP);
//setup cloudinary

const {storage} = require('../cloudinary');
const {cloudinary} = require('../cloudinary');

app.use(flash());
app.use(cookieParser());
app.locals.moment = require('moment');
//set view engine, bodyParser and express sanitizer
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(mongoSanitize());
app.use(expressSanitizer());
app.use(methodOverride("_method"));
//setup express session
app.use(require("express-session")({
    secret: "Rambo",
    resave: false,
    saveUninitialized: false
}));
//setup multer
const multer = require('multer');
const upload = multer({ storage }); 
//setup passport(login tool)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//setup flash and current user
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});  
//Render start page
app.get("/", function(req, res){
    res.render("kkstart");
});
//upload picture of recipe card
app.post("/recipes/file", upload.array("recipe[pics]", 5), middleware.isLoggedIn, async (req, res) => {
    req.body.recipe.description = req.sanitize(req.body.recipe.description);
    const title = req.body.recipe.title,
        normal = title.toLowerCase(),
        type = req.body.recipe.type,
        author = {
            id: req.user._id,
            username: req.user.username,
            slug: req.user.slug,
            img: req.user.img.img
        },
        serves = req.body.recipe.serves,
        description = req.body.recipe.description,
        public = req.body.recipe.public,
        createdby = req.body.recipe.createdby,
        gluten = req.body.recipe.gluten ? true : false,
        dairy = req.body.recipe.dairy ? true : false,
        vegan = req.body.recipe.vegan ? true : false,
        vegetarian = req.body.recipe.vegetarian ? true : false;

    const newRecipe = { pics: [], normal: normal, shared: [], file: "image", createdby: createdby, title: title, serves: serves, type: type, author: author,  description: description, public: public, gluten: gluten, dairy: dairy, vegan: vegan, vegetarian: vegetarian, img: []};
    Recipe.create(newRecipe, async function(err, newRecipe){
        if(err){
            req.flash("error", "Something went wrong.");
            res.redirect("back");
        } else {
            if(req.files) {
                //Upload files to Cloudinary
                const pics = req.files.map(f => ({img: f.path, filename: f.filename}));
                newRecipe.pics.push(...pics);
                await newRecipe.save();
            }
            req.flash("success", "Recipe Created");
            res.redirect("/kk/recipes/" + newRecipe.slug + "/ask");
        };
    });
});
//Update recipe
app.put("/recipes/:id", upload.array("recipe[pics]", 5), middleware.checkRecipeOwnership,  async (req, res) => {
    req.body.recipe.description = req.sanitize(req.body.recipe.description);
    req.body.recipe.directions = req.sanitize(req.body.recipe.directions);
    const normal = req.body.recipe.title.toLowerCase(),
        ingredient = [],
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
            //check if there is only one ingredient
            if(typeof req.body.recipe.ingredient_amount === "string") {
                let ingreObj = {
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
            const directions = req.body.recipe.directions;
            recipeUpdate.directions = directions;
            recipeUpdate.ingredients = ingredient;
        } else if(recipe.file === "image") {
            if(req.body.picsDel) {
                //check if there is only one image
                if(typeof req.body.picsDel !== "string") {
                    for (let filename of req.body.picsDel) {
                        //destroy requested images
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

        Recipe.updateOne({"slug": req.params.id}, recipeUpdate, async function(err, updated){
            if(err) {
                req.flash("error", "Recipe not found.");
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
//Ask if user wants to add images to the recipe
app.get("/recipes/:id/ask", middleware.checkRecipeOwnership, function(req,res) {
    Recipe.findOne({"slug": req.params.id}, function(err, found){
        if(err || !found) {
            req.flash("error", "Recipe not found.");
            res.redirect("/kk/recipes");
        } else {
            if(found.img.length < 5) {
                res.render("kk-images/ask", { recipe: found });
            } else {
                req.flash("error", "There are the max number of images already.")
                res.redirect("/kk/recipes/show/" + found.slug);
            };
        };
    });
});
//Render upload page
app.get("/recipes/:id/image/new", middleware.checkRecipeOwnership, function(req, res){
    Recipe.findOne({"slug": req.params.id}, function(err, found){
        if (err || !found) {
            req.flash("error", "Recipe not found.");
            res.redirect("/kk/recipes");
        } else {
            if(found.img.length < 5) {
                res.render("kk-images/new", { recipe: found });
            } else {
                req.flash("error", "There are the max number of images already.")
                res.redirect("/kk/recipes/show/" + found.slug);
            };
        };
    });
});
//Upload image of recipe
app.post("/recipes/:id/image", middleware.checkRecipeOwnership, upload.single('img'), function(req, res){
    Recipe.findOne({"slug": req.params.id}, function(err, recipe){
        if(err){
            req.flash("error", "Recipe not found.");
            res.redirect("back");
        } else {
            if(req.file) {
                if(recipe.img.length < 5) {
                    const img = {
                        img: req.file.path, 
                        number: recipe.img.length, 
                        filename: req.file.filename
                    };
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
//Delete an image of the recipe
app.delete("/recipes/:id/image/:idd", middleware.checkRecipeOwnership, function(req, res){
    Recipe.findOne({"slug": req.params.id}, (err, recipe) => {
        if(err || !recipe) {
            req.flash("error", "Recipe not found.");
            res.redirect("back");
        } else {
            let newimg = [];
            for(let i = 0; i < recipe.img.length; i++) {
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
    });
});
//Delete recipe
app.delete("/recipes/:id", middleware.checkRecipeOwnership, async function(req, res){
    Recipe.findOne({"slug": req.params.id}, async (err, recipes) => {
        if(err || !recipes) {
            req.flash("error", "Recipe not found.");
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
                //Delete shared recipes relationships
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
            //Delete recipe and its dependencies
            Recipe.deleteOne({"slug": req.params.id}, function(err, removedRec){
                if(err){
                    req.flash("error", "Recipe not found.");
                    return res.redirect("/kk/recipes/" + req.params.id);
                } else {
                    Comment.deleteMany( {_id: { $in: removedRec.comments } }, (err) => {
                        if(err) {
                            req.flash("error", "Comment not found.");
                            return res.redirect("/kk/recipes");
                        } else {
                            Favorites.deleteMany({"recipe_id": req.params.id}).exec(function(err){
                                if(err){
                                    req.flash("error", "Favorites not found.");
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
//use Routes
app.use(favoriteRoutes);
app.use(shareRoutes);
app.use(indexRoutes);
app.use("/recipes/", recipeRoutes);
app.use("/recipes/:id/comments", commentRoutes);
//redirect to home route when the user trys to enter a nonexistent route
app.get("*", function(req, res){
    req.flash("error", "Recipe not found");
    res.redirect("/kk/recipes");
});