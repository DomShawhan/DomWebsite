var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    favorites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Favorites"
        }
    ],
    shared: [{
        recipeSlug: String,
        recipeTitle: String
    }],
    img: {
        img: {type:String, default:"https://res.cloudinary.com/dbf3twqu3/image/upload/v1622858258/KrampedKookbook/Screenshot_2021-06-04_215236_2_awi0kl.jpg"},
        filename: {type:String, default: "KrampedKookbook/Screenshot_2021-06-04_215236_2_awi0kl"}
    },
    allShared: [{
        userSlug: String,
        userEmail: String
    }],
    recSharedWith: [{
        userEmail: String
    }],
    email: {type: String, unique: true, required: true},
    color: String,
    type: {type: String, default: "user"},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    slug: {
        type: String,
        unique: true
    },
    messages: [
        {
            body: String,
            read: Boolean,
            date: Date
        }
    ]
});
//generate slug for the user
UserSchema.pre('save', async function (next) {
    try {
        // check if a new user is being saved, or if the user name is being modified
        if (this.isNew || this.isModified("name")) {
            this.slug = await generateUniqueSlug(this._id, this.username);
        };
        next();
    } catch (err) {
        next(err);
    }
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", UserSchema);

module.exports = User;
//functions to generate unique slug
async function generateUniqueSlug(id, userName, slug) {
    try {
        // generate the initial slug
        if (!slug) {
            slug = slugify(userName);
        }
        // check if a user with the slug already exists
        var user = await User.findOne({slug: slug});
        // check if a user was found or if the found user is the current user
        if (!user || user._id.equals(id)) {
            return slug;
        }
        // if not unique, generate a new slug
        var newSlug = slugify(userName);
        // check again by calling the function recursively
        return await generateUniqueSlug(id, userName, newSlug);
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