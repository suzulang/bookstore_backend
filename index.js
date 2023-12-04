import express, { json } from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/auth.route.js";
import booksRouter from "./routes/books.route.js";
import UsersRouter from "./routes/profile.route.js";
import { configDotenv } from "dotenv";
import { ResultError } from "./utils/resultData.js";

configDotenv()

const {DBLINK, PORT, WEB_SITE_FOR_CORS} = process.env;

const corsOptions = {
    origin: WEB_SITE_FOR_CORS,
    optionsSuccessStatus: 200,
};

mongoose.connect(DBLINK)
    .then(e => {
        console.log('db connected ..');
    }).catch(error=> console.log(error))

const app = express();

app.use(cors(corsOptions))
app.use(json())

app.use('/api/auth', authRouter)
app.use('/api/books', booksRouter)
app.use('/api/profile', UsersRouter)

app.all('*', (req, res, next) => {
    next(ResultError("error", 404, 'Not Found ' + req.originalUrl));
})

app.use((error, req, res, next) => {
    const statusCode = error.statusCode ? error.statusCode : res.statusCode === 200 ? 500 : res.statusCode;
    if (error.data) {
        return res.status(statusCode).json({
            status: error.status,
            data: error.data
        })
    }
    res.status(statusCode).json({
        status: "error",
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack
    })
    
})

app.listen(PORT, ()=> {
    console.log(`server port ${PORT}`);
})