import { body } from "express-validator";
import mongoose from "mongoose";
import validator from "validator";


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, 'this is email not valid']
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: "默认个人简介"
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: Object,
        default : {
            url : 'https://res.cloudinary.com/dl36cr5fb/image/upload/v1700211065/avatars/qd3osfmbczagz8mi2kfs.png',
            publicId: null
        }
    }
},{
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

userSchema.virtual('books', {
    ref: "Book",
    foreignField: "user",
    localField: "_id"
})


let validateRegister = [
    body('firstName').notEmpty().withMessage('empty').isLength({min : 1}).withMessage('less than 1 characters'),
    body('lastName').notEmpty().withMessage('empty').isLength({min : 1}).withMessage('less than 1 characters'),
    body('email').notEmpty().withMessage('empty').isEmail().withMessage('not valid'),
    body('password').notEmpty().withMessage('empty').isLength({ min: 6 }).withMessage('less than 6 characters'),
]

let validateLogin = [
    body('email').notEmpty().withMessage('empty').isEmail().withMessage('not valid'),
    body('password').notEmpty().withMessage('empty').isLength({ min: 6 }).withMessage('less than 6 characters'),
]

let validatechangePassword = [
    body('password').notEmpty().withMessage('empty').isLength({ min: 6 }).withMessage('less than 6 characters'),
    body('newPassword').notEmpty().withMessage('empty').isLength({ min: 6 }).withMessage('less than 6 characters'),
]

let validateUserUpdate = [
    body('firstName').optional({checkFalsy: true}).isLength({min : 1}).withMessage('less than 1 characters'),
    body('lastName').optional({checkFalsy: true}).isLength({min : 1}).withMessage('less than 1 characters'),
    body('bio').optional({checkFalsy: true}).isLength({min : 2, max: 250}).withMessage('less than 2 characters or more than 250 characters'),
    body('email').optional({checkFalsy: true}).notEmpty().withMessage('empty').isEmail().withMessage('not valid'),
]

const User =  mongoose.model('User', userSchema);

export { User, validateRegister, validateLogin , validatechangePassword, validateUserUpdate}