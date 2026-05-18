import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function useLoginForm() {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const registered = location.state?.registered;
    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        if (user) navigate(from, { replace: true });
    }, [user, navigate, from]);

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.identifier || !form.password) { setError('Please fill in all fields'); return; }
        setLoading(true);
        setError('');
        try {
            const loggedUser = await login(form.identifier, form.password);
            navigate(loggedUser.role === 'ADMIN' ? '/admin/players' : '/', { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return { form, error, loading, showPass, setShowPass, registered, handleChange, handleSubmit };
}
