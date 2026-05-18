import { authService } from '../../services/auth.service';

export const loginUser = (credentials) => authService.login(credentials);
