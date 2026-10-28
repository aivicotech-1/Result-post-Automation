export function openWhatsAppQueue(rows) {
  const validRows = rows.filter((row) => row.phone && row.name);
  if (!validRows.length) {
    window.alert('Add a valid phone number to a student first.');
    return;
  }

  const firstRow = validRows[0];
  const firstName = String(firstRow.name).split(' ')[0];
  const message = `Assalam o Alaikum ${firstName}! Here is your result: https://example.com/r/${firstRow.linkToken || 'demo'}`;
  const url = `https://wa.me/${firstRow.phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}
