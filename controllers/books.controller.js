import * as url from 'url';
import path from "path";
import { cloudRemoveImage, cloudUploadImage } from "../utils/cloudinary.js";
import fs from "fs";
import { matchedData, validationResult } from "express-validator";
import {Book} from "../models/book.model.js";
import { ResultData, ResultError } from "../utils/resultData.js";
import asyncHandler from "express-async-handler";
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// ######
const getBooks = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 0; 
    const limit = parseInt(req.query.limit) || 0;
    const skip = (page - 1) * limit;

    const countDocs = await Book.countDocuments({status : "public"})

    const count = countDocs / limit
    const books = await Book.find({status : "public"},{'__v': false})
    .skip(skip)
    .limit(limit)
    .populate('user', ["-password","-__v"]);

    res.status(200).json(ResultData({
        pagination: {
            count
        },
        books
    }))
})

const getAllBooks = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 0; 
    const limit = parseInt(req.query.limit) || 0;
    const skip = (page - 1) * limit;

    const countDocs = await Book.countDocuments()

    const count = countDocs / limit
    const books = await Book.find({},{'__v': false})
    .skip(skip)
    .limit(limit)
    .populate('user', ["-password","-__v"]);
    res.status(200).json(ResultData({
        pagination: {
            count
        },
        books
    }))
})

// ######
const getBookById = asyncHandler(async (req, res, next) => {
    const book = await Book.findById(req.params.id).populate('user', ["-password","-__v"])
    if (!book) {
        return res.status(404).json(ResultError('fail', 404, "Not found book"))
    }
    if (book.status === "public") {
        return res.status(200).json(ResultData({book}))
    } else if (book.user._id.toString() === req.user._id || req.user.isAdmin) {
        return res.status(200).json(ResultData({book}))
    }else {
        return res.status(404).json(ResultError('fail', 404, "Not found book"))
    }
})

// ######
const addBook = asyncHandler(async (req, res, next) => {
    const image = req.file.filename
    let imagePath = path.join(__dirname, "../uploads/books/" + image)
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let err = errors.array()[0]
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath)
        }
        return res.status(400).json(ResultError("fail", 400, err.path + ' is ' + err.msg));
    }

    // up file
    const resultUploadImage = await cloudUploadImage(imagePath, "images");
    const book = new Book({user : req.user._id, ...req.body});
    
    if (resultUploadImage.public_id) {
        book.image = {
            url: resultUploadImage.url,
            publicId: resultUploadImage.public_id
        }
    }

    await book.save();
    res.status(200).json(ResultData({book}))
    // remove file from local
    fs.unlinkSync(imagePath)
})

// ###
const editBookById = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let err = errors.array()[0]
        return res.status(400).json(ResultError("fail", 400, err.path + ' is ' + err.msg));
    }
    const data = matchedData(req)
    console.log(data);
    const book = await Book.findById(req.params.id)
    if (!book) {
        return res.status(404).json(ResultError('fail', 404, "Not found book"))
    }
    if (book.user.toString() === req.user._id || req.user.isAdmin) {
        const bookEdit = await Book.findByIdAndUpdate(req.params.id, {$set: {...data}},{new: true}, {$sort : {'__v': false}})
        return res.status(200).json(ResultData({book:bookEdit}))
    }
    return res.status(403).json(ResultError('fail', 403, "Not are admin"))

})

const deleteBook = asyncHandler(async (req, res, next) => {
    const book = await Book.findById(req.params.id)
    if (!book) {
        return res.status(404).json(ResultError('fail', 404, "Not found book"))
    }
    if (book.user.toString() === req.user._id || req.user.isAdmin) {
        const bookDel = await Book.findByIdAndDelete(req.params.id);
        await cloudRemoveImage(bookDel.image.publicId);
        return res.status(200).json(bookDel);
    }
    return res.status(403).json(ResultError('fail', 403, "Not are admin"))
})


const updateBookPhoto = asyncHandler(async (req, res) => {
    const imageName = req.file.filename
    let imagePath = path.join(__dirname, "../uploads/books/" + imageName)
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let err = errors.array()[0]
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath)
        }
        return res.status(400).json(ResultError("fail", 400, err.path + ' is ' + err.msg));
    }
    
    const book = await Book.findById(req.params.id)
    if (!book) {
        fs.unlinkSync(imagePath)
        return res.status(404).json(ResultError('fail', 404, "Not found book"))
    }
    if (book.user.toString() === req.user._id || req.user.isAdmin) {
        const resultUploadImage = await cloudUploadImage(imagePath, "images");
        if (resultUploadImage) {
            fs.unlinkSync(imagePath)
            if (book.image.publicId) {
                await cloudRemoveImage(book.image.publicId);
            }
        }
        const bookEdit = await Book.findByIdAndUpdate(req.params.id, {$set: {
                image: {
                    url: resultUploadImage.url,
                    publicId: resultUploadImage.public_id
                }
            }
        }, {new: true}, {$sort : {'__v': false}})
        return res.status(200).json(ResultData({book:bookEdit}))
    }
    
    
    
    fs.unlinkSync(imagePath)
    return res.status(403).json(ResultError('fail', 403, "Not are admin"))
})



export {addBook, getBooks, getAllBooks, getBookById, editBookById, deleteBook, updateBookPhoto}