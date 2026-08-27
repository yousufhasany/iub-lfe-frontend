import { NavLink, Outlet } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { Spinner } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { seasonLabel } from '../utils/format.js';

const tab = ({ isActive }) =>
  `rounded-full px-3 py-1.5 text-sm ${isActive ? 'bg-navy-900 text-white' : 'bg-white ring-1 ring-stone-200'}`;

export function AdminLayout() {
  const { isAdmin } = useAuth();
  return (
    <div>
      <h1 className="font-display text-3xl">Admin</h1>
      <nav className="mt-4 flex flex-wrap gap-2">
        <NavLink to="/admin" end className={tab}>
          Overview
        </NavLink>
        <NavLink to="/admin/reports" className={tab}>
          Reports
        </NavLink>
        <NavLink to="/admin/posts" className={tab}>
          Posts
        </NavLink>
        {isAdmin && (
          <>
            <NavLink to="/admin/users" className={tab}>
              Users
            </NavLink>
            <NavLink to="/admin/catalog" className={tab}>
              Catalog
            </NavLink>
            <NavLink to="/admin/audit" className={tab}>
              Audit
            </NavLink>
            <NavLink to="/admin/settings" className={tab}>
              Settings
            </NavLink>
          </>
        )}
      </nav>
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}

export function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data.data,
  });
  if (isLoading) return <Spinner />;
  const t = data.totals;
  const cards = [
    ['Students', t.students],
    ['Teachers', t.teachers],
    ['Venues', t.venues],
    ['Groups', t.groups],
    ['Posts', t.posts],
    ['Photos', t.photos],
    ['Comments', t.comments],
    ['Reactions', t.reactions],
    ['Open reports', t.reports],
    ['Active users', t.activeUsers],
  ];
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {cards.map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
            <p className="text-sm text-stone-500">{k}</p>
            <p className="font-display text-2xl">{v}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-8 font-display text-xl">Uploads by venue</h2>
      <ul className="mt-3 space-y-2">
        {(data.uploadsByVenue || []).map((row) => (
          <li key={row.venue?._id} className="flex items-center gap-3">
            <span className="w-48 truncate text-sm">{row.venue?.name}</span>
            <span className="h-2 flex-1 overflow-hidden rounded bg-stone-200">
              <span className="block h-2 bg-navy-900" style={{ width: `${Math.min(100, row.count * 10)}%` }} />
            </span>
            <span className="text-sm">{row.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminReports() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => (await api.get('/admin/reports')).data.data.items,
  });
  const resolve = useMutation({
    mutationFn: ({ id, body }) => api.patch(`/admin/reports/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reports'] }),
  });
  if (isLoading) return <Spinner />;
  return (
    <div className="space-y-3">
      {(data || []).map((r) => (
        <div key={r._id} className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
          <p className="text-sm uppercase text-gold-600">
            {r.status} · {r.reason}
          </p>
          <p className="mt-1">{r.details}</p>
          <div className="mt-3 flex gap-2">
            {['under_review', 'resolved', 'rejected'].map((status) => (
              <button
                key={status}
                type="button"
                className="rounded-lg bg-stone-100 px-3 py-1 text-sm"
                onClick={() => resolve.mutate({ id: r._id, body: { status, removeContent: status === 'resolved' } })}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminPosts() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => (await api.get('/admin/posts')).data.data.items,
  });
  if (isLoading) return <Spinner />;
  return (
    <div className="space-y-3">
      {(data || []).map((p) => (
        <div key={p._id} className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-stone-200">
          <div>
            <p className="font-medium">{p.caption || '(no caption)'}</p>
            <p className="text-sm text-stone-500">
              {p.author?.profile?.fullName} · {p.moderationStatus}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg bg-gold-100 px-3 py-1 text-sm"
              onClick={async () => {
                await api.post(`/admin/posts/${p._id}/feature`, { featured: !p.featured });
                qc.invalidateQueries({ queryKey: ['admin-posts'] });
              }}
            >
              {p.featured ? 'Unfeature' : 'Feature'}
            </button>
            <button
              type="button"
              className="rounded-lg bg-red-50 px-3 py-1 text-sm text-red-800"
              onClick={async () => {
                await api.post(`/admin/posts/${p._id}/moderate`, { moderationStatus: 'removed', reason: 'Moderation' });
                qc.invalidateQueries({ queryKey: ['admin-posts'] });
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminUsers() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users')).data.data.items,
  });
  const [form, setForm] = useState({ fullName: '', email: '', password: 'Password123!', role: 'teacher' });
  if (isLoading) return <Spinner />;
  return (
    <div>
      <form
        className="mb-6 grid gap-2 rounded-2xl bg-white p-4 ring-1 ring-stone-200 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await api.post('/admin/users', form);
          qc.invalidateQueries({ queryKey: ['admin-users'] });
        }}
      >
        <input className="rounded-xl border px-3 py-2" placeholder="Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input className="rounded-xl border px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <select className="rounded-xl border px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <button className="rounded-xl bg-navy-900 text-white" type="submit">
          Create user
        </button>
      </form>
      {(data || []).map((u) => (
        <div key={u.id} className="mb-2 flex items-center justify-between rounded-xl bg-white p-3 ring-1 ring-stone-200">
          <div>
            <p className="font-medium">
              {u.profile.fullName} · {u.role}
            </p>
            <p className="text-sm text-stone-500">{u.email}</p>
          </div>
          <button
            type="button"
            className="text-sm"
            onClick={async () => {
              await api.patch(`/admin/users/${u.id}`, {
                status: u.status === 'suspended' ? 'active' : 'suspended',
                reason: 'Admin action',
              });
              qc.invalidateQueries({ queryKey: ['admin-users'] });
            }}
          >
            {u.status === 'suspended' ? 'Reinstate' : 'Suspend'}
          </button>
        </div>
      ))}
    </div>
  );
}

export function AdminCatalog() {
  const qc = useQueryClient();
  const venues = useQuery({ queryKey: ['venues'], queryFn: async () => (await api.get('/venues')).data.data.venues });
  const semesters = useQuery({ queryKey: ['semesters'], queryFn: async () => (await api.get('/semesters')).data.data.semesters });
  const [sem, setSem] = useState({ year: 2026, season: 'winter' });
  const [group, setGroup] = useState({ number: 1, semesterId: '', venueId: '' });
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section>
        <h2 className="font-display text-xl">Semesters</h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await api.post('/semesters', sem);
            qc.invalidateQueries({ queryKey: ['semesters'] });
          }}
        >
          <input className="w-24 rounded-xl border px-3 py-2" type="number" value={sem.year} onChange={(e) => setSem({ ...sem, year: Number(e.target.value) })} />
          <select className="rounded-xl border px-3 py-2" value={sem.season} onChange={(e) => setSem({ ...sem, season: e.target.value })}>
            <option value="summer">Summer</option>
            <option value="winter">Winter</option>
          </select>
          <button className="rounded-xl bg-navy-900 px-4 text-white" type="submit">
            Add
          </button>
        </form>
        <ul className="mt-3 text-sm">
          {(semesters.data || []).map((s) => (
            <li key={s._id}>{seasonLabel(s)}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-xl">Groups</h2>
        <form
          className="mt-3 space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await api.post('/groups', group);
            qc.invalidateQueries({ queryKey: ['groups'] });
          }}
        >
          <input className="w-full rounded-xl border px-3 py-2" type="number" value={group.number} onChange={(e) => setGroup({ ...group, number: Number(e.target.value) })} />
          <select className="w-full rounded-xl border px-3 py-2" value={group.semesterId} onChange={(e) => setGroup({ ...group, semesterId: e.target.value })}>
            <option value="">Semester</option>
            {(semesters.data || []).map((s) => (
              <option key={s._id} value={s._id}>
                {seasonLabel(s)}
              </option>
            ))}
          </select>
          <select className="w-full rounded-xl border px-3 py-2" value={group.venueId} onChange={(e) => setGroup({ ...group, venueId: e.target.value })}>
            <option value="">Venue</option>
            {(venues.data || []).map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>
          <button className="rounded-xl bg-navy-900 px-4 py-2 text-white" type="submit">
            Create group
          </button>
        </form>
      </section>
    </div>
  );
}

export function AdminAudit() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: async () => (await api.get('/admin/audit-logs')).data.data.items,
  });
  if (isLoading) return <Spinner />;
  return (
    <ul className="space-y-2">
      {(data || []).map((a) => (
        <li key={a._id} className="rounded-xl bg-white p-3 text-sm ring-1 ring-stone-200">
          <span className="font-medium">{a.actor?.profile?.fullName}</span> {a.action} {a.targetType} {a.targetId}
          {a.reason ? ` — ${a.reason}` : ''}
        </li>
      ))}
    </ul>
  );
}

export function AdminSettings() {
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/admin/settings')).data.data.settings,
  });
  if (isLoading) return <Spinner />;
  return (
    <form
      className="max-w-md space-y-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api.patch('/admin/settings', {
          autoApprovePosts: fd.get('autoApprovePosts') === 'on',
          requireIubEmail: fd.get('requireIubEmail') === 'on',
        });
      }}
    >
      <label className="flex items-center gap-2">
        <input type="checkbox" name="autoApprovePosts" defaultChecked={data.autoApprovePosts} />
        Auto-approve new posts
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="requireIubEmail" defaultChecked={data.requireIubEmail} />
        Require @iub.edu.bd emails
      </label>
      <button className="rounded-xl bg-navy-900 px-4 py-2 text-white" type="submit">
        Save
      </button>
    </form>
  );
}
