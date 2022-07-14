const express = require("express"),
      User = require("../models/authentication"),
      async = require("async");

let messages = {};

messages.create = (req, res, to, body) => {
    User.findOne({"slug": to}, async(err, user) => {
        if(err || !user) {
            req.flash("error", "User not found.");
            res.redirect("back");
        } else {
            let bod = {body: body, date: Date.now(), read: false};
            user.messages.push(bod);
            return await user.save();
        };
    });
};

module.exports = messages;