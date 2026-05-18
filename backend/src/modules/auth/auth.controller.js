const authService = require('./auth.service');
const { userResponseDTO } = require('../../shared/dtos/user.dto');

class AuthController {
    async register(req, res) {
        try {
            const newUser = await authService.register(req.body);
            res.status(201).json({
                message: 'User registered successfully',
                user: userResponseDTO(newUser),
            });
        } catch (error) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                return res.status(400).json({
                    message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
                });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { identifier, password } = req.body;
            const { token, user } = await authService.login(identifier, password);
            res.status(200).json({
                message: 'Login successful',
                token,
                user: userResponseDTO(user),
            });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    async logout(req, res) {
        try {
            const token = req.headers['authorization']?.split(' ')[1];
            await authService.logout(token);
            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Logout failed' });
        }
    }
}

module.exports = new AuthController();
