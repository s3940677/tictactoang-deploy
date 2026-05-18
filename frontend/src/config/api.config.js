const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AUTH_API = {
  register: `${BASE}/api/auth/register`,
  login:    `${BASE}/api/auth/login`,
  logout:   `${BASE}/api/auth/logout`,
};

export const PROFILE_API = {
  get:       `${BASE}/api/profile`,
  update:    `${BASE}/api/profile`,
  password:  `${BASE}/api/profile/password`,
  avatar:    `${BASE}/api/profile/avatar`,
  history:   `${BASE}/api/profile/history`,
  deposit:              `${BASE}/api/profile/wallet/deposit`,
  subscribe:            `${BASE}/api/profile/subscription`,
  stripeCheckout:       `${BASE}/api/profile/subscription/stripe/create-checkout-session`,
};

export const GAME_API = {
  create:  `${BASE}/api/game`,
  history: `${BASE}/api/game/history`,
  get:     (id) => `${BASE}/api/game/${id}`,
  move:    (id) => `${BASE}/api/game/${id}/move`,
  abort:   (id) => `${BASE}/api/game/${id}/abort`,
  replay:  (id) => `${BASE}/api/game/${id}/replay`,
};

export const ADMIN_API = {
  players:    `${BASE}/api/admin/players`,
  status:     (id) => `${BASE}/api/admin/status/${id}`,
  games:      `${BASE}/api/admin/games`,
  gameSearch: `${BASE}/api/admin/games/search`,
  closeGame:  (id) => `${BASE}/api/admin/games/${id}/close`,
};

// Avatar paths from the backend start with "/uploads/avatars/..."
// so we just prepend the base URL, not an extra /uploads segment.
export const getAvatarUrl = (avatarPath) => avatarPath ? `${BASE}${avatarPath}` : null;
