import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

async function generateToken(payload, secret, options) {
    return jwt.sign(payload, secret, options);
}

export { hashPassword, comparePassword, generateToken };