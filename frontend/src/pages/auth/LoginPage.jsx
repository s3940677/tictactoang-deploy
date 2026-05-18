import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useLoginForm } from './LoginPage.hooks';

export default function LoginPage() {
  const { form, error, loading, showPass, setShowPass, registered, handleChange, handleSubmit } = useLoginForm();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl mb-4 shadow-xl shadow-violet-500/30">
            <span className="text-2xl font-black text-white">T</span>
          </div>
          <h1 className="text-3xl font-black text-white">Welcome back</h1>
          <p className="text-slate-400 mt-1">Sign in to your TicTacToang account</p>
        </div>

        <div className="card p-7">
          {registered && (
            <Alert type="success" message="Account created! You can now sign in." className="mb-5" />
          )}
          <Alert type="error" message={error} className="mb-5" />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Username or Email"
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              placeholder="Enter username or email"
              autoComplete="username"
              autoFocus
            />
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" loading={loading} size="lg">
              Sign In
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-800 px-3 text-slate-500 text-xs">OR</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400">
            New to TicTacToang?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Account will be locked after 5 failed attempts in 60 seconds.
        </p>
      </div>
    </div>
  );
}
