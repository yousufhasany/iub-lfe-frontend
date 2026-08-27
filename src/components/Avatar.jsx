export function Avatar({ user, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-20 w-20 text-xl' };
  const name = user?.profile?.fullName || 'Student';
  const src = user?.profile?.avatar?.thumbnailUrl || user?.profile?.avatar?.url;
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white shadow-sm`}
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} rounded-full bg-navy-900 text-gold-400 flex items-center justify-center font-semibold ring-2 ring-white shadow-sm`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
