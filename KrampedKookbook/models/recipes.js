var mongoose = require("mongoose");

var recipeSchema = new mongoose.Schema({
    serves: String,
    title: String,
    type: String,
    normal: String,
    createdby: String,
    shared: [{
        userEmail: String
    }],
    ingredients: [
        {
            name: String, 
            amount: String
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    pics: [
        {
            img: String,
            filename: String
        }
    ],
    img: [
        {
            img: String,
            filename: String,
            number: Number
        }
    ],
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: String,
        slug: String,
        img: String
    },
    file: String,
    directions: String,
    description: String,
    created: {type: Date, default: Date.now},
    public: Boolean,
    gluten: Boolean,
    dairy: Boolean,
    vegan: Boolean,
    vegetarian: Boolean,
    slug: {
        type: String,
        unique: true
    }
});

recipeSchema.pre('save', async function (next) {
    try {
        if (this.isNew || this.isModified("name")) {
            this.slug = await generateUniqueSlug(this._id, this.title);
        };
        next();
    } catch (err) {
        next(err);
    }
});

var Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;

async function generateUniqueSlug(id, recipeName, slug) {
    try {
        // generate the initial slug
        if (!slug) {
            slug = slugify(recipeName);
        }
        var recipe = await Recipe.findOne({slug: slug});
        if (!recipe || recipe._id.equals(id)) {
            return slug;
        }
        // if not unique, generate a new slug
        var newSlug = slugify(recipeName);
        // check again by calling the function recursively
        return await generateUniqueSlug(id, recipeName, newSlug);
    } catch (err) {
        throw new Error(err);
    }
}

function slugify(text) {
    var slug = text.toString().toLowerCase()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '')          // Trim - from end of text
      .substring(0, 75);           // Trim at 75 characters
    return slug + "-" + Math.floor(1000 + Math.random() * 9000);  // Add 4 random digits to improve uniqueness
}