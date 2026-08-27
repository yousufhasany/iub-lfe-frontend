import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { setSeo } from '../utils/format.js';
import { useEffect } from 'react';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { CldImage } from '../lib/cloudinary.jsx';

export function LandingPage() {
  useEffect(() => {
    setSeo({
      title: 'Live in Field Experience',
      description: 'Explore. Experience. Share. A digital community for IUB students to document LFE across Bangladesh.',
    });
  }, []);

  const venues = useQuery({ queryKey: ['venues'], queryFn: async () => (await api.get('/venues')).data.data.venues });
  const posts = useQuery({
    queryKey: ['posts', 'latest-home'],
    queryFn: async () => (await api.get('/posts', { params: { limit: 6 } })).data.data.items,
  });
  const archive = useQuery({ queryKey: ['archive'], queryFn: async () => (await api.get('/semesters/archive')).data.data });

  return (
    <div className="bg-stone-50 text-navy-950">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5">
        <span className="font-display text-xl text-white">IUB LFE</span>
        <nav className="flex items-center gap-4 text-sm text-white">
          <Link to="/explore">Explore</Link>
          <Link to="/venues">Venues</Link>
          <Link to="/login" className="rounded-full bg-gold-400 px-4 py-2 font-medium text-navy-950">
            Join
          </Link>
        </nav>
      </header>

      <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(224,190,85,0.25),transparent_45%),linear-gradient(180deg,#0b1f3a,#123056)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-28">
          <p className="text-sm uppercase tracking-[0.25em] text-gold-400">Independent University, Bangladesh</p>
          <h1 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">Live in Field Experience</h1>
          <p className="mt-4 font-display text-2xl text-gold-100">Explore. Experience. Share.</p>
          <p className="mt-6 max-w-xl text-lg text-stone-200">
            A digital community for IUB students to document and discover their Live in Field Experience across Bangladesh.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/explore" className="rounded-full bg-gold-400 px-6 py-3 font-semibold text-navy-950">
              Explore Field Experiences
            </Link>
            <Link to="/register" className="rounded-full border border-white/30 px-6 py-3 font-semibold">
              Join LFE Community
            </Link>
          </div>
          <dl className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ['12+', 'Field Venues'],
              ['800+', 'Students'],
              ['Summer & Winter', 'Programs'],
              ['Thousands of', 'Field Memories'],
            ].map(([k, v]) => (
              <div key={v}>
                <dt className="font-display text-2xl text-gold-400">{k}</dt>
                <dd className="text-sm text-stone-300">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl">Explore Bangladesh</h2>
        <p className="mt-2 text-stone-600">Twelve official LFE venues across the country.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(venues.data || []).map((v) => (
            <Link key={v._id} to={`/venue/${v.slug}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
              <div className="aspect-[16/10] bg-navy-900">
                {v.coverImage?.url && (
                  <CldImage
                    publicId={v.coverImage.publicId}
                    src={v.coverImage.thumbnailUrl || v.coverImage.url}
                    alt=""
                    width={800}
                    height={500}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-wide text-gold-500">{v.district}</p>
                <h3 className="mt-1 font-semibold text-navy-900">{v.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl">Latest Field Memories</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(posts.data || []).map((p) => (
              <Link key={p.id} to={`/post/${p.id}`} className="overflow-hidden rounded-2xl ring-1 ring-stone-200">
                <ImageCarousel images={p.images} />
                <div className="p-4">
                  <p className="font-medium">{p.author?.profile?.fullName}</p>
                  <p className="line-clamp-2 text-sm text-stone-600">{p.caption}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl">Explore by Semester</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {(archive.data?.years || []).map((y) =>
            y.seasons.map((s) => (
              <Link
                key={s._id}
                to={`/semester/${s.season}-${s.year}`}
                className="rounded-full bg-navy-900 px-5 py-2 text-white"
              >
                {s.season === 'summer' ? 'Summer' : 'Winter'} {s.year}
              </Link>
            )),
          )}
        </div>
        <h2 className="mt-16 font-display text-3xl">Explore by Venue</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {(venues.data || []).map((v) => (
            <Link key={v._id} to={`/venue/${v.slug}`} className="rounded-full bg-gold-100 px-4 py-2 text-sm text-navy-900">
              {v.district}
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-stone-200 px-6 py-10 text-sm text-stone-600">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4">
          <p>IUB Live in Field Experience · Independent University, Bangladesh</p>
          <div className="flex gap-4">
            <Link to="/privacy">Privacy</Link>
            <Link to="/guidelines">Community guidelines</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
