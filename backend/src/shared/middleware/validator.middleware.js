const { body, validationResult } = require('express-validator');

const registerValidator = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Invalid username — only English letters, numbers, underscore (_), and hyphen (-) are allowed. Example: player_one'),

    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format — must contain exactly one "@" and at least one "." after "@". Example: user@example.com')
        .isLength({ max: 255 }).withMessage('Email must be less than 255 characters. Example: user@example.com')
        .not().matches(/[ ();:]/).withMessage('Email must not contain spaces or prohibited characters ( ) ; : — Example: user@example.com'),

    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long. Example: MyPass1!')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter (A-Z). Example: MyPass1!')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter (a-z). Example: MyPass1!')
        .matches(/[0-9]/).withMessage('Password must contain at least one number (0-9). Example: MyPass1!')
        .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&). Example: MyPass1!'),

    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match — both passwords must be identical');
        }
        return true;
    }),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        next();
    },
];

const updateProfileValidator = [
    body('email')
        .optional()
        .isEmail().withMessage('Invalid email format. Example: user@example.com')
        .isLength({ max: 255 }).withMessage('Email must be less than 255 characters')
        .not().matches(/[ ();:]/).withMessage('Email must not contain spaces or prohibited characters ( ) ; :'),
    body('username')
        .optional()
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain English letters, numbers, underscore (_), and hyphen (-). Example: player_1'),
    body('country')
        .optional()
        .notEmpty().withMessage('Country cannot be empty'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        next();
    },
];

const changePasswordValidator = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long. Example: MyPass1!')
        .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter. Example: MyPass1!')
        .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter. Example: MyPass1!')
        .matches(/[0-9]/).withMessage('New password must contain at least one number. Example: MyPass1!')
        .matches(/[@$!%*?&]/).withMessage('New password must contain at least one special character (@$!%*?&). Example: MyPass1!'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        next();
    },
];

module.exports = { registerValidator, updateProfileValidator, changePasswordValidator };
