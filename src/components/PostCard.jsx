import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Flag, MapPin, GraduationCap } from 'lucide-react';
import { Avatar } from './Avatar.jsx';
import { ImageCarousel } from './ImageCarousel.jsx';
import { groupLabel, seasonLabel, timeAgo } from '../utils/format.js';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { ReportModal } from './ReportModal.jsx';

const REACTIONS = [
  { type: 'love', label: 'Love', icon: '❤️' },
  { type: 'like', label: 'Like', icon: '👍' },
  { type: 'smile', label: 'Smile', icon: '😊' },
  { type: 'clap', label: 'Clap', icon: '👏' },
];

export function PostCard({ post, onChange }) {
  const { user } = useAuth();
  const [openReport, setOpenReport] = useState(false);
  const [picker, setPicker] = useState(false);

  async function react(type) {
    if (!user) return;
    const { data } = await api.post(`/posts/${post.id}/reactions`, { type });
    onChange?.({
      ...post,
      myReaction: data.data.myReaction,
      reactionCount: data.data.reactionCount,
      reactionBreakdown: data.data.reactionBreakdown,
    });
    setPicker(false);
  }

  async function share() {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy link', url);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
      <header className="flex items-center gap-3 px-4 py-3">
        <Link to={`/student/${post.author?.id}`}>
          <Avatar user={post.author} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/student/${post.author?.id}`} className="block truncate font-semibold text-navy-900">
            {post.author?.profile?.fullName}
          </Link>
          <p className="truncate text-sm text-stone-500">
            {[groupLabel(post.group), post.venue?.district].filter(Boolean).join(' · ')}
            <span className="mx-1">·</span>
            {timeAgo(post.createdAt)}
          </p>
        </div>
        {post.featured && (
          <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-navy-900">Featured</span>
        )}
      </header>

      <ImageCarousel images={post.images} alt={post.caption || 'LFE field photograph'} />

      <div className="space-y-3 px-4 py-4">
        {post.caption && <p className="text-[17px] leading-relaxed text-navy-950">{post.caption}</p>}
        <p className="flex items-start gap-2 text-sm text-stone-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
          <Link to={`/venue/${post.venue?.slug}`} className="hover:underline">
            {post.venue?.name}
          </Link>
        </p>
        <p className="flex items-center gap-2 text-sm text-stone-600">
          <GraduationCap className="h-4 w-4 text-gold-500" />
          {seasonLabel(post.semester)}
          {post.group ? ` · ${groupLabel(post.group)}` : ''}
        </p>

        <div className="flex flex-wrap gap-3 text-sm text-stone-600">
          {REACTIONS.map((r) => (
            <span key={r.type}>
              {r.icon} {post.reactionBreakdown?.[r.type] || 0}
            </span>
          ))}
          <span className="ml-auto">💬 {post.commentCount || 0}</span>
        </div>

        <div className="flex items-center gap-1 border-t border-stone-100 pt-2">
          <div className="relative">
            <button
              type="button"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                post.myReaction ? 'text-red-600' : 'text-stone-700 hover:bg-stone-50'
              }`}
              onClick={() => (user ? setPicker((v) => !v) : null)}
            >
              <Heart className={`h-4 w-4 ${post.myReaction ? 'fill-current' : ''}`} />
              Like
            </button>
            {picker && (
              <div className="absolute bottom-full left-0 mb-2 flex gap-1 rounded-full bg-white p-1 shadow-lg ring-1 ring-stone-200">
                {REACTIONS.map((r) => (
                  <button
                    key={r.type}
                    type="button"
                    className="rounded-full px-2 py-1 text-lg hover:bg-stone-100"
                    aria-label={r.label}
                    onClick={() => react(r.type)}
                  >
                    {r.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link to={`/post/${post.id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
            <MessageCircle className="h-4 w-4" />
            Comment
          </Link>
          <button type="button" onClick={share} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
            <Share2 className="h-4 w-4" />
            Share
          </button>
          {user && (
            <button
              type="button"
              onClick={() => setOpenReport(true)}
              className="ml-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-500 hover:bg-stone-50"
            >
              <Flag className="h-4 w-4" />
              Report
            </button>
          )}
        </div>
      </div>
      {openReport && <ReportModal postId={post.id} onClose={() => setOpenReport(false)} />}
    </article>
  );
}
