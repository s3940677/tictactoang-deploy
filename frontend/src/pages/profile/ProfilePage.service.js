import { profileService } from '../../services/profile.service';

export const fetchProfile         = ()                           => profileService.getProfile();
export const saveProfile          = (data)                       => profileService.updateProfile(data);
export const savePassword         = (data)                       => profileService.changePassword(data);
export const uploadAvatar         = (file)                       => profileService.uploadAvatar(file);
export const depositWallet        = (amount)                     => profileService.deposit(amount);
export const subscribePremium     = ()                           => profileService.subscribe();
export const createStripeCheckout = (successUrl, cancelUrl)      => profileService.createStripeCheckout(successUrl, cancelUrl);
