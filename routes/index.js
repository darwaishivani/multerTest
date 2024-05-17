var express = require("express");
var router = express.Router();
var passport = require("passport");
var userModel = require("./users");
var localStratergy = require("passport-local");
var multer = require("multer");
var path = require("path");
passport.use(new localStratergy(userModel.authenticate()));

const storage = multer.diskStorage({
	destination: function (req, file, cb) {	
		cb(null, "./public/images/uploads");
	},
	filename: function (req, file, cb) {
		var dt = new Date();
		var rn =
			Math.floor(Math.random() * 100000000) +
			dt.getTime() +
			path.extname(file.originalname);
		cb(null, rn);
	},
});

function fileFilter(req, file, cb) {
	console.log(file.mimetype);
	if (
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg" ||
		file.mimetype === "image/png" ||
		file.mimetype === "image/webp" ||
		file.mimetype === "image/svg"
	) {
		cb(null, true);
	}
	// You can always pass an error if something goes wrong:
	else {
		cb(new Error("Only images are allowed"), false);
	}
}
const upload = multer({ storage: storage, fileFilter: fileFilter });

/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index");
});

router.post("/register", function (req, res, next) {
	var createdUser = new userModel({
		username: req.body.username,
		email: req.body.email,
		image: req.body.image,
	});
	userModel
		.register(createdUser, req.body.password)
		.then(function () {
			passport.authenticate("local")(req, res, function () {
				res.redirect("/profile");
				console.log("userCreated");
			});
		})
		.catch(function (e) {
			res.send(e);
		});
});

router.post(
	"/login",
	passport.authenticate("local", {
		successRedirect: "/profile",
		failureRedirect: "/",
	}),
	function (req, res, next) {}
);

router.get("/profile", isLoggedIn, function (req, res, next) {
	userModel
		.findOne({ username: req.session.passport.user })
		.then(function (foundUser) {
			console.log(foundUser);
			res.render("profile", { user: foundUser });
		});
});

router.post(
	"/upload",
	isLoggedIn,
	upload.single("image"),
	function (req, res, next) {
		userModel
			.findOne({ username: req.session.passport.user })
			.then(function (loggedInUser) {
				console.log(req.file);
				loggedInUser.image = req.file.filename;
				loggedInUser.save().then(function (dets) {
					// console.log("dets --->>> ", dets);
					res.redirect("back");
				});
			});
	}
);
router.get("/logout", function (req, res, next) {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		res.redirect("/");
	});
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect("/");
	}
}
module.exports = router;
