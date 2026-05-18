import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from './RegisterPage.service';

function validate(form) {
    const errors = {};
    if (!form.username.trim()) errors.username = 'Username is required — e.g., player_one';
    else if (!/^[a-zA-Z0-9_-]+$/.test(form.username))
        errors.username = 'Only letters, numbers, _ and - allowed — e.g., player_one';
    if (!form.email.trim()) errors.email = 'Email is required — e.g., you@example.com';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errors.email = 'Invalid email format — must contain @ and a domain, e.g., you@example.com';
    else if (form.email.length >= 255) errors.email = 'Email too long (max 255 characters)';
    if (!form.password) errors.password = 'Password is required';
    else if (form.password.length < 8) errors.password = 'At least 8 characters required — e.g., MyPass1!';
    else if (!/[A-Z]/.test(form.password)) errors.password = 'Must include an uppercase letter — e.g., MyPass1!';
    else if (!/[0-9]/.test(form.password)) errors.password = 'Must include a number — e.g., MyPass1!';
    else if (!/[@$!%*?&#]/.test(form.password)) errors.password = 'Must include a special character (@$!%*?&#) — e.g., MyPass1!';
    if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match — both fields must be identical';
    if (!form.country) errors.country = 'Please select your country';
    return errors;
}

export function usePasswordStrength(password) {
    const checks = [
        { label: '8+ characters', ok: password.length >= 8 },
        { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
        { label: 'Number', ok: /[0-9]/.test(password) },
        { label: 'Special character', ok: /[@$!%*?&#]/.test(password) },
    ];
    const score = checks.filter(c => c.ok).length;
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    return { checks, score, colors, labels };
}

export function useRegisterForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', country: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (errors[name]) setErrors(err => ({ ...err, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        setServerError('');
        try {
            const { data, ok } = await registerUser(form);
            if (!ok) {
                setServerError(data?.errors?.[0]?.msg || data?.message || 'Registration failed');
                return;
            }
            navigate('/login', { state: { registered: true } });
        } catch {
            setServerError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return { form, errors, serverError, loading, showPass, setShowPass, handleChange, handleSubmit };
}
