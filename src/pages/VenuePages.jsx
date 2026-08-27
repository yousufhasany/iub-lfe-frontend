import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { Spinner } from '../components/ui.jsx';
import { PostCard } from '../components/PostCard.jsx';
import { CldImage } from '../lib/cloudinary.jsx';
import { groupLabel, seasonLabel, setSeo } from '../utils/format.js';
import { useEffect } from 'react';

export function VenuesPage() {
  useEffect(() => setSeo({ title: 'Venues', description: 'Official IUB LFE field venues across Bangladesh.' }), []);
  const { data, isLoading } = useQuery({ queryKey: ['venues'], queryFn: async () => (await api.get('/venues')).data.data.venues });
  if (isLoading) return <Spinner />;
  return (
    <div>
      <h1 className="font-display text-3xl">LFE venues</h1>
      <p className="mt-2 text-stone-600">Browse field sites, groups, and galleries.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {(data || []).map((v) => (
          <Link key={v._id} to={`/venue/${v.slug}`} className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
            <div className="aspect-[16/9] bg-navy-900">
              {v.coverImage?.url && (
                <CldImage
                  publicId={v.coverImage.publicId}
                  src={v.coverImage.url}
                  alt=""
                  width={900}
                  height={500}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <p className="text-xs uppercase tracking-wide text-gold-500">
                {v.district} · {v.division}
              </p>
              <h2 className="mt-1 font-semibold">{v.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-stone-600">{v.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function VenueDetailPage() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['venue', slug],
    queryFn: async () => (await api.get(`/venues/${slug}`)).data.data,
  });
  const posts = useQuery({
    queryKey: ['venue-posts', data?.venue?._id],
    enabled: Boolean(data?.venue?._id),
    queryFn: async () => (await api.get('/posts', { params: { venueId: data.venue._id, limit: 12 } })).data.data.items,
  });

  useEffect(() => {
    if (data?.venue) setSeo({ title: data.venue.name, description: data.venue.description });
  }, [data]);

  if (isLoading) return <Spinner />;
  const { venue, groups, postCount, semesters } = data;

  const bySemester = {};
  for (const g of groups || []) {
    const key = g.semester?._id || g.semester;
    if (!bySemester[key]) bySemester[key] = [];
    bySemester[key].push(g);
  }

  return (
    <div>
      <div className="overflow-hidden rounded-3xl bg-navy-900 text-white">
        {venue.coverImage?.url && (
          <CldImage
            publicId={venue.coverImage.publicId}
            src={venue.coverImage.url}
            alt=""
            width={1400}
            height={560}
            crop={false}
            className="h-56 w-full object-cover opacity-70"
          />
        )}
        <div className="p-6">
          <p className="text-gold-400">
            {venue.district} · {venue.division}
          </p>
          <h1 className="font-display text-3xl">{venue.name}</h1>
          <p className="mt-3 max-w-3xl text-stone-200">{venue.description}</p>
          <p className="mt-4 text-sm text-stone-300">{postCount} photographs in the archive</p>
          {venue.location?.lat && (
            <a
              className="mt-3 inline-block text-sm text-gold-400 underline"
              href={`https://www.google.com/maps?q=${venue.location.lat},${venue.location.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              Open map
            </a>
          )}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl">About</h2>
        <p className="mt-2 text-stone-600">{venue.historicalNotes}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Groups by semester</h2>
        {(semesters || []).map((s) => (
          <div key={s._id} className="mt-4">
            <h3 className="font-medium">{seasonLabel(s)}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {(bySemester[s._id] || []).map((g) => (
                <Link key={g._id} to={`/groups/${g._id}`} className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-stone-200">
                  {groupLabel(g)}
                </Link>
              ))}
              {(bySemester[s._id] || []).length === 0 && <p className="text-sm text-stone-500">No groups yet</p>}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Gallery</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(posts.data || []).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
