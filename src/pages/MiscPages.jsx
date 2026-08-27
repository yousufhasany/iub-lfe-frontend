import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { Spinner } from '../components/ui.jsx';
import { PostCard } from '../components/PostCard.jsx';
import { useDebounce, seasonLabel, groupLabel, setSeo } from '../utils/format.js';
import { useEffect, useState } from 'react';
import { timeAgo } from '../utils/format.js';

export function NotificationsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data.data,
  });
  useEffect(() => setSeo({ title: 'Notifications' }), []);
  if (isLoading) return <Spinner />;
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Notifications</h1>
        <button
          type="button"
          className="text-sm"
          onClick={async () => {
            await api.post('/notifications/read-all');
            refetch();
          }}
        >
          Mark all read
        </button>
      </div>
      <ul className="mt-6 space-y-2">
        {(data?.items || []).map((n) => (
          <li key={n._id} className={`rounded-xl p-4 ring-1 ring-stone-200 ${n.read ? 'bg-white' : 'bg-gold-100'}`}>
            <p>{n.message}</p>
            <p className="text-xs text-stone-500">{timeAgo(n.createdAt)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArchivePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['archive'],
    queryFn: async () => (await api.get('/semesters/archive')).data.data,
  });
  useEffect(() => setSeo({ title: 'LFE Archive', description: 'Browse LFE by year, season, and venue.' }), []);
  if (isLoading) return <Spinner />;
  return (
    <div>
      <h1 className="font-display text-3xl">LFE Archive</h1>
      {(data?.years || []).map((y) => (
        <section key={y.year} className="mt-8">
          <h2 className="font-display text-2xl">{y.year}</h2>
          {y.seasons.map((s) => (
            <div key={s._id} className="mt-3">
              <Link to={`/semester/${s.season}-${s.year}`} className="font-medium capitalize">
                {s.season} {s.year}
              </Link>
              <div className="mt-2 flex flex-wrap gap-2">
                {(data.venues || []).map((v) => (
                  <Link key={v._id} to={`/venue/${v.slug}`} className="rounded-full bg-white px-3 py-1 text-sm ring-1 ring-stone-200">
                    {v.district}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

export function SemesterPage() {
  const { slug } = useParams();
  const [season, year] = (slug || '').split('-');
  const { data, isLoading } = useQuery({
    queryKey: ['semester', slug],
    queryFn: async () => (await api.get(`/semesters/${season}/${year}`)).data.data,
  });
  const posts = useQuery({
    queryKey: ['semester-posts', data?.semester?._id],
    enabled: Boolean(data?.semester),
    queryFn: async () => (await api.get('/posts', { params: { semesterId: data.semester._id } })).data.data.items,
  });
  if (isLoading) return <Spinner />;
  return (
    <div>
      <h1 className="font-display text-3xl">{seasonLabel(data.semester)}</h1>
      <p className="text-stone-600">{data.postCount} photographs</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(data.groups || []).map((g) => (
          <Link key={g._id} to={`/groups/${g._id}`} className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-stone-200">
            {groupLabel(g)} · {g.venue?.district}
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-4">
        {(posts.data || []).map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [year, setYear] = useState(params.get('year') || '');
  const [season, setSeason] = useState(params.get('season') || '');
  const [district, setDistrict] = useState(params.get('district') || '');
  const debounced = useDebounce(q);
  const { data, isLoading } = useQuery({
    queryKey: ['search', debounced, year, season, district],
    queryFn: async () =>
      (
        await api.get('/search', {
          params: { q: debounced, year: year || undefined, season: season || undefined, district: district || undefined },
        })
      ).data.data,
  });
  useEffect(() => setSeo({ title: 'Search' }), []);

  return (
    <div>
      <h1 className="font-display text-3xl">Search</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input className="rounded-xl border px-3 py-2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, venue, caption, tags…" />
        <input className="rounded-xl border px-3 py-2" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" />
        <input className="rounded-xl border px-3 py-2" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
        <select className="rounded-xl border px-3 py-2" value={season} onChange={(e) => setSeason(e.target.value)}>
          <option value="">Any season</option>
          <option value="summer">Summer</option>
          <option value="winter">Winter</option>
        </select>
      </div>
      {isLoading && <Spinner />}
      {data && (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="font-display text-xl">Photographs</h2>
            <div className="mt-3 grid gap-4">
              {data.posts.items.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </section>
          <section>
            <h2 className="font-display text-xl">Students</h2>
            {data.students.map((s) => (
              <Link key={s.id} to={`/student/${s.id}`} className="mt-2 block rounded-xl bg-white p-3 ring-1 ring-stone-200">
                {s.profile.fullName} · {s.profile.studentId}
              </Link>
            ))}
          </section>
          <section>
            <h2 className="font-display text-xl">Venues</h2>
            {data.venues.map((v) => (
              <Link key={v._id} to={`/venue/${v.slug}`} className="mt-2 block rounded-xl bg-white p-3 ring-1 ring-stone-200">
                {v.name}
              </Link>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}

export function PrivacyPage() {
  useEffect(() => setSeo({ title: 'Privacy policy' }), []);
  return (
    <article className="prose max-w-3xl">
      <h1 className="font-display text-3xl">Privacy policy</h1>
      <p className="mt-4 text-stone-700">
        IUB LFE is a student community and archive. We store account details you provide, photograph metadata, and
        interaction data (comments and reactions) to operate the platform. Student IDs are masked for the public.
      </p>
      <p className="mt-3 text-stone-700">
        Many photographs include village residents who are not IUB students. Uploaders must obtain appropriate permission
        before publishing identifiable images, especially of children. Anyone can report content or request takedown.
      </p>
      <p className="mt-3 text-stone-700">
        We do not sell personal data. Administrators may review reports, suspend accounts, and delete content. Images are
        stored with a dedicated object-storage provider (Cloudinary) or local disk in development—not as MongoDB binaries.
      </p>
    </article>
  );
}

export function GuidelinesPage() {
  useEffect(() => setSeo({ title: 'Community guidelines' }), []);
  return (
    <article className="max-w-3xl space-y-3 text-stone-700">
      <h1 className="font-display text-3xl text-navy-900">Community guidelines</h1>
      <p>Share field experience with respect for host communities.</p>
      <ul className="list-disc pl-5">
        <li>Do not publicly identify private individuals without permission.</li>
        <li>Do not upload photographs of children without appropriate consent.</li>
        <li>No harassment, hate, or sexually explicit content.</li>
        <li>Only upload photographs you have the right to share.</li>
        <li>Report privacy and copyright concerns instead of resharing them.</li>
      </ul>
    </article>
  );
}
