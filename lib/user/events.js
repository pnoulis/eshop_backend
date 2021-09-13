import User from "./user.js";

User.login = function(req, res, next) {};
User.logout = function(req, res, next) {};
User.forgotPassword = function(req, res, next) {};
User.sendEmail = function(req, res, next) {};
User.purchaseOrder = function(req, res, next) {};
User.createOrder = function(req, res, next) {};
User.getOrder = function(req, res, next) {};
User.updateOrder = function(req, res, next) {};
User.deleteOrder = function(req, res, next) {};
User.createAddress = function(req, res, next) {};
User.getAddress = function(req, res, next) {};
User.updateAdress = function(req, res, next) {};
User.deleteAddress = function(req, res, next) {};
User.createAccount = function(req, res, next) {};
User.getAccount = function(req, res, next) {};
User.updateAccount = function(req, res, next) {};
User.deleteAccount = function(req, res, next) {};

export default User;
