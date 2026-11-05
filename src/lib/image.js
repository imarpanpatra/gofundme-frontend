const MAX_BYTES = 3.5 * 1024 * 1024;

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function prepareImage(file, maxWidth, maxHeight) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file');
  if (file.type === 'image/gif') {
    if (file.size > MAX_BYTES) throw new Error('GIFs must be under 3.5MB');
    return file;
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error('Could not read this image');
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  let quality = 0.88;
  let blob = await canvasToBlob(canvas, 'image/webp', quality);
  const type = blob?.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
  if (type === 'image/jpeg') blob = await canvasToBlob(canvas, type, quality);
  while (blob && blob.size > MAX_BYTES && quality > 0.5) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, type, quality);
  }
  if (!blob || blob.size > MAX_BYTES) throw new Error('Image is too large, try a smaller one');
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.${type === 'image/webp' ? 'webp' : 'jpg'}`, { type });
}
