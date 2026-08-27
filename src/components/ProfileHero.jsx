import { Link } from 'react-router-dom';
import { Avatar } from './Avatar.jsx';
import { CldImage } from '../lib/cloudinary.jsx';
import { groupLabel, seasonLabel } from '../utils/format.js';

export function collectPhotos(posts = []) {
  return posts.flatMap((p) =>
    (p.images || []).map((img, index) => ({
      url: img.thumbnailUrl || img.webpUrl || img.url,
      full: img.url,
      publicId: img.publicId,
      postId: p.id,
      key: `${p.id}-${index}`,
    })),
  );
}

export function ProfileHero({ user, photoCount, postsCount }) {
  const photos = photoCount ?? user?.stats?.photos ?? 0;
  const posts = postsCount ?? user?.stats?.posts ?? 0;
  const venue = user?.lfe?.venue;
  const group = user?.lfe?.group;
  const semester = user?.lfe?.semester;

  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200">
      <div className="h-28 bg-gradient-to-r from-navy-900 to-navy-700 sm:h-36" />
      <div className="px-5 pb-5">
        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
          <Avatar user={user} size="lg" />
          <div className="min-w-0 flex-1 pb-1">
            <h1 className="font-display text-3xl text-navy-900">{user?.profile?.fullName}</h1>
            <p className="text-stone-600">
              {[user?.profile?.department, user?.profile?.studentId ? `ID ${user.profile.studentId}` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {[groupLabel(group), venue?.name || venue?.district, seasonLabel(semester)].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
        {user?.profile?.bio && <p className="mt-4 max-w-2xl text-stone-700">{user.profile.bio}</p>}
        <dl className="mt-5 grid grid-cols-3 divide-x divide-stone-200 rounded-2xl bg-stone-50 text-center">
          <div className="px-2 py-3">
            <dt className="text-xs uppercase tracking-wide text-stone-500">Photos</dt>
            <dd className="font-display text-2xl text-navy-900">{photos}</dd>
          </div>
          <div className="px-2 py-3">
            <dt className="text-xs uppercase tracking-wide text-stone-500">Posts</dt>
            <dd className="font-display text-2xl text-navy-900">{posts}</dd>
          </div>
          <div className="px-2 py-3">
            <dt className="text-xs uppercase tracking-wide text-stone-500">Reactions</dt>
            <dd className="font-display text-2xl text-navy-900">{user?.stats?.reactionsReceived || 0}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export function PhotoGrid({ photos }) {
  if (!photos?.length) {
    return <p className="mt-4 text-sm text-stone-500">No photographs yet.</p>;
  }
  return (
    <div className="mt-4 grid grid-cols-3 gap-1 sm:gap-2">
      {photos.map((photo) => (
        <Link key={photo.key} to={`/post/${photo.postId}`} className="aspect-square overflow-hidden bg-stone-200">
          <CldImage
            publicId={photo.publicId}
            src={photo.url}
            alt=""
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
        </Link>
      ))}
    </div>
  );
}
