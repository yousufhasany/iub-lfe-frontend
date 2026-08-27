import { useState } from 'react';
import { api } from '../api/client.js';

const REASONS = [
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'privacy', label: 'Privacy concern' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'copyright', label: 'Copyright concern' },
  { id: 'spam', label: 'Spam' },
  { id: 'misleading', label: 'Misleading information' },
  { id: 'other', label: 'Other' },
];

export function ReportModal({ postId, commentId, onClose }) {
  const [reason, setReason] = useState('privacy');
  const [details, setDetails] = useState('');
  const [removalRequest, setRemovalRequest] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/reports', {
        targetType: commentId ? 'comment' : 'post',
        postId,
        commentId,
        reason,
        details,
        removalRequest,
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog" aria-modal>
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="font-display text-xl text-navy-900">Report or request removal</h2>
        {done ? (
          <p className="mt-4 text-stone-700">Thank you. LFE staff will review this report.</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-stone-600">
              Use this for privacy concerns, including photographs of community members who should not be shown.
            </p>
            <label className="mt-4 block text-sm font-medium">Reason</label>
            <select
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REASONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <label className="mt-4 block text-sm font-medium">Details</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={removalRequest} onChange={(e) => setRemovalRequest(e.target.checked)} />
              Request this content be taken down
            </label>
            {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          </>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm">
            Close
          </button>
          {!done && (
            <button type="submit" className="rounded-xl bg-navy-900 px-4 py-2 text-sm text-white">
              Submit report
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
