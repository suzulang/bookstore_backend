import { body } from "express-validator";
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    discription: {
        type: String,
        required: true
    },
    author : {
        type : String,
        required: true
    },
    pages : {
        type : Number,
        required: true
    },
    rating: {
        type : Number,
        default: 3.5
    },
    file: {
        type: Object,
        default : {
            url : 'file.pdf',
            publicId: null
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    image: {
        type: Object,
        default : {
            url : 'https://res.cloudinary.com/dl36cr5fb/image/upload/v1700158758/images/oevauslihr0jrxd632lc.jpg',
            publicId: null
        }
    },
    status: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    }
});

const Book =  mongoose.model('Book', bookSchema);

let validateBook = [
    body('title').isString().withMessage('not string').isLength({min : 2}).withMessage('less than 2 characters'),
    body('price').isNumeric().withMessage('not a number'),
    body('pages').isNumeric().withMessage('not a number'),
    body('discount').optional({checkFalsy: true}).isNumeric(),
    body('discription').isString().withMessage('not string').isLength({min : 20}).withMessage('less than 20 characters'),
    body('author').isString().withMessage('not string').isLength({min : 2}).withMessage('less than 2 characters'),
]

let validateUpdateBook = [
    body('title').optional({checkFalsy: true}).isString().withMessage('not string').isLength({min : 2}).withMessage('less than 2 characters'),
    body('price').optional({checkFalsy: true}).isNumeric().withMessage('not a number'),
    body('pages').optional({checkFalsy: true}).isNumeric().withMessage('not a number'),
    body('discount').optional({checkFalsy: true}).isNumeric().isNumeric().withMessage('not a number'),
    body('status').optional({checkFalsy: true}).isIn(['public', 'private']).withMessage('not a public or private'),
    body('discription').optional({checkFalsy: true}).isString().withMessage('not string').isLength({min : 20}).withMessage('less than 20 characters'),
    body('author').optional({checkFalsy: true}).isString().withMessage('not string').isLength({min : 2}).withMessage('less than 2 characters'),
]


export {Book, validateBook, validateUpdateBook};