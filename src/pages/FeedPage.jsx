import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { PostCard } from '../components/PostCard.jsx';
import { Spinner, EmptyState } from '../components/ui.jsx';
import { useMemo, useState } from 'react';
import { setSeo } from '../utils/format.js';
import { useEffect } from 'react';

export function FeedPage() {
  const [sort, setSort] = useState('latest');
  useEffect(() => setSeo({ title: 'Home', description: 'Latest LFE field photographs from IUB students.' }), []);

  const query = useInfiniteQuery({
    queryKey: ['feed', sort],
    queryFn: async ({ pageParam = 1 }) =>
      (await api.get('/posts', { params: { page: pageParam, limit: 8, sort } })).data.data,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
  });

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) || [], [query.data]);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Field feed</h1>
        <div className="flex rounded-full bg-white p-1 text-sm ring-1 ring-stone-200">
          {['latest', 'popular'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              className={`rounded-full px-3 py-1 capitalize ${sort === s ? 'bg-navy-900 text-white' : ''}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      {query.isLoading && <Spinner />}
      {items.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onChange={() => query.refetch()}
        />
      ))}
      {!query.isLoading && items.length === 0 && (
        <EmptyState title="No photographs yet" body="Be the first to share a field memory." />
      )}
      {query.hasNextPage && (
        <button
          type="button"
          className="w-full rounded-xl bg-white py-3 text-sm ring-1 ring-stone-200"
          onClick={() => query.fetchNextPage()}
        >
          Load more
        </button>
      )}
    </div>
  );
}
