import { useState } from 'react';
import { getAvatarUrl } from '../../config/api.config';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { useProfile, useInfoForm, usePasswordForm, useAvatarUpload, useWallet } from './ProfilePage.hooks';

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Bangladesh','Belgium',
  'Brazil','Cambodia','Canada','Chile','China','Colombia','Croatia','Czech Republic','Denmark',
  'Egypt','Ethiopia','Finland','France','Germany','Ghana','Greece','Hungary','India','Indonesia',
  'Iran','Iraq','Ireland','Israel','Italy','Japan','Jordan','Kenya','Malaysia','Mexico',
  'Morocco','Myanmar','Netherlands','New Zealand','Nigeria','Norway','Pakistan','Peru',
  'Philippines','Poland','Portugal','Romania','Russia','Saudi Arabia','Singapore','South Africa',
  'South Korea','Spain','Sri Lanka','Sweden','Switzerland','Thailand','Turkey','Ukraine',
  'United Kingdom','United States','Venezuela','Vietnam','Other'
];

function StatCard({ label, value, color = 'text-violet-400' }) {
  return (
    <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, setProfile, loading } = useProfile();
  const { infoForm, infoErrors, infoAlert, infoLoading, handleInfoChange, handleInfoSubmit } = useInfoForm(profile, setProfile);
  const { passForm, passErrors, passAlert, passLoading, handlePassChange, handlePassSubmit } = usePasswordForm();
  const { fileInputRef, avatarPreview, avatarFile, avatarAlert, avatarLoading, handleAvatarFile, handleAvatarUpload } = useAvatarUpload(setProfile);
  const { depositModal, setDepositModal, depositAmount, setDepositAmount, depositAlert, depositLoading, subAlert, subLoading, stripeLoading, handleDeposit, handleSubscribe, handleStripeSubscribe } = useWallet(setProfile);

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('stripe') ? 'wallet' : 'info';
  });

  if (loading) return <PageLoader />;
  if (!profile) return null;

  const avatarSrc = getAvatarUrl(profile.avatar);
  const premiumExpiry = profile.premiumExpiry ? new Date(profile.premiumExpiry).toLocaleDateString() : null;

  const tabs = [
    { id: 'info', label: 'Profile Info' },
    { id: 'security', label: 'Security' },
    { id: 'avatar', label: 'Avatar' },
    { id: 'wallet', label: 'Wallet & Premium' },
  ];

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="card p-6 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-violet-500/30 bg-slate-700">
                {(avatarPreview || avatarSrc) ? (
                  <img src={avatarPreview || avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-4xl font-black text-white">
                    {profile.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              {profile.isPremium && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-sm shadow-lg">⭐</div>
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">{profile.username}</h1>
                {profile.isPremium ? (
                  <span className="badge-premium self-center sm:self-auto">⭐ Premium</span>
                ) : (
                  <span className="inline-flex items-center bg-slate-700/50 text-slate-400 text-xs font-medium px-2.5 py-0.5 rounded-full border border-slate-600">Free</span>
                )}
              </div>
              <p className="text-slate-400 text-sm">{profile.email}</p>
              <p className="text-slate-500 text-xs mt-1">📍 {profile.country}</p>
              {profile.isPremium && premiumExpiry && (
                <p className="text-yellow-500/80 text-xs mt-1">Premium until {premiumExpiry}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
            <StatCard label="Wallet Balance" value={`$${profile.wallet?.toFixed(2) || '0.00'}`} color="text-emerald-400" />
            <StatCard label="Role" value={profile.role} color="text-violet-400" />
            <StatCard label="Status" value={profile.status} color={profile.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'info' && (
            <div className="card p-6">
              <h2 className="section-title mb-0">Edit Profile</h2>
              <p className="section-subtitle">Update your personal information</p>
              {infoAlert && <Alert type={infoAlert.type} message={infoAlert.msg} className="mb-4" />}
              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <Input label="Username" name="username" value={infoForm.username} onChange={handleInfoChange} error={infoErrors.username} />
                <Input label="Email" name="email" type="email" value={infoForm.email} onChange={handleInfoChange} error={infoErrors.email} />
                <Select
                  label="Country"
                  name="country"
                  value={infoForm.country}
                  onChange={handleInfoChange}
                  options={[{ value: '', label: 'Select country' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]}
                />
                <div className="flex justify-end pt-2">
                  <Button type="submit" loading={infoLoading}>Save Changes</Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6">
              <h2 className="section-title mb-0">Change Password</h2>
              <p className="section-subtitle">Keep your account secure</p>
              {passAlert && <Alert type={passAlert.type} message={passAlert.msg} className="mb-4" />}
              <form onSubmit={handlePassSubmit} className="space-y-4">
                <Input label="Current Password" name="currentPassword" type="password" value={passForm.currentPassword} onChange={handlePassChange} error={passErrors.currentPassword} />
                <Input label="New Password" name="newPassword" type="password" value={passForm.newPassword} onChange={handlePassChange} error={passErrors.newPassword} hint="Min 8 chars, 1 uppercase, 1 number, 1 special char — e.g., MyPass1!" />
                <Input label="Confirm New Password" name="confirm" type="password" value={passForm.confirm} onChange={handlePassChange} error={passErrors.confirm} />
                <div className="flex justify-end pt-2">
                  <Button type="submit" loading={passLoading}>Update Password</Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'avatar' && (
            <div className="card p-6">
              <h2 className="section-title mb-0">Profile Picture</h2>
              <p className="section-subtitle">Upload a custom avatar (auto-resized)</p>
              {avatarAlert && <Alert type={avatarAlert.type} message={avatarAlert.msg} className="mb-4" />}
              <div className="flex flex-col items-center gap-5">
                <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-violet-500/30 bg-slate-700">
                  {(avatarPreview || avatarSrc) ? (
                    <img src={avatarPreview || avatarSrc} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-5xl font-black text-white">
                      {profile.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => fileInputRef.current.click()} type="button">Choose Image</Button>
                  {avatarFile && (
                    <Button onClick={handleAvatarUpload} loading={avatarLoading} type="button">Upload Avatar</Button>
                  )}
                </div>
                {avatarFile && <p className="text-slate-400 text-sm">{avatarFile.name}</p>}
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-4">
              <div className="card p-6">
                <h2 className="section-title mb-0">Wallet</h2>
                <p className="section-subtitle">Manage your in-game balance</p>
                {subAlert && <Alert type={subAlert.type} message={subAlert.msg} className="mb-4" />}
                <div className="flex items-center justify-between bg-slate-900/60 rounded-xl p-5 border border-slate-700/50 mb-4">
                  <div>
                    <p className="text-slate-400 text-sm">Current Balance</p>
                    <p className="text-3xl font-black text-emerald-400">${profile.wallet?.toFixed(2) || '0.00'}</p>
                  </div>
                  <Button onClick={() => setDepositModal(true)} variant="success">+ Deposit</Button>
                </div>
              </div>

              <div className={`card p-6 ${profile.isPremium ? 'border-yellow-700/50 bg-yellow-900/10' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="section-title mb-0 flex items-center gap-2">⭐ Premium Subscription</h2>
                    <p className="section-subtitle">Unlock replay, custom markers, and more</p>
                  </div>
                  {profile.isPremium && <span className="badge-premium">Active</span>}
                </div>

                {profile.isPremium ? (
                  <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-4">
                    <p className="text-yellow-300 font-semibold">✅ You have an active Premium subscription</p>
                    {premiumExpiry && <p className="text-yellow-500/80 text-sm mt-1">Expires: {premiumExpiry}</p>}
                    <ul className="mt-3 text-sm text-yellow-200/70 space-y-1">
                      <li>✓ Game replay with step controls</li>
                      <li>✓ Advanced AI difficulty modes</li>
                      <li>✓ Priority matchmaking</li>
                    </ul>
                  </div>
                ) : (
                  <div>
                    <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-semibold">Monthly Premium</span>
                        <span className="text-2xl font-black text-violet-400">$10.00</span>
                      </div>
                      <ul className="text-sm text-slate-400 space-y-1.5 mb-3">
                        <li className="flex items-center gap-2"><span className="text-violet-400">✓</span> Game replay with Pause/Resume/Forward/Backward</li>
                        <li className="flex items-center gap-2"><span className="text-violet-400">✓</span> Full AI mode access (Easy/Medium/Hard)</li>
                        <li className="flex items-center gap-2"><span className="text-violet-400">✓</span> Algebraic notation board display</li>
                      </ul>
                      <p className="text-slate-500 text-xs">Current balance: <span className={profile.wallet >= 10 ? 'text-emerald-400' : 'text-red-400'}>${profile.wallet?.toFixed(2) || '0.00'}</span></p>
                    </div>
                    {profile.wallet < 10 && (
                      <Alert type="warning" message="Insufficient balance. Deposit at least $10 to subscribe via wallet." className="mb-3" />
                    )}
                    <Button
                      onClick={handleSubscribe}
                      loading={subLoading}
                      disabled={profile.wallet < 10}
                      className="w-full mb-3"
                      size="lg"
                    >
                      ⭐ Subscribe with Wallet ($10/month)
                    </Button>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-px bg-slate-700" />
                      <span className="text-slate-500 text-xs">or pay securely with</span>
                      <div className="flex-1 h-px bg-slate-700" />
                    </div>
                    <Button
                      onClick={handleStripeSubscribe}
                      loading={stripeLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-500"
                      size="lg"
                    >
                      💳 Pay with Stripe ($10/month)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={depositModal} onClose={() => { setDepositModal(false); setDepositAmount(''); }} title="Deposit to Wallet">
        {depositAlert && <Alert type={depositAlert.type} message={depositAlert.msg} className="mb-4" />}
        <p className="text-slate-400 text-sm mb-4">Current balance: <span className="text-emerald-400 font-semibold">${profile.wallet?.toFixed(2) || '0.00'}</span></p>
        <Input
          label="Amount (USD)"
          type="number"
          min="1"
          step="0.01"
          value={depositAmount}
          onChange={e => setDepositAmount(e.target.value)}
          placeholder="e.g. 20.00"
        />
        <div className="flex gap-3 mt-5">
          <Button variant="secondary" className="flex-1" onClick={() => setDepositModal(false)}>Cancel</Button>
          <Button className="flex-1" loading={depositLoading} onClick={handleDeposit}>Deposit</Button>
        </div>
      </Modal>
    </div>
  );
}
