import { Router } from "express";
import multer from "multer";

import {addBook,deleteBook,editBookById,getAllBooks,getBookById,getBooks, updateBookPhoto, searchBooks} from "../controllers/books.controller.js";
import {checkToken, isAdmin} from "../middlewares/verifyAuth.js";
import CheckId from "../middlewares/checkId.js";
import { validateBook, validateUpdateBook } from "../models/book.model.js";


const storage = multer.diskStorage({
    destination: 'uploads/books/',
    filename: (req, file, cb) => {
        const newFilename = `${Date.now()}-${file.originalname}`;
        cb(null, newFilename);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/png', 'image/webp', 'image/jpeg'];
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true); // قبول الملف
    } else {
        cb(null, false); // رفض الملف
    }
};

const upload = multer({ storage, fileFilter })

const router = Router();


router.route('/')
    .get(getBooks)
    .post(upload.single('image'), validateBook , checkToken, addBook);

router.route('/admin')
    .get(isAdmin, getAllBooks);

router.route('/search')
    .get(searchBooks);

router.route('/:id')
    .get(CheckId, checkToken, getBookById)
    .put(CheckId, validateUpdateBook , checkToken, editBookById)
    .delete(CheckId, checkToken, deleteBook);

router.route('/updateBookPhoto/:id')
    .post(upload.single('image') ,CheckId, checkToken, updateBookPhoto)




export default router