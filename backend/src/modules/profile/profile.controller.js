const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const profileService = require('./profile.service');
const { userResponseDTO } = require('../../shared/dtos/user.dto');
const { gameHistoryDTO } = require('../game/game.dto');

class ProfileController {
    async getProfile(req, res) {
        try {
            const user = await profileService.getProfile(req.user.userId);
            res.status(200).json(userResponseDTO(user));
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const { username, email, country } = req.body;
            const updated = await profileService.updateProfile(req.user.userId, { username, email, country });
            res.status(200).json({ message: 'Profile updated successfully', user: userResponseDTO(updated) });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            await profileService.changePassword(req.user.userId, currentPassword, newPassword);
            res.status(200).json({ message: 'Password changed successfully' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async uploadAvatar(req, res) {
        try {
            if (!req.file?.savedPath) {
                return res.status(400).json({ message: 'No image file provided' });
            }
            const updated = await profileService.updateAvatar(req.user.userId, req.file.savedPath);
            res.status(200).json({ message: 'Avatar updated successfully', user: userResponseDTO(updated) });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getGameHistory(req, res) {
        try {
            const { search, startDate, endDate, result, gameType, sort } = req.query;
            const userId = req.user.userId;

            let games;
            if (search) {
                games = await profileService.searchGameHistory(userId, search);
            } else if (startDate || endDate || result || gameType || sort) {
                games = await profileService.filterGameHistory(userId, {
                    startDate,
                    endDate,
                    result,
                    gameType,
                    sortOrder: sort || 'desc',
                });
            } else {
                games = await profileService.getGameHistory(userId);
            }

            res.status(200).json(games.map((g) => gameHistoryDTO(g, userId)));
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deposit(req, res) {
        try {
            const { amount } = req.body;
            if (!amount || isNaN(amount)) {
                return res.status(400).json({ message: 'Valid amount is required' });
            }
            const updated = await profileService.deposit(req.user.userId, Number(amount));
            res.status(200).json({ message: `$${amount} deposited successfully`, user: userResponseDTO(updated) });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async subscribe(req, res) {
        try {
            const updated = await profileService.subscribe(req.user.userId);
            res.status(200).json({ message: 'Premium subscription activated', user: userResponseDTO(updated) });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async stripeCheckout(req, res) {
        try {
            const { successUrl, cancelUrl } = req.body;
            if (!successUrl || !cancelUrl) {
                return res.status(400).json({ message: 'successUrl and cancelUrl are required' });
            }
            const result = await profileService.createStripeCheckout(req.user.userId, successUrl, cancelUrl);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async stripeWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('[Stripe Webhook] Signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            if (userId) {
                try {
                    await profileService.activatePremiumFromStripe(userId);
                    console.log(`[Stripe] Premium activated for user ${userId}`);
                } catch (err) {
                    console.error('[Stripe] Failed to activate premium:', err.message);
                }
            }
        }

        res.json({ received: true });
    }
}

module.exports = new ProfileController();
