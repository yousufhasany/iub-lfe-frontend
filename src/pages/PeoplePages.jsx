import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { Spinner } from '../components/ui.jsx';
import { PostCard } from '../components/PostCard.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { collectPhotos, PhotoGrid, ProfileHero } from '../components/ProfileHero.jsx';
import { groupLabel, seasonLabel, setSeo } from '../utils/format.js';
import { useEffect } from 'react';

export function GroupsPage() {
  useEffect(() => setSeo({ title: 'Groups', description: 'LFE field groups by venue and semester.' }), []);
  const { data, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => (await api.get('/groups')).data.data.items,
  });
  if (isLoading) return <Spinner />;
  return (
    <div>
      <h1 className="font-display text-3xl">Groups</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(data || []).map((g) => (
          <Link key={g._id} to={`/groups/${g._id}`} className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
            <p className="text-xs uppercase text-gold-500">{g.venue?.district}</p>
            <h2 className="mt-1 text-xl font-semibold">{groupLabel(g)}</h2>
            <p className="text-sm text-stone-600">
              {g.venue?.name} · {seasonLabel(g.semester)}
            </p>
            <p className="mt-2 text-sm text-stone-500">{g.members?.length || 0} students</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function GroupDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: async () => (await api.get(`/groups/${id}`)).data.data.group,
  });
  const posts = useQuery({
    queryKey: ['group-posts', id],
    queryFn: async () => (await api.get('/posts', { params: { groupId: id } })).data.data.items,
  });
  useEffect(() => {
    if (data) setSeo({ title: `${groupLabel(data)} · ${data.venue?.district}`, description: data.description });
  }, [data]);
  if (isLoading) return <Spinner />;
  const g = data;
  return (
    <div>
      <p className="text-sm text-gold-600">{seasonLabel(g.semester)}</p>
      <h1 className="font-display text-3xl">
        {groupLabel(g)} · {g.venue?.name}
      </h1>
      <p className="mt-2 text-stone-600">{g.description}</p>
      <h2 className="mt-8 font-display text-xl">Students</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {(g.members || []).map((m) => (
          <Link key={m._id} to={`/student/${m._id}`} className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-stone-200">
            <Avatar user={m} />
            <span>{m.profile?.fullName}</span>
          </Link>
        ))}
      </div>
      <h2 className="mt-8 font-display text-xl">Photographs</h2>
      <div className="mt-4 grid gap-4">
        {(posts.data || []).map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

export function StudentsPage() {
  useEffect(() => setSeo({ title: 'Students', description: 'LFE student community directory.' }), []);
  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => (await api.get('/users/students')).data.data.items,
  });
  if (isLoading) return <Spinner />;
  return (
    <div>
      <h1 className="font-display text-3xl">Students</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(data || []).map((s) => (
          <Link key={s.id} to={`/student/${s.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
            <Avatar user={s} />
            <div>
              <p className="font-semibold">{s.profile.fullName}</p>
              <p className="text-sm text-stone-500">
                {s.profile.department} · {s.stats?.photos || 0} photos
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function StudentProfilePage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: async () => (await api.get(`/users/students/${id}`)).data.data.user,
  });
  const posts = useQuery({
    queryKey: ['student-posts', id],
    queryFn: async () => (await api.get('/posts', { params: { authorId: id } })).data.data.items,
  });
  useEffect(() => {
    if (data) setSeo({ title: data.profile.fullName, description: `${data.profile.fullName} · IUB LFE` });
  }, [data]);
  if (isLoading) return <Spinner />;
  const u = data;
  const photos = collectPhotos(posts.data || []);
  const photoCount = u.stats?.photos || photos.length;
  return (
    <div>
      <ProfileHero user={u} photoCount={photoCount} postsCount={u.stats?.posts || posts.data?.length || 0} />
      <h2 className="mt-8 font-display text-xl">Photos</h2>
      {posts.isLoading ? <Spinner /> : <PhotoGrid photos={photos} />}
    </div>
  );
}
