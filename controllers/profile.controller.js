import * as url from 'url';
import path from "path";
import fs from "fs";
import {User} from "../models/user.model.js";
import { cloudRemoveImage, cloudUploadImage } from "../utils/cloudinary.js";
import { ResultData, ResultError } from "../utils/resultData.js";
import asyncHandler from "express-async-handler";
import { Book } from '../models/book.model.js';
import { matchedData, validationResult } from 'express-validator';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

 
const getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find().populate("books")
    return res.status(200).json(ResultData({users}))
})

const getUserById = asyncHandler(async (req, res, next) => {
    const userId = req.params.id
    const page = parseInt(req.query.page) || 0; 
    const limit = parseInt(req.query.limit) || 0;
    const skip = (page - 1) * limit;
    const countDocs = await Book.countDocuments({user: userId, status : "public"})
    const count = countDocs / limit

    const user = await User.findById(userId, ["-password", "-__v"]).populate({
        path: "books",
        match : {status: "public"},
        select: {__v: 0},
        options: { skip, limit }
    })
    if (!user) {
        return res.status(404).json(ResultError("fail", 404, "not found user"))
    }
    return res.status(200).json(ResultData({
        pagination: {
            count
        },
        user
    }))
})

const deleteUserById = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (!user) {
        return res.status(404).json(ResultError("fail", 404, "not found user"))
    }
    const userDeleted = await User.findByIdAndDelete(req.params.id);
    await cloudRemoveImage(userDeleted.avatar.publicId);

    const books = await Book.find({user: req.params.id}, ['_id']);
    books.forEach(async (e) => {
        const bookDel = await Book.findByIdAndDelete(e._id);
        await cloudRemoveImage(bookDel.image.publicId)
    })
    return res.status(200).json(ResultData({user: userDeleted, books}))
})

const getMyProfile = asyncHandler(async (req, res, next) => {
    let id = req.user._id;
    const page = parseInt(req.query.page) || 0; 
    const limit = parseInt(req.query.limit) || 0;
    const skip = (page - 1) * limit;
    const countDocs = await Book.countDocuments()
    const count = countDocs / limit

    const user = await User.findById(id, ["-password", "-__v"]).populate({
        path: "books",
        select: {__v: 0},
        options: { skip, limit }
    })
    return res.status(200).json(ResultData({
        pagination: {
            count
        },
        user
    }))
})

const updateProfilePhoto = asyncHandler(async (req, res, next) => {
    let id = req.user._id
    const image = req.file.filename
    let imagePath = path.join(__dirname, "../uploads/users/" + image)
    const user = await User.findByIdAndUpdate(id , { new: true })
    if (!user) {
        return res.status(404).json(ResultError("fail", 404, "not found user"))
    }
    const resultUploadImage = await cloudUploadImage(imagePath, "avatars");
    if (resultUploadImage.public_id) {
        fs.unlinkSync(imagePath);
        if(user.avatar.publicId) {
            await cloudRemoveImage(user.avatar.publicId);
        }
        user.avatar = {
            url: resultUploadImage.url,
            publicId: resultUploadImage.public_id
        }
        await user.save();
        const sanitizedUser = user.toObject();
        delete sanitizedUser.password;
        return res.status(200).json(ResultData({user: {...sanitizedUser, token: req.token}}))
    }
})


const userUpdate = asyncHandler(
    async (req, res) => {
        const id = req.user._id;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let err = errors.array()[0]
            return res.status(400).json(ResultError("fail", 400, err.path + ' is ' + err.msg));
        }
        const data = matchedData(req)
        if (data.email) {
            const email = await User.findOne({email: data.email});
            if (email) {
                return res.status(400).json(ResultError("fail", 400, 'user is exists'))  
            }
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json(ResultError("fail", 404, 'Not found user'))
        }
        const userAfterUpdate = await User.findByIdAndUpdate(id, {$set: {...data}},{new: true})
        if (userAfterUpdate) {
            const sanitizedUser = userAfterUpdate.toObject();
            delete sanitizedUser.password;
            return res.status(200).json(ResultData({user: {...sanitizedUser, token: req.token}}))
        }

})

export {getUsers, getUserById, deleteUserById, getMyProfile, updateProfilePhoto, userUpdate}