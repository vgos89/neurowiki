import React from 'react';
import type { TeachingImage } from '../../data/imaging/types';

/**
 * Renders one teaching figure with a license credit line.
 * A `pending` photo (asset not yet in the repo) renders as a labelled
 * placeholder that describes what it will show, so the real image drops in
 * later with no code change (see docs/imaging/ct-head-image-manifest.md).
 */
export const Figure: React.FC<{ image: TeachingImage }> = ({ image }) => {
  const isPending = image.status === 'pending';

  return (
    <figure className="my-5">
      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        {isPending ? (
          // Placeholder stands in for an informative image, so it is exposed
          // as an image (role="img") with the same alt text the real asset
          // will carry, plus a "not yet available" note. The decorative icon
          // and caption text are hidden from assistive tech so they are not
          // announced twice.
          <div
            role="img"
            aria-label={`Reference image not yet available. It will show: ${image.alt}`}
            className="flex flex-col items-center justify-center text-center px-6 py-10"
          >
            <svg aria-hidden="true" className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p aria-hidden="true" className="text-xs font-medium text-slate-500">Reference CT example coming soon</p>
          </div>
        ) : (
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            className="w-full h-auto block"
          />
        )}
      </div>
      <figcaption className="mt-2 text-sm text-slate-600 leading-snug">
        {image.caption}
        <span className="block mt-1 text-[11px] text-slate-400">
          {image.license.sourceUrl ? (
            <a href={image.license.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {image.license.attribution}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            image.license.attribution
          )}
        </span>
      </figcaption>
    </figure>
  );
};
