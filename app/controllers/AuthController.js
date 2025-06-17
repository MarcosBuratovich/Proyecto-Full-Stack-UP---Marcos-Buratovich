const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const CONFIG = require('../config/config');

const signToken = (user) => {
    return jwt.sign({ id: user._id, name: user.name, username: user.username, role: user.role }, CONFIG.JWT_SECRET, {
        expiresIn: CONFIG.JWT_EXPIRES_IN
    });
};

const register = async (req, res) => {
    try {
        const newUser = await User.create({
            username: req.body.username,
            password: req.body.password,
            name: req.body.name,
            role: req.body.role || 'staff',
            permissions: req.body.permissions || []
        });
        newUser.password = undefined;

        return res.status(201).json({
            status: 'success',
            user: newUser
        });
    } catch (err) {
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide username and password'
            });
        }

        const user = await User.findOne({ username }).select('+password');
        
        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: 'error',
                message: 'Incorrect username or password'
            });
        }

        // Only staff and admin can log in
        if (user.role !== 'staff' && user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Access denied: only staff or admin can log in.' });
        }

        const token = signToken(user);
        
        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            user
        });
    } catch (err) {
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            user
        });
    } catch (err) {
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
};

module.exports = {
    login,
    register,
    getProfile
};
