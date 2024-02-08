const express = require("express"),
    router = express.Router({mergeParams: true});

const Recipe = require("../models/recipes"),
    Comment = require("../models/comments"),
    middleware = require("../middleware");
//Render new comment page
router.get("/new", middleware.isLoggedIn, function(req, res){
    Recipe.findOne({"slug": req.params.id}, function(err, recipe){
        if(err || !recipe){
            req.flash("error", "Item not found.");
            return res.redirect("/kk/recipes");
        } else {
            res.render("kk/comments/new", { recipes: recipe });
        };
    });
});
//post new comment
router.post("/", middleware.isLoggedIn, function (req, res) {
    Recipe.findOne({"slug": req.params.id}, function (err, recipe) {
        if (err || !recipe) {
            req.flash("error", "Item not found.");;
            return res.redirect("/kk/recipes");
        } else {
            const author = {
                    id: req.user._id,
                    username: req.user.username
                },
                createComment = {
                    title: req.body.comment.title,
                    content: req.sanitize(req.body.comment.content),
                    author: author
                };
            Comment.create(createComment, function (err, comment) {
                if (err) {
                    req.flash("error", "Unable to create.");
                    res.redirect("/kk/recipes");
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    recipe.comments.push(comment);
                    recipe.save();
                    req.flash("success", "Comment Created");
                    res.redirect("/kk/recipes/show/" + recipe.slug);
                };
            });
        };
    });
});
//Render edit comment page
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err || !foundComment){
            req.flash("error", "Comment not found");
            res.redirect("back");
        } else {
            res.render("kk/comments/edit", {recipe_id: req.params.id, comment: foundComment});
        };
    });
});
//update comment
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    const editComment = {
        title: req.body.comment.title,
        content: req.sanitize(req.body.comment.content)
    };
    Comment.findByIdAndUpdate(req.params.comment_id, editComment, function(err, updated){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (!updated) {
                req.flash("error", "Item not found.");
                return res.redirect("back");
            }
            req.flash("success", "Comment Edit Done");
            res.redirect("/kk/recipes/show/" + req.params.id);
        };
    });
});
//delete comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err, foundComment){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (!foundComment) {
                req.flash("error", "Item not found.");
                return res.redirect("back");
            }
            req.flash("success", "Comment Destroyed");
            res.redirect("/kk/recipes/show/" + req.params.id);
        };
    });
});

module.exports = router;