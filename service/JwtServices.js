const jwt = require('jsonwebtoken');
const JwtServices = {
    generateToken: function({user,exp}) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        if (exp) {
            return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: exp });
        } else {
            return jwt.sign(payload, process.env.JWT_SECRET);
        }
    },
    verifyToken: function(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    },
    decodeToken: function(token) {
        try {
            return jwt.decode(token);
            
        } catch (error) {
            throw new Error('Invalid token');
        }
    },
    refreshToken: function(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    }
}
module.exports = JwtServices;
