import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { PostCard } from '../components/PostCard.jsx';
import { Spinner } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { setSeo } from '../utils/format.js';
import { useEffect } from 'react';
import { Avatar } from '../components/Avatar.jsx';

export function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const postQ = useQuery({
    queryKey: ['post', id],
    queryFn: async () => (await api.get(`/posts/${id}`)).data.data.post,
  });
  const commentsQ = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => (await api.get(`/posts/${id}/comments`)).data.data,
  });

  useEffect(() => {
    if (postQ.data) {
      setSeo({
        title: postQ.data.caption?.slice(0, 60) || 'Field photograph',
        description: `${postQ.data.author?.profile?.fullName} · ${postQ.data.venue?.name}`,
      });
    }
  }, [postQ.data]);

  if (postQ.isLoading) return <Spinner />;
  const post = postQ.data;

  async function submit(e) {
    e.preventDefault();
    await api.post(`/posts/${id}/comments`, { body });
    setBody('');
    commentsQ.refetch();
    postQ.refetch();
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <PostCard post={post} onChange={() => postQ.refetch()} />
      <section className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
        <h2 className="font-display text-xl">Comments</h2>
        <div className="mt-4 space-y-4">
          {(commentsQ.data?.items || []).map((c) => (
            <div key={c.id}>
              <div className="flex gap-3">
                <Avatar user={c.author} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{c.author?.profile?.fullName}</p>
                  <p>{c.body}</p>
                </div>
              </div>
              {(c.replies || []).map((r) => (
                <div key={r.id} className="ml-10 mt-2 flex gap-3">
                  <Avatar user={r.author} size="sm" />
                  <div>
                    <p className="text-sm font-semibold">{r.author?.profile?.fullName}</p>
                    <p>{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        {user && (
          <form onSubmit={submit} className="mt-4 flex gap-2">
            <label className="sr-only" htmlFor="comment">
              Add a comment
            </label>
            <input
              id="comment"
              className="flex-1 rounded-xl border px-3 py-2"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment"
              maxLength={1000}
              required
            />
            <button className="rounded-xl bg-navy-900 px-4 text-white" type="submit">
              Post
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
