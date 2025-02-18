const express = require("express"),
    router = express.Router({mergeParams: true});

const Recipe = require("../models/recipes"),
    Comment = require("../models/comments"),
    middleware = require("../middleware");
//Render new comment page
router.get("/new", middleware.isLoggedIn, (req, res) => {
    Recipe.findOne({"slug": req.params.id}).then((recipe) => {
        res.render("kk/comments/new", { recipes: recipe });
    }).catch((err) => {
        req.flash("error", "Item not found.");
        return res.redirect("/kk/recipes");
    });
});
//post new comment
router.post("/", middleware.isLoggedIn, (req, res) => {
    Recipe.findOne({"slug": req.params.id}).then((recipe) => {
        const author = {
                id: req.user._id,
                username: req.user.username
            },
            createComment = {
                title: req.body.comment.title,
                content: req.sanitize(req.body.comment.content),
                author: author
            };
        Comment.create(createComment).then((comment) => {
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                comment.save();
                recipe.comments.push(comment);
                recipe.save();
                req.flash("success", "Comment Created");
                res.redirect("/kk/recipes/show/" + recipe.slug);
        }).catch((err) => {
            req.flash("error", "Unable to create.");
            res.redirect("/kk/recipes");
        });
    }).catch((err) => {
        req.flash("error", "Item not found.");;
        return res.redirect("/kk/recipes");
    });
});
//Render edit comment page
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id).then((foundComment) => {
        res.render("kk/comments/edit", {recipe_id: req.params.id, comment: foundComment});
    }).catch(err => {
        req.flash("error", "Comment not found");
        res.redirect("back");
    });
});
//update comment
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    const editComment = {
        title: req.body.comment.title,
        content: req.sanitize(req.body.comment.content)
    };
    Comment.findByIdAndUpdate(req.params.comment_id, editComment).then((updated) => {
        if (!updated) {
            req.flash("error", "Item not found.");
            return res.redirect("back");
        }
        req.flash("success", "Comment Edit Done");
        res.redirect("/kk/recipes/show/" + req.params.id);
    }).catch(err => {
        req.flash("error", err.message);
        res.redirect("back");
    });
});
//delete comment
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id).then((foundComment) => {
        if (!foundComment) {
            req.flash("error", "Item not found.");
            return res.redirect("back");
        }
        req.flash("success", "Comment Destroyed");
        res.redirect("/kk/recipes/show/" + req.params.id);
    }).catch(err => {
        req.flash("error", err.message);
        res.redirect("back");
    });
});

module.exports = router;