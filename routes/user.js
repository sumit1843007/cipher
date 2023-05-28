const express = require('express');

const User = require("../controller/user");
const Auth = require("../controller/auth");

const router = express.Router();

// const middleware = (req, res, next, val) => {
//     const id = req.params.id;
//     console.log("middleware called");
//     // console.log(val);
//     if ((+id) > data.length - 1) {
//         return res.status(201).json({
//             success: "error", mes: "invalid id",
//         });
//     }
//     next();
// };


// router.param('id', middleware);

// router.get("/", tours.Tours);
// router.post("/", tours.addTour);

// router.get("/:id", middleware, tours.Tour);
// router.patch("/:id", middleware, tours.updateTour);

// router.delete("/:id", middleware, tours.deleteTour);


router.route("/signUp").post(Auth.signUp);
router.route("/login").post(Auth.login);
router.route("/logout").post(Auth.logout);
router.route("/forgetPassword").post(Auth.forgetPassword);
router.route("/resetPassword/:token").patch(Auth.resetPassword);

// protecting route after this middleware
router.use(Auth.protect);

router.route("/getMe").get(User.getMe); //single user details
router.route("/updateMe").patch(User.uploadUserPhoto, User.resizeUserPhoto, User.updateMe); // update fields value without password ex - NAME EMAIL
router.route("/deleteMe").delete(User.deleteMe); // delete users means soft delete active = false
router.route("/updatePassword").patch(Auth.updatePassword); // update only password

// admin routes 
router.use(Auth.restrictTo("admin"));

router.get("/", User.users); // get all users






module.exports = router


