// middleware/dynamicUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dynamicUpload = (subfolder = '') => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join(__dirname, '..', 'uploads', subfolder || 'default');
            fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|svg|pdf|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) cb(null, true);
        else cb(new Error('Only images are allowed'));
    };

    return multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter,
    });
};

module.exports = dynamicUpload;
