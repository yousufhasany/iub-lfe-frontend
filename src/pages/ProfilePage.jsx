import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBanner } from '../components/ui.jsx';
import { collectPhotos, PhotoGrid, ProfileHero } from '../components/ProfileHero.jsx';
import { useState } from 'react';
import { seasonLabel } from '../utils/format.js';

export function ProfilePage() {
  const { user, refresh } = useAuth();
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      fullName: user?.profile?.fullName,
      studentId: user?.profile?.studentId,
      department: user?.profile?.department,
      batch: user?.profile?.batch,
      bio: user?.profile?.bio,
      fieldVisitYear: user?.lfe?.fieldVisitYear,
      semesterId: user?.lfe?.semester?._id || user?.lfe?.semester || '',
      venueId: user?.lfe?.venue?._id || user?.lfe?.venue || '',
      groupId: user?.lfe?.group?._id || user?.lfe?.group || '',
    },
  });
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const venues = useQuery({ queryKey: ['venues'], queryFn: async () => (await api.get('/venues')).data.data.venues });
  const semesters = useQuery({ queryKey: ['semesters'], queryFn: async () => (await api.get('/semesters')).data.data.semesters });
  const groups = useQuery({ queryKey: ['groups'], queryFn: async () => (await api.get('/groups')).data.data.items });
  const posts = useQuery({
    queryKey: ['my-posts', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => (await api.get('/posts', { params: { authorId: user.id, limit: 50 } })).data.data.items,
  });

  const semesterId = watch('semesterId');
  const venueId = watch('venueId');
  const filteredGroups = (groups.data || []).filter((g) => {
    const sem = String(g.semester?._id || g.semester || '');
    const ven = String(g.venue?._id || g.venue || '');
    return (!semesterId || sem === String(semesterId)) && (!venueId || ven === String(venueId));
  });

  const photos = collectPhotos(posts.data || []);
  const photoCount = user?.stats?.photos || photos.length;

  async function onAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('avatar', file);
    await api.post('/users/me/avatar', form);
    await refresh();
  }

  return (
    <div className="mx-auto max-w-xl">
      <ProfileHero user={user} photoCount={photoCount} postsCount={user?.stats?.posts || posts.data?.length || 0} />
      <label className="mt-4 block text-sm">
        Change profile photograph
        <input type="file" accept="image/*" className="mt-1 block text-sm" onChange={onAvatar} />
      </label>
      <h2 className="mt-8 font-display text-xl">Photos</h2>
      {posts.isLoading ? <p className="mt-3 text-sm text-stone-500">Loading photographs…</p> : <PhotoGrid photos={photos} />}
      <h2 className="mt-10 font-display text-xl">Edit profile</h2>
      <form
        className="mt-4 space-y-3"
        onSubmit={handleSubmit(async (values) => {
          setError(null);
          setSaved(false);
          try {
            await api.patch('/users/me', values);
            await refresh();
            setSaved(true);
          } catch (err) {
            setError(err);
          }
        })}
      >
        <ErrorBanner error={error} />
        {saved && <p className="text-sm text-green-700">Profile saved.</p>}
        <label className="block text-sm font-medium">
          Full name
          <input className="mt-1 w-full rounded-xl border px-3 py-2" {...register('fullName')} />
        </label>
        <label className="block text-sm font-medium">
          Student ID
          <input className="mt-1 w-full rounded-xl border px-3 py-2" {...register('studentId')} />
        </label>
        <label className="block text-sm font-medium">
          Department
          <input className="mt-1 w-full rounded-xl border px-3 py-2" {...register('department')} />
        </label>
        <label className="block text-sm font-medium">
          Batch
          <input className="mt-1 w-full rounded-xl border px-3 py-2" {...register('batch')} />
        </label>
        <label className="block text-sm font-medium">
          Bio
          <textarea className="mt-1 w-full rounded-xl border px-3 py-2" rows={3} {...register('bio')} />
        </label>
        <label className="block text-sm font-medium">
          LFE semester
          <select className="mt-1 w-full rounded-xl border px-3 py-2" {...register('semesterId')}>
            <option value="">Select</option>
            {(semesters.data || []).map((s) => (
              <option key={s._id} value={s._id}>
                {seasonLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Venue
          <select className="mt-1 w-full rounded-xl border px-3 py-2" {...register('venueId')}>
            <option value="">Select</option>
            {(venues.data || []).map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Group
          <select className="mt-1 w-full rounded-xl border px-3 py-2" {...register('groupId')}>
            <option value="">Select</option>
            {filteredGroups.map((g) => (
              <option key={g._id} value={g._id}>
                Group {String(g.number).padStart(2, '0')} · {g.venue?.district}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-xl bg-navy-900 px-5 py-2.5 text-white" type="submit">
          Save profile
        </button>
      </form>
    </div>
  );
}
