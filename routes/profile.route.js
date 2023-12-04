import { Router } from "express";
import multer from "multer";
import fs from 'fs'
import {deleteUserById, getMyProfile, getUserById, getUsers, updateProfilePhoto, userUpdate} from "../controllers/profile.controller.js";
import CheckId from "../middlewares/checkId.js";
import { checkToken, isAdmin, userSelfAndAdmin } from "../middlewares/verifyAuth.js";
import { validateUserUpdate } from "../models/user.model.js";

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/png', 'image/webp', 'image/jpeg'];
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true); // قبول الملف
    } else {
        cb(null, false); // رفض الملف
    }
};

const upload = multer({ dest: 'uploads/users/', fileFilter })

const router = Router();

// upload.single('avatar') # this is middleware ..

router.route('/').get(checkToken, getMyProfile)

router.route('/all').get(isAdmin, getUsers)

router.route('/update')
    .post(checkToken ,validateUserUpdate, userUpdate);


router.route('/:id')
    .get(CheckId, checkToken, getUserById)
    .delete(CheckId, userSelfAndAdmin, deleteUserById)

router.route('/updateProfilePhoto/')
    .post(upload.single('image'), checkToken, updateProfilePhoto)

export default router