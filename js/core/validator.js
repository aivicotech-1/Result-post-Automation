export function validateRow(row, settings) {
  const errors = [];
  const warnings = [];
  const name = String(row.name || '').trim();
  const marks = Number(row.marks);
  const total = Number(row.total ?? settings.totalMarks ?? 0);

  if (!name) {
    errors.push('Name is missing');
  }

  if (row.marks === '' || row.marks === null || Number.isNaN(marks)) {
    errors.push('Marks must be a number');
  }

  if (Number.isFinite(marks) && marks < 0) {
    errors.push('Marks cannot be negative');
  }

  if (Number.isFinite(marks) && Number.isFinite(total) && total > 0 && marks > total) {
    errors.push(`Marks ${marks} is more than total ${total}`);
  }

  if (!Number.isFinite(total) || total <= 0) {
    errors.push('Total marks is missing or invalid');
  }

  if (name.length > 60) {
    warnings.push('Name is long and may be auto-shrunk');
  }

  return { valid: errors.length === 0, errors, warnings };
}
