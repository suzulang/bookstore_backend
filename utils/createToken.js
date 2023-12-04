import jwt from "jsonwebtoken"

const createToken = async (data) => {
    const token = await jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '3h' });
    return token;
}

export default createToken;
