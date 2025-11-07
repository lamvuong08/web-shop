const express = require('express');
const { 
    createUser, 
    handleLogin, 
    getUser, 
    getAccount, 
    forgotPassword, 
    resetPassword,
    sendRegisterOtp,
    verifyRegisterOtp,

    handleListUsers,
    handleGetUserById,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser
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

routerAPI.get("/users", handleListUsers);
routerAPI.get("/users/:id", handleGetUserById);
routerAPI.post("/users", handleCreateUser);
routerAPI.put("/users/:id", handleUpdateUser);
routerAPI.delete("/users/:id", handleDeleteUser);

module.exports = routerAPI; //export default