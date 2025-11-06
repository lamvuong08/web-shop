const express = require('express');
const { 
    createUser, 
    handleLogin, 
    getUser, 
    getAccount, 
    forgotPassword, 
    resetPassword,
    sendRegisterOtp,
    verifyRegisterOtp
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();

// Public routes (no auth required)
routerAPI.post("/register", createUser);
routerAPI.post("/register/otp", sendRegisterOtp);
routerAPI.post("/register/verify", verifyRegisterOtp);
routerAPI.post("/login", handleLogin);
routerAPI.post("/forgot-password", forgotPassword);
routerAPI.post("/reset-password", resetPassword);


// Protected routes (auth required)
routerAPI.use(auth);
routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api");
});
routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

module.exports = routerAPI; //export default