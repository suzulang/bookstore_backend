const ResultData = (data, token) => {
    return {
        status: "success",
        statusCode: 200,
        ...data
    }
}



const ResultError = (status, statusCode, message) => {
    let error = new Error()
    error.status = status;
    error.statusCode = statusCode;
    if (status === "fail") {
        error.data = message;
    } else {
        error.message = message;
    }
    return error
}

export {ResultData, ResultError}