import { http } from './http.helper';
import { AUTH_API } from '../config/api.config';

export const authService = {
  register: (data) => http.post(AUTH_API.register, data),
  login:    (data) => http.post(AUTH_API.login, data),
  logout:   ()     => http.post(AUTH_API.logout, {}),
};
