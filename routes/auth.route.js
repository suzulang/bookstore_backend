import { Router } from "express";
import { changePassword, login, register } from "../controllers/auth.controller.js";
import { validatechangePassword, validateLogin, validateRegister } from "../models/user.model.js";
import { checkToken } from "../middlewares/verifyAuth.js";


const router = Router();

router.route('/register')
    .post(validateRegister, register);

router.route('/login')
    .post(validateLogin, login);

router.route('/reset-password')
    .post(checkToken ,validatechangePassword, changePassword);

export default router
