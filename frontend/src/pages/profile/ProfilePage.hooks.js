import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchProfile, saveProfile, savePassword, uploadAvatar, depositWallet, subscribePremium, createStripeCheckout } from './ProfilePage.service';

export function useProfile() {
    const { refreshUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile().then(({ data, ok }) => {
            if (ok) {
                setProfile(data);
                refreshUser(data);
            }
        }).finally(() => setLoading(false));
    }, []);

    return { profile, setProfile, loading };
}

export function useInfoForm(profile, setProfile) {
    const { refreshUser } = useAuth();
    const [infoForm, setInfoForm] = useState({ username: '', email: '', country: '' });
    const [infoErrors, setInfoErrors] = useState({});
    const [infoAlert, setInfoAlert] = useState(null);
    const [infoLoading, setInfoLoading] = useState(false);

    useEffect(() => {
        if (profile) setInfoForm({ username: profile.username, email: profile.email, country: profile.country });
    }, [profile]);

    const handleInfoChange = (e) => {
        setInfoForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setInfoErrors(err => ({ ...err, [e.target.name]: '' }));
    };

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!infoForm.username.trim()) errs.username = 'Required';
        else if (!/^[a-zA-Z0-9_-]+$/.test(infoForm.username)) errs.username = 'Only letters, numbers, _ and - (e.g., player_1)';
        if (!infoForm.email.trim()) errs.email = 'Required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(infoForm.email)) errs.email = 'Invalid email — e.g., you@example.com';
        if (Object.keys(errs).length) { setInfoErrors(errs); return; }
        setInfoLoading(true);
        const { data, ok } = await saveProfile(infoForm);
        setInfoLoading(false);
        if (ok) {
            setProfile(data.user);
            refreshUser(data.user);
            setInfoAlert({ type: 'success', msg: 'Profile updated successfully!' });
        } else {
            setInfoAlert({ type: 'error', msg: data?.message || data?.errors?.[0]?.msg || 'Update failed' });
        }
    };

    return { infoForm, infoErrors, infoAlert, infoLoading, handleInfoChange, handleInfoSubmit };
}

export function usePasswordForm() {
    const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [passErrors, setPassErrors] = useState({});
    const [passAlert, setPassAlert] = useState(null);
    const [passLoading, setPassLoading] = useState(false);

    const handlePassChange = (e) => {
        setPassForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setPassErrors(err => ({ ...err, [e.target.name]: '' }));
    };

    const handlePassSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!passForm.currentPassword) errs.currentPassword = 'Required';
        if (!passForm.newPassword) errs.newPassword = 'Required';
        else if (passForm.newPassword.length < 8) errs.newPassword = 'Min 8 characters — e.g., MyPass1!';
        else if (!/[A-Z]/.test(passForm.newPassword)) errs.newPassword = 'Must include uppercase — e.g., MyPass1!';
        else if (!/[0-9]/.test(passForm.newPassword)) errs.newPassword = 'Must include a number — e.g., MyPass1!';
        else if (!/[@$!%*?&#]/.test(passForm.newPassword)) errs.newPassword = 'Must include special char (@$!%*?&#) — e.g., MyPass1!';
        if (passForm.newPassword !== passForm.confirm) errs.confirm = 'Passwords do not match';
        if (Object.keys(errs).length) { setPassErrors(errs); return; }
        setPassLoading(true);
        const { data, ok } = await savePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
        setPassLoading(false);
        if (ok) {
            setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
            setPassAlert({ type: 'success', msg: 'Password changed successfully!' });
        } else {
            setPassAlert({ type: 'error', msg: data?.message || 'Failed to change password' });
        }
    };

    return { passForm, passErrors, passAlert, passLoading, handlePassChange, handlePassSubmit };
}

export function useAvatarUpload(setProfile) {
    const { refreshUser } = useAuth();
    const fileInputRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarAlert, setAvatarAlert] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const handleAvatarFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        setAvatarLoading(true);
        const { data, ok } = await uploadAvatar(avatarFile);
        setAvatarLoading(false);
        if (ok) {
            setProfile(data.user);
            refreshUser(data.user);
            setAvatarPreview(null);
            setAvatarFile(null);
            setAvatarAlert({ type: 'success', msg: 'Avatar updated!' });
        } else {
            setAvatarAlert({ type: 'error', msg: data?.message || 'Upload failed' });
        }
    };

    return { fileInputRef, avatarPreview, avatarFile, avatarAlert, avatarLoading, handleAvatarFile, handleAvatarUpload };
}

export function useWallet(setProfile) {
    const { refreshUser } = useAuth();
    const [depositModal, setDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [depositAlert, setDepositAlert] = useState(null);
    const [depositLoading, setDepositLoading] = useState(false);
    const [subAlert, setSubAlert] = useState(null);
    const [subLoading, setSubLoading] = useState(false);
    const [stripeLoading, setStripeLoading] = useState(false);

    // Show feedback when returning from Stripe checkout
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('stripe') === 'success') {
            setSubAlert({ type: 'success', msg: 'Payment successful! Your Premium subscription is now active.' });
            // Refresh profile to reflect updated premium status
            fetchProfile().then(({ data, ok }) => {
                if (ok) { setProfile(data); refreshUser(data); }
            });
            window.history.replaceState({}, '', window.location.pathname);
        } else if (params.get('stripe') === 'cancelled') {
            setSubAlert({ type: 'warning', msg: 'Payment cancelled. No charge was made.' });
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const handleDeposit = async () => {
        const amount = parseFloat(depositAmount);
        if (!amount || amount <= 0) { setDepositAlert({ type: 'error', msg: 'Enter a valid amount greater than 0' }); return; }
        setDepositLoading(true);
        const { data, ok } = await depositWallet(amount);
        setDepositLoading(false);
        if (ok) {
            setProfile(data.user);
            refreshUser(data.user);
            setDepositModal(false);
            setDepositAmount('');
            setDepositAlert(null);
        } else {
            setDepositAlert({ type: 'error', msg: data?.message || 'Deposit failed' });
        }
    };

    const handleSubscribe = async () => {
        setSubLoading(true);
        const { data, ok } = await subscribePremium();
        setSubLoading(false);
        if (ok) {
            setProfile(data.user);
            refreshUser(data.user);
            setSubAlert({ type: 'success', msg: 'Premium activated! Enjoy your subscription.' });
        } else {
            setSubAlert({ type: 'error', msg: data?.message || 'Subscription failed. Check your wallet balance.' });
        }
    };

    const handleStripeSubscribe = async () => {
        setStripeLoading(true);
        const base = window.location.origin;
        const successUrl = `${base}/profile?stripe=success`;
        const cancelUrl  = `${base}/profile?stripe=cancelled`;
        const { data, ok } = await createStripeCheckout(successUrl, cancelUrl);
        setStripeLoading(false);
        if (ok && data.url) {
            window.location.href = data.url;
        } else {
            setSubAlert({ type: 'error', msg: data?.message || 'Failed to start Stripe checkout. Try again.' });
        }
    };

    return {
        depositModal, setDepositModal, depositAmount, setDepositAmount,
        depositAlert, depositLoading, subAlert, subLoading,
        stripeLoading,
        handleDeposit, handleSubscribe, handleStripeSubscribe,
    };
}
