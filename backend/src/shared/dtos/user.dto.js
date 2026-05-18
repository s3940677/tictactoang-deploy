const userResponseDTO = (user) => {
    return {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        country: user.country,
        isPremium: user.isPremium || false,
        premiumExpiry: user.premiumExpiry || null,
        avatar: user.avatar || null,
        wallet: user.wallet ?? 0,
        status: user.status,
    };
};

module.exports = { userResponseDTO };
