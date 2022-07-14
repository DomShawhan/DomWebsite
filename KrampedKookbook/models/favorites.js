var mongoose = require("mongoose");

var favSchema = new mongoose.Schema({
    recipe_id: String,
    recipe_name: String
});
  
module.exports = mongoose.model("Favorites", favSchema);