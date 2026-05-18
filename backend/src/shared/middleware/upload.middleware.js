const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const AVATAR_SIZE = 200;
const AVATAR_DIR = path.join(__dirname, '../../../uploads/avatars');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

const processAvatar = async (req, res, next) => {
    if (!req.file) return next();

    try {
        if (!fs.existsSync(AVATAR_DIR)) {
            fs.mkdirSync(AVATAR_DIR, { recursive: true });
        }

        const filename = `avatar_${req.user.userId}_${Date.now()}.jpg`;
        const filepath = path.join(AVATAR_DIR, filename);

        await sharp(req.file.buffer)
            .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover' })
            .jpeg({ quality: 90 })
            .toFile(filepath);

        req.file.savedPath = `/uploads/avatars/${filename}`;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { upload, processAvatar };
