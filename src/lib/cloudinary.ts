/**
 * Optimizes Cloudinary image URLs using URL transformation parameters.
 * Keeps the original image intact, but requests optimized format, quality, and sizing for delivery.
 * 
 * Target transformation parameters:
 * - f_auto: Automatically deliver the best format based on the browser (webp, avif, etc.)
 * - q_auto: Automatically optimize image quality while keeping visual appeal.
 * - w_600: Limit width to 600px (ideal for grid cards and details page container).
 * - c_limit: Crop/resize only if the original image is larger than 600px, keeping aspect ratio.
 */
export function optimizeCloudinaryUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;

  // Verify if it is a Cloudinary delivery URL
  if (url.includes('res.cloudinary.com')) {
    // Locate the '/upload/' segment of the URL to inject transformations
    const uploadSegment = '/upload/';
    const uploadIndex = url.indexOf(uploadSegment);
    
    if (uploadIndex !== -1) {
      const insertionPoint = uploadIndex + uploadSegment.length;
      return url.slice(0, insertionPoint) + 'f_auto,q_auto,w_600,c_limit/' + url.slice(insertionPoint);
    }
  }

  return url;
}
