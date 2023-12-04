import jwt from "jsonwebtoken";
import { ResultError } from "../utils/resultData.js";


function checkToken(req, res, next) {
    const reqToken = req.headers.authorization || req.headers.token;
    if (!reqToken) {
        return res.status(400).json(ResultError('fail', 400, "please write your token"))
    }
    const token = reqToken.split(' ')[1]
    if (!token) {
        return res.status(400).json(ResultError('fail', 400, "please write your token"))
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decodedToken;
        req.token = token;
        return next();
    } catch (error) {
        return res.status(401).json(ResultError('fail', 401, "token is not valid"))
    }
}

function isAdmin(req, res, next) {
    checkToken(req, res, function () {
        if (req.user.isAdmin) {
            return next()
        }
        else {
            return next(ResultError('fail', 403, "Your not admin"))
        }
    })
}

function userSelfAndAdmin(req, res, next) {
    checkToken(req, res, function () {
        if (req.user._id === req.params.id || req.user.isAdmin) {
            return next()
        }
        else {
            return next(ResultError('fail', 403, "Your not admin"))
        }
    })
}

export {checkToken, isAdmin, userSelfAndAdmin};