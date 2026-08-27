import { CldImage } from '../lib/cloudinary.jsx';

const SIZE_PX = { sm: 64, md: 96, lg: 160 };

export function Avatar({ user, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-20 w-20 text-xl' };
  const name = user?.profile?.fullName || 'Student';
  const avatar = user?.profile?.avatar;
  const src = avatar?.thumbnailUrl || avatar?.url;
  const px = SIZE_PX[size] || 96;
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  if (src || avatar?.publicId) {
    return (
      <CldImage
        publicId={avatar?.publicId}
        src={src}
        alt=""
        width={px}
        height={px}
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
