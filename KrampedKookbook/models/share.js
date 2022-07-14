const mongoose = require("mongoose");

let shareSchema = new mongoose.Schema({
    from: String,
    to: String,
    fromSlug: String,
    toHasAccount: Boolean,
    allRecipes: Boolean,
    recipeSlug: String,
    recipeTitle: String
});

let Share = mongoose.model("Share", shareSchema);

module.exports = Share;