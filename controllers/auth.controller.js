import asyncHandler from "express-async-handler";
import bcryptjs from 'bcryptjs';
import { User } from "../models/user.model.js";
import createToken from "../utils/createToken.js";
import { ResultData, ResultError } from "../utils/resultData.js";
import { validationResult } from "express-validator";

// ######
const login = asyncHandler(
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let err = errors.array()[0]
            return res.status(400).json(ResultError("fail", 400, err.path + ' is ' + err.msg));
        }
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        
        if (!user) {
            return res.status(400).json(ResultError("fail", 400, "user is not found!"))
        }
        
        const checkPassword = await bcryptjs.compare(password, user.password);
        
        if (!checkPassword) {
            return res.status(400).json(ResultError("fail", 400, "password is not right!"))
        }

        const token = await createToken({_id: user._id, isAdmin: user.isAdmin});
        return res.status(200).json(ResultData({
            user:{
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                _id: user._id,
                avatar: user.avatar,
                isAdmin: user.isAdmin,
                bio: user.bio,
                token
            }
        }))
    }
)

// ######
const register = asyncHandler(
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let err = errors.array()[0]
            return res.status(400).json(ResultError("fail", 400, err.path + ' is ' + err.msg));
        }

        const {firstName, lastName, email, password} = req.body;
        const oldUser = await User.findOne({email: email});
        if (oldUser) {
            return res.status(400).json(ResultError("fail", 400, "This user is exist by this email!"))
        }

        const hashPass = await bcryptjs.hash(password, 10)
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashPass,
        });
        
        await user.save()
        const token = await createToken({_id: user._id, isAdmin: user.isAdmin});
        return res.status(200).json(ResultData({
            user:{
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                _id: user._id,
                avatar: user.avatar,
                isAdmin: user.isAdmin,
                bio: user.bio,
                token
            }
        }))
    }
)

const changePassword = asyncHandler(
    async (req, res) => {
        const id = req.user._id;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let err = errors.array()[0]
            return res.status(400).json(ResultError("fail", 400, err.path + ' is ' + err.msg));
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json(ResultError("fail", 400, 'Not found user'))
        }

        const checkPassword = await bcryptjs.compare(req.body.password, user.password);
        
        if (!checkPassword) {
            return res.status(400).json(ResultError("fail", 400, "password is not right!"))
        }

        const password = await bcryptjs.hash(req.body.newPassword, 10)
        const userAfterUpdatePassword = await User.findByIdAndUpdate(id, {$set: {password}})
        if (userAfterUpdatePassword) {
            res.status(200).json(ResultData({user:{email: userAfterUpdatePassword.email}}))
        }
})



export {register, login, changePassword}