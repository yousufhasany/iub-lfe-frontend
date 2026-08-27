import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ImageCarousel({ images, alt = 'Field photograph' }) {
  const [index, setIndex] = useState(0);
  if (!images?.length) return null;
  const current = images[index];
  const src = current.webpUrl || current.url;

  return (
    <div className="relative overflow-hidden bg-navy-950">
      <img
        src={src}
        alt={current.alt || alt}
        loading="lazy"
        className="aspect-[4/3] w-full object-cover"
      />
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            aria-label="Previous photograph"
            onClick={() => setIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            aria-label="Next photograph"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Photograph ${i + 1}`}
                className={`h-1.5 rounded-full ${i === index ? 'w-5 bg-gold-400' : 'w-1.5 bg-white/60'}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
