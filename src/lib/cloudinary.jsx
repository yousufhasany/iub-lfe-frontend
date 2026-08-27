import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage, lazyload, placeholder } from '@cloudinary/react';

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'p322twby';

export const cld = new Cloudinary({
  cloud: { cloudName: CLOUDINARY_CLOUD_NAME },
});

export function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
}

export function CldImage({
  publicId,
  src,
  alt = '',
  className,
  width,
  height,
  crop = true,
}) {
  const fromCloudinary = publicId && (isCloudinaryUrl(src) || isCloudinaryUrl(publicId));
  if (fromCloudinary) {
    let image = cld.image(publicId).format('auto').quality('auto');
    if (width && height && crop) {
      image = image.resize(auto().gravity(autoGravity()).width(width).height(height));
    } else if (width) {
      image = image.resize(auto().width(width));
    }
    return (
      <AdvancedImage
        cldImg={image}
        alt={alt}
        className={className}
        plugins={[lazyload(), placeholder()]}
      />
    );
  }

  return <img src={src} alt={alt} className={className} loading="lazy" />;
}
