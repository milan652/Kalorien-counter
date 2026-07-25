/**
 * Compresses a Data URL image to fit within safe dimension and file size boundaries.
 * Returns a Promise resolving to the compressed Data URL (JPEG).
 */
export function compressImage(
  dataUrl: string, 
  maxWidth = 1000, 
  maxHeight = 1000, 
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = dataUrl;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } else {
          resolve(dataUrl);
        }
      } catch (e) {
        console.error('Error compressing image:', e);
        resolve(dataUrl);
      }
    };

    img.onerror = (e) => {
      console.error('Error loading image for compression:', e);
      resolve(dataUrl);
    };
  });
}
