if(process.env.NODE_ENV !== "production") {
  require("dotenv").config();
};

var express = require("express"),
  app = express(),
  methodOverride = require("method-override"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose");  
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  flash = require("connect-flash"),
  expressSanitizer = require("express-sanitizer"),
  //football = require("./football/index.js");
  cookbook = require("./KrampedKookbook/app.js");

app.use(express.static("public"));
app.get("/", (req,res) => {
  res.sendFile(__dirname + "/views/homepage.html");
});

app.get("/games/:id", (req, res) => {
  let game = req.params.id;
  let gamefold = game.slice(0, game.indexOf(".")).toLowerCase();
  let gamePath = gamefold + "/" + game;
  res.sendFile(__dirname + "/views/" + gamePath);
});

//app.use(football);
app.use("/kk", cookbook);
let port = process.env.PORT || 1850;

app.listen(port, () => {
  console.log("Dom's Projects has started on port 1850");
});