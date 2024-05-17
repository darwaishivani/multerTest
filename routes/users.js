var mongoose = require("mongoose");
var plm = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/multerdp");

var userSchema = mongoose.Schema({
	username: String,
	email: String,
	password: String,
	image: {
		type: String,
		default: "default.jpg",
	},
});

userSchema.plugin(plm);
module.exports = mongoose.model("user", userSchema);
