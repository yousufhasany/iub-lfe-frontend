import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { PostCard } from '../components/PostCard.jsx';
import { Spinner } from '../components/ui.jsx';
import { groupLabel, seasonLabel, setSeo } from '../utils/format.js';
import { useEffect } from 'react';

function Section({ title, children }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 font-display text-2xl text-navy-900">{title}</h2>
      {children}
    </section>
  );
}

export function ExplorePage() {
  useEffect(() => setSeo({ title: 'Explore', description: 'Popular LFE photographs, venues, and groups.' }), []);
  const { data, isLoading } = useQuery({
    queryKey: ['explore'],
    queryFn: async () => (await api.get('/explore')).data.data,
  });
  if (isLoading) return <Spinner />;
  const d = data || {};

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl">Explore field experiences</h1>
      <Section title="Popular this week">
        <div className="grid gap-4 md:grid-cols-2">
          {(d.popularThisWeek || []).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </Section>
      <Section title="Latest field experiences">
        <div className="grid gap-4 md:grid-cols-2">
          {(d.latest || []).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </Section>
      <Section title="Popular venues">
        <div className="grid gap-3 sm:grid-cols-2">
          {(d.popularVenues || []).map((row, i) =>
            row.venue ? (
              <Link key={row.venue._id || i} to={`/venue/${row.venue.slug}`} className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
                <p className="font-semibold">{row.venue.name}</p>
                <p className="text-sm text-stone-500">{row.photos} photographs</p>
              </Link>
            ) : null,
          )}
        </div>
      </Section>
      <Section title="Featured memories">
        <div className="grid gap-4 md:grid-cols-2">
          {(d.featured || []).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </Section>
      <Section title="Recent groups">
        <div className="grid gap-3 sm:grid-cols-2">
          {(d.recentGroups || []).map((g) => (
            <Link key={g._id} to={`/groups/${g._id}`} className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
              <p className="font-semibold">
                {groupLabel(g)} · {g.venue?.district}
              </p>
              <p className="text-sm text-stone-500">{seasonLabel(g.semester)}</p>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
