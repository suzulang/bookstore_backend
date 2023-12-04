import mongoose from "mongoose";
import { ResultError } from "../utils/resultData.js";

const CheckId = (req, res, next) => {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next()
    }
    else {
        return next(ResultError('fail', 400, "Id is not valid"))
    }
}

export default CheckId;