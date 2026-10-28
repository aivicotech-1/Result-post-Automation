export async function generatePdfFromCanvases(generated) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error('jsPDF is required to build PDF exports.');
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [1080, 1080] });

  generated.forEach((item, index) => {
    const canvas = item.canvas;
    if (index > 0) pdf.addPage([1080, 1080], 'portrait');
    const image = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(image, 'JPEG', 0, 0, 1080, 1080, undefined, 'FAST');
  });

  return pdf.output('blob');
}
