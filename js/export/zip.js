export async function generateZipFromCanvases(generated) {
  if (!window.JSZip) {
    throw new Error('JSZip is required to build ZIP exports.');
  }

  const zip = new window.JSZip();
  for (const item of generated) {
    const blob = item.blob || await new Promise((resolve) => item.canvas.toBlob(resolve, 'image/png'));
    zip.file(item.fileName || `${item.id}.png`, blob);
  }

  return zip.generateAsync({ type: 'blob', compression: 'STORE' });
}
