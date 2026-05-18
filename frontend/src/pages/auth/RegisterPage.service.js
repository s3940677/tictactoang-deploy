import { authService } from '../../services/auth.service';

export const registerUser = (formData) => authService.register(formData);
