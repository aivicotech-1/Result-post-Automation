export function parseCsvText(csvText) {
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cells = lines[i].split(',');
    const item = {};
    header.forEach((key, index) => {
      item[key] = (cells[index] || '').trim();
    });
    rows.push(item);
  }

  return rows;
}

export function normalizeStudentRow(raw, index = 1) {
  const name = String(raw.name || '').trim();
  const marks = raw.marks !== undefined && raw.marks !== null && raw.marks !== '' ? Number(raw.marks) : '';
  const total = raw.total !== undefined && raw.total !== null && raw.total !== '' ? Number(raw.total) : null;

  return {
    id: `row-${index}-${Date.now()}`,
    name,
    marks,
    total,
    rollNo: String(raw.roll_no || raw.rollNo || '').trim(),
    phone: String(raw.phone || '').trim(),
    feedback: String(raw.feedback || '').trim(),
    status: 'valid',
    warnings: [],
    errors: []
  };
}
