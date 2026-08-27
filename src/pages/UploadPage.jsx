import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorBanner } from '../components/ui.jsx';
import { groupLabel, seasonLabel } from '../utils/format.js';

const CONSENT =
  'Please upload photographs responsibly. Obtain appropriate permission before publishing identifiable photographs of community members, especially children or people who may not expect their image to be publicly shared.';

export function UploadPage() {
  const { register, handleSubmit } = useForm();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const venue = user?.lfe?.venue;
  const semester = user?.lfe?.semester;
  const group = user?.lfe?.group;
  const assigned = Boolean(venue && semester);

  async function onFiles(list) {
    const chosen = Array.from(list).slice(0, 10);
    const compressed = [];
    for (const file of chosen) {
      if (!file.type.startsWith('image/')) continue;
      const out = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
      });
      compressed.push(out);
    }
    setFiles(compressed);
    setPreviews(compressed.map((f) => URL.createObjectURL(f)));
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl">Share a field memory</h1>
      <p className="mt-2 rounded-xl bg-gold-100 p-4 text-sm text-navy-900">{CONSENT}</p>

      {assigned ? (
        <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm text-stone-600 ring-1 ring-stone-200">
          Posting to {venue?.name || venue?.district}
          {group ? ` · ${groupLabel(group)}` : ''}
          {semester ? ` · ${seasonLabel(semester)}` : ''}
        </p>
      ) : (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          Choose your venue, semester, and group in your{' '}
          <Link to="/profile" className="font-medium underline">
            profile
          </Link>{' '}
          before uploading.
        </p>
      )}

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit(async (values) => {
          setError(null);
          if (!assigned) {
            setError(new Error('Please complete your venue, semester, and group on your profile first.'));
            return;
          }
          if (!files.length) {
            setError(new Error('Please add at least one photograph.'));
            return;
          }
          setBusy(true);
          try {
            const form = new FormData();
            form.append('caption', values.caption || '');
            form.append('communityConsent', values.communityConsent ? 'true' : 'false');
            form.append('copyrightConfirmation', values.copyrightConfirmation ? 'true' : 'false');
            files.forEach((f) => form.append('images', f, f.name || 'photo.jpg'));
            const { data } = await api.post('/posts', form);
            navigate(`/post/${data.data.post.id}`);
          } catch (err) {
            setError(err);
          } finally {
            setBusy(false);
          }
        })}
      >
        <ErrorBanner error={error} />
        <label className="block rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center">
          <span className="font-medium">Add up to 10 photographs</span>
          <input
            className="mt-3 block w-full text-sm"
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src) => (
              <img key={src} src={src} alt="" className="aspect-square rounded-lg object-cover" />
            ))}
          </div>
        )}
        <label className="block text-sm font-medium">
          Caption
          <textarea className="mt-1 w-full rounded-xl border px-3 py-2" rows={3} placeholder="What happened in the field?" {...register('caption')} />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" value="true" {...register('communityConsent', { required: true })} />
          I obtained appropriate permission before publishing identifiable photographs of community members.
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" value="true" {...register('copyrightConfirmation', { required: true })} />
          I confirm that I have the right/permission to upload this photograph.
        </label>
        <button disabled={busy || !assigned} className="w-full rounded-xl bg-navy-900 py-3 text-white disabled:opacity-60" type="submit">
          {busy ? 'Uploading…' : 'Publish'}
        </button>
      </form>
    </div>
  );
}
