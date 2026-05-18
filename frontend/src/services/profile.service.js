import { http } from './http.helper';
import { PROFILE_API } from '../config/api.config';

export const profileService = {
  getProfile:  ()       => http.get(PROFILE_API.get),
  updateProfile: (data) => http.put(PROFILE_API.update, data),
  changePassword: (data)=> http.put(PROFILE_API.password, data),
  uploadAvatar: (file)  => {
    const fd = new FormData();
    fd.append('avatar', file);
    return http.upload(PROFILE_API.avatar, fd);
  },
  getHistory:  (params) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([,v]) => v)).toString();
    return http.get(`${PROFILE_API.history}${qs ? '?' + qs : ''}`);
  },
  deposit:              (amount)                    => http.post(PROFILE_API.deposit, { amount }),
  subscribe:            ()                           => http.post(PROFILE_API.subscribe, {}),
  createStripeCheckout: (successUrl, cancelUrl)      => http.post(PROFILE_API.stripeCheckout, { successUrl, cancelUrl }),
};
