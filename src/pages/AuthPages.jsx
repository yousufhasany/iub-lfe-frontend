import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ErrorBanner } from '../components/ui.jsx';

function Shell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
        <Link to="/" className="font-display text-gold-500">
          IUB LFE
        </Link>
        <h1 className="mt-4 font-display text-3xl text-navy-900">{title}</h1>
        <p className="mt-2 text-stone-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

const field = 'mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5';
const btn = 'mt-5 w-full rounded-xl bg-navy-900 py-3 font-medium text-white';

export function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  return (
    <Shell title="Welcome back" subtitle="Sign in to share and explore field memories.">
      <form
        onSubmit={handleSubmit(async (values) => {
          setError(null);
          try {
            await api.post('/auth/login', values);
            await refresh();
            navigate('/home');
          } catch (err) {
            setError(err);
          }
        })}
        className="space-y-3"
      >
        <ErrorBanner error={error} />
        <label className="block text-sm font-medium">
          Email
          <input className={field} type="email" autoComplete="email" {...register('email', { required: true })} />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input className={field} type="password" autoComplete="current-password" {...register('password', { required: true })} />
        </label>
        <button className={btn} type="submit">
          Sign in
        </button>
      </form>
      <p className="mt-4 text-sm">
        <Link to="/forgot-password" className="text-navy-700">
          Forgot password?
        </Link>
      </p>
      <p className="mt-2 text-sm text-stone-600">
        New to LFE? <Link to="/register">Create an account</Link>
      </p>
    </Shell>
  );
}

export function RegisterPage() {
  const { register, handleSubmit, watch } = useForm();
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const venues = useQuery({ queryKey: ['venues'], queryFn: async () => (await api.get('/venues')).data.data.venues });
  const semesters = useQuery({ queryKey: ['semesters'], queryFn: async () => (await api.get('/semesters')).data.data.semesters });
  const groups = useQuery({ queryKey: ['groups'], queryFn: async () => (await api.get('/groups')).data.data.items });
  const semesterId = watch('semesterId');
  const venueId = watch('venueId');
  const filteredGroups = (groups.data || []).filter((g) => {
    const sem = String(g.semester?._id || g.semester || '');
    const ven = String(g.venue?._id || g.venue || '');
    return (!semesterId || sem === String(semesterId)) && (!venueId || ven === String(venueId));
  });

  return (
    <Shell title="Join the LFE community" subtitle="Create your student account and choose your field assignment.">
      <form
        onSubmit={handleSubmit(async (values) => {
          setError(null);
          try {
            await api.post('/auth/register', values);
            await refresh();
            navigate('/home');
          } catch (err) {
            setError(err);
          }
        })}
        className="space-y-3"
      >
        <ErrorBanner error={error} />
        <label className="block text-sm font-medium">
          Full name
          <input className={field} {...register('fullName', { required: true })} />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input className={field} type="email" {...register('email', { required: true })} />
        </label>
        <label className="block text-sm font-medium">
          Student ID (optional)
          <input className={field} {...register('studentId')} />
        </label>
        <label className="block text-sm font-medium">
          Department (optional)
          <input className={field} {...register('department')} />
        </label>
        <label className="block text-sm font-medium">
          LFE semester
          <select className={field} {...register('semesterId', { required: true })}>
            <option value="">Select semester</option>
            {(semesters.data || []).map((s) => (
              <option key={s._id} value={s._id}>
                {s.season === 'winter' ? 'Winter' : 'Summer'} {s.year}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Venue
          <select className={field} {...register('venueId', { required: true })}>
            <option value="">Select venue</option>
            {(venues.data || []).map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Group
          <select className={field} {...register('groupId', { required: true })}>
            <option value="">Select group</option>
            {filteredGroups.map((g) => (
              <option key={g._id} value={g._id}>
                Group {String(g.number).padStart(2, '0')} · {g.venue?.district}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Password
          <input className={field} type="password" {...register('password', { required: true, minLength: 8 })} />
        </label>
        <button className={btn} type="submit">
          Create account
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </Shell>
  );
}

export function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm();
  const [message, setMessage] = useState('');
  return (
    <Shell title="Reset password" subtitle="We’ll send a reset link if that email exists.">
      <form
        onSubmit={handleSubmit(async (values) => {
          await api.post('/auth/forgot-password', values);
          setMessage('If that email exists, a reset link has been sent. In development, check the server console.');
        })}
        className="space-y-3"
      >
        <label className="block text-sm font-medium">
          Email
          <input className={field} type="email" {...register('email', { required: true })} />
        </label>
        <button className={btn} type="submit">
          Send reset link
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-stone-700">{message}</p>}
    </Shell>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const tokenFromQuery = params.get('token');
  const pathToken = window.location.pathname.split('/').pop();
  const token = tokenFromQuery || pathToken;
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  return (
    <Shell title="Choose a new password" subtitle="Use at least 8 characters.">
      <form
        onSubmit={handleSubmit(async (values) => {
          setError(null);
          try {
            await api.post('/auth/reset-password', { token, password: values.password });
            navigate('/login');
          } catch (err) {
            setError(err);
          }
        })}
      >
        <ErrorBanner error={error} />
        <label className="block text-sm font-medium">
          New password
          <input className={field} type="password" {...register('password', { required: true, minLength: 8 })} />
        </label>
        <button className={btn} type="submit">
          Update password
        </button>
      </form>
    </Shell>
  );
}

export function VerifyEmailPage() {
  const token = window.location.pathname.split('/').pop();
  const [state, setState] = useState('pending');
  useEffect(() => {
    api
      .get(`/auth/verify-email/${token}`)
      .then(() => setState('ok'))
      .catch(() => setState('bad'));
  }, [token]);
  return (
    <Shell title="Email verification" subtitle={state === 'ok' ? 'Your email is verified.' : state === 'bad' ? 'This link is invalid or expired.' : 'Verifying…'}>
      <Link to="/login" className="text-navy-800">
        Continue to sign in
      </Link>
    </Shell>
  );
}
