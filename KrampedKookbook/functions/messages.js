const express = require("express"),
      User = require("../models/authentication"),
      async = require("async");

let messages = {};

messages.create = (req, res, to, body) => {
    User.findOne({"slug": to}).then(async(user) => {
        if(!user) {
            req.flash("error", "User not found.");
            res.redirect("back");
        } else {
            let bod = {body: body, date: Date.now(), read: false};
            user.messages.push(bod);
            return await user.save();
        };
    }).catch(err => {
        req.flash("error", "User not found.");
        res.redirect("back");
    });
};

module.exports = messages;