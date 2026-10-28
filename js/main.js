import { DEFAULT_SETTINGS } from './config/defaults.js';
import { buildCanvasForRow, drawStudentPost } from './core/renderer.js';
import { parseCsvText, normalizeStudentRow } from './core/parser.js';
import { getStars, calculatePct, formatScore } from './core/scoring.js';
import { validateRow } from './core/validator.js';
import { state, loadState, saveState } from './state.js';
import { generateZipFromCanvases } from './export/zip.js';
import { generatePdfFromCanvases } from './export/pdf.js';
import { openWhatsAppQueue } from './share/whatsapp.js';

const fileInput = document.getElementById('file-input');
const dropzone = document.getElementById('dropzone');
const manualStudentForm = document.getElementById('manual-student-form');
const studentTableBody = document.getElementById('student-table-body');
const previewCanvas = document.getElementById('preview-canvas');
const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const statusSummary = document.getElementById('status-summary');
const tableSearch = document.getElementById('table-search');
const headerSelect = document.getElementById('header-select');
const stepButtons = [...document.querySelectorAll('.step')];
const stepPanels = [...document.querySelectorAll('.step-panel')];
const selectAllBtn = document.getElementById('select-all-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const generateBtn = document.getElementById('generate-btn');
const cancelBtn = document.getElementById('cancel-btn');
const downloadZipBtn = document.getElementById('download-zip-btn');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const exportLinksBtn = document.getElementById('export-links-btn');
const whatsappQueueBtn = document.getElementById('whatsapp-queue-btn');
const downloadSingleBtn = document.getElementById('download-single-btn');
const downloadSinglePdfBtn = document.getElementById('download-single-pdf-btn');
const prevPreviewBtn = document.getElementById('prev-preview-btn');
const nextPreviewBtn = document.getElementById('next-preview-btn');
const deleteAllBtn = document.getElementById('delete-all-btn');
const downloadSampleBtn = document.getElementById('download-sample-btn');
const fileStatus = document.getElementById('file-status');
const uploadInstructions = document.getElementById('upload-instructions');

const settingsFields = {
  courseName: document.getElementById('course-name'),
  quizTitle: document.getElementById('quiz-title'),
  totalMarks: document.getElementById('total-marks'),
  date: document.getElementById('quiz-date'),
  feedbackEnabled: document.getElementById('feedback-toggle'),
  starRuleMode: document.getElementById('star-rule-mode'),
  customStarRules: document.getElementById('custom-star-rules'),
  starMax1: document.getElementById('star-max-1'),
  starMax2: document.getElementById('star-max-2'),
  starMax3: document.getElementById('star-max-3'),
  starMax4: document.getElementById('star-max-4'),
  themeTemplate: document.getElementById('theme-template'),
  themeBgStart: document.getElementById('theme-bg-start'),
  themeBgEnd: document.getElementById('theme-bg-end'),
  themeAccent: document.getElementById('theme-accent')
};

const THEME_PRESETS = {
  'sky-blue': {
    name: 'Sky Blue',
    backgroundStart: '#edf5ff',
    backgroundEnd: '#ffffff',
    accent: '#1E3FA8',
    accentSoft: '#E8F2FD',
    scoreBg: '#FDF1DC',
    cardBg: '#ffffff',
    cardBorder: '#B9D4F5',
    stars: '#FBBF24',
    neutral: '#C5CCE0',
    text: '#1E3FA8'
  },
  green: {
    name: 'Green Accent',
    backgroundStart: '#ebfff7',
    backgroundEnd: '#ffffff',
    accent: '#0d8f62',
    accentSoft: '#e2fff1',
    scoreBg: '#fff5d9',
    cardBg: '#ffffff',
    cardBorder: '#cfeadf',
    stars: '#f4b740',
    neutral: '#d1d9d4',
    text: '#0d3f32'
  },
  royal: {
    name: 'Royal Blue',
    backgroundStart: '#edf2ff',
    backgroundEnd: '#f8fbff',
    accent: '#2d4ed8',
    accentSoft: '#e3ebff',
    scoreBg: '#fff1cf',
    cardBg: '#ffffff',
    cardBorder: '#d0d8f9',
    stars: '#f7ba28',
    neutral: '#c8d1ed',
    text: '#1d2d7a'
  },
  sunset: {
    name: 'Sunset',
    backgroundStart: '#fff0e8',
    backgroundEnd: '#fffdfb',
    accent: '#d96d31',
    accentSoft: '#fff0df',
    scoreBg: '#fff7d6',
    cardBg: '#fffefb',
    cardBorder: '#f1d1b6',
    stars: '#f5b63b',
    neutral: '#e7c9b5',
    text: '#7d4328'
  }
};

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2600);
}

function ensureFontsLoaded() {
  return document.fonts.ready.then(() => document.fonts.load('800 64px "Baloo 2"'));
}

function sanitizeName(name) {
  return String(name || '').replace(/[<>]/g, '').trim();
}

function buildFilename(name) {
  return sanitizeName(name).replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');
}

function syncSettingsForm() {
  settingsFields.courseName.value = state.settings.courseName || DEFAULT_SETTINGS.courseName;
  settingsFields.quizTitle.value = state.settings.quizTitle || DEFAULT_SETTINGS.quizTitle;
  settingsFields.totalMarks.value = state.settings.totalMarks || DEFAULT_SETTINGS.totalMarks;
  settingsFields.date.value = state.settings.date || '';
  settingsFields.feedbackEnabled.checked = state.settings.feedbackEnabled !== false;
  settingsFields.starRuleMode.value = state.settings.starRuleMode || 'default';
  const starRules = state.settings.customStarRules || [20, 40, 60, 80];
  [settingsFields.starMax1, settingsFields.starMax2, settingsFields.starMax3, settingsFields.starMax4]
    .forEach((field, index) => { field.value = starRules[index] ?? [20, 40, 60, 80][index]; });
  settingsFields.customStarRules.style.display = settingsFields.starRuleMode.value === 'custom' ? 'grid' : 'none';

  const theme = state.settings.theme || DEFAULT_SETTINGS.theme;
  const presetKey = Object.entries(THEME_PRESETS).find(([, preset]) => {
    return preset.accent === theme.accent && preset.backgroundStart === theme.backgroundStart;
  })?.[0] || 'sky-blue';

  settingsFields.themeTemplate.value = presetKey;
  settingsFields.themeBgStart.value = theme.backgroundStart || '#edf5ff';
  settingsFields.themeBgEnd.value = theme.backgroundEnd || '#ffffff';
  settingsFields.themeAccent.value = theme.accent || '#1E3FA8';
}

function applyThemePreset() {
  const presetKey = settingsFields.themeTemplate.value;
  const preset = THEME_PRESETS[presetKey] || THEME_PRESETS['sky-blue'];

  settingsFields.themeBgStart.value = preset.backgroundStart;
  settingsFields.themeBgEnd.value = preset.backgroundEnd;
  settingsFields.themeAccent.value = preset.accent;

  state.settings.theme = {
    ...preset,
    name: preset.name || 'Custom'
  };
  saveState();
  renderPreview();
}

function getCustomStarThresholds() {
  return [
    Number(settingsFields.starMax1.value || 20),
    Number(settingsFields.starMax2.value || 40),
    Number(settingsFields.starMax3.value || 60),
    Number(settingsFields.starMax4.value || 80)
  ];
}

function getCustomStarRules() {
  return getCustomStarThresholds().map((maxPct, index) => ({ maxPct, stars: index + 1 })).concat({ maxPct: 100, stars: 5 });
}

function getCurrentThemeFromInputs() {
  return {
    name: settingsFields.themeTemplate.options[settingsFields.themeTemplate.selectedIndex]?.text || 'Custom',
    backgroundStart: settingsFields.themeBgStart.value,
    backgroundEnd: settingsFields.themeBgEnd.value,
    accent: settingsFields.themeAccent.value,
    accentSoft: '#E8F2FD',
    scoreBg: '#FDF1DC',
    cardBg: '#ffffff',
    cardBorder: '#B9D4F5',
    stars: '#FBBF24',
    neutral: '#C5CCE0',
    text: settingsFields.themeAccent.value
  };
}

function updateStatusSummary() {
  const rows = state.rows || [];
  const valid = rows.filter((row) => !row.errors || row.errors.length === 0).length;
  const issues = rows.filter((row) => Array.isArray(row.errors) && row.errors.length > 0).length;
  statusSummary.textContent = rows.length
    ? `Valid rows: ${valid}. Issues: ${issues}.`
    : 'No data loaded yet.';
}

function persistRows() {
  saveState();
  updateStatusSummary();
  renderTable();
}

function calculateRowDetails(row) {
  const total = Number(state.settings.totalMarks ?? 15);
  const marks = Number(row.marks ?? 0);
  const pct = calculatePct(marks, total);
  row.pct = pct;
  const starRules = state.settings.starRuleMode === 'custom'
    ? state.settings.starRules || getCustomStarRules()
    : undefined;
  row.stars = starRules ? getStars(marks, total, starRules) : getStars(marks, total);
  row.tier = pct >= 85 ? 'excellent' : pct >= 60 ? 'good' : 'practice';
  row.feedback = row.feedback || `Great effort, ${String(row.name || 'Student').split(' ')[0]}! Keep coding!`;
  row.total = total;
  const validation = validateRow(row, state.settings);
  row.errors = validation.errors;
  row.warnings = validation.warnings;
  row.status = validation.valid ? 'valid' : 'error';
  return row;
}

function applyValidation() {
  state.rows = state.rows.map((row) => calculateRowDetails(row));
  saveState();
  renderTable();
  renderPreview();
}

function renderTable() {
  const rows = state.rows.filter((row) => {
    const query = tableSearch.value.trim().toLowerCase();
    if (!query) return true;
    return `${row.name} ${row.rollNo || ''}`.toLowerCase().includes(query);
  });

  studentTableBody.innerHTML = rows
    .map((row, index) => {
      const actualIndex = state.rows.findIndex((item) => item.id === row.id);
      const selected = actualIndex === state.selectedIndex;
      return `
        <tr data-row-id="${row.id}" class="${selected ? 'selected-row' : ''}">
          <td><input data-action="toggle-select" data-id="${row.id}" type="checkbox" ${row.selected ? 'checked' : ''} /></td>
          <td><input data-action="name" data-id="${row.id}" value="${escapeHtml(row.name || '')}" /></td>
          <td><input data-action="marks" data-id="${row.id}" value="${row.marks ?? ''}" /></td>
          <td>${row.stars ?? 0}</td>
          <td><input data-action="phone" data-id="${row.id}" value="${escapeHtml(row.phone || '')}" /></td>
          <td><input data-action="feedback" data-id="${row.id}" value="${escapeHtml(row.feedback || '')}" /></td>
          <td>
            <button type="button" class="btn btn-secondary btn-small" data-action="select" data-id="${row.id}">Preview</button>
            <button type="button" class="btn btn-danger btn-small" data-action="delete" data-id="${row.id}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join('');

  updateStatusSummary();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setSelectedIndex(index) {
  if (state.rows.length === 0) return;
  const safeIndex = Math.max(0, Math.min(index, state.rows.length - 1));
  state.selectedIndex = safeIndex;
  saveState();
  renderTable();
  renderPreview();
}

async function renderPreview() {
  if (!state.rows.length) {
    previewCanvas.getContext('2d').clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    return;
  }

  const row = state.rows[state.selectedIndex] || state.rows[0];
  if (!row) return;

  await ensureFontsLoaded();
  const canvas = buildCanvasForRow(row, state.settings);
  previewCanvas.width = canvas.width;
  previewCanvas.height = canvas.height;
  const ctx = previewCanvas.getContext('2d');
  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  ctx.drawImage(canvas, 0, 0);
  const counter = document.getElementById('preview-counter');
  counter.textContent = `${state.selectedIndex + 1} / ${state.rows.length}`;
}

function addStudentRow(raw) {
  const item = normalizeStudentRow(raw, state.rows.length + 1);
  const total = Number(state.settings.totalMarks || item.total || 15);
  item.total = total;
  item.marks = Number.isNaN(Number(item.marks)) ? '' : Number(item.marks);
  item.phone = String(item.phone || '').trim();
  const validation = validateRow(item, state.settings);
  item.errors = validation.errors;
  item.warnings = validation.warnings;
  item.status = validation.valid ? 'valid' : 'error';
  state.rows.push(item);
  state.selectedIndex = state.rows.length - 1;
  saveState();
  renderTable();
  renderPreview();
  showToast('Student added.');
}

function handleManualStudentSubmit(event) {
  event.preventDefault();
  const formData = new FormData(manualStudentForm);
  addStudentRow({
    name: formData.get('name'),
    marks: formData.get('marks'),
    phone: formData.get('phone'),
    roll_no: formData.get('rollNo')
  });
  manualStudentForm.reset();
}

function readSelectedRows() {
  return state.rows.filter((row) => row.selected);
}

function updateFromTableInput(event) {
  const { action, id } = event.target.dataset;
  const row = state.rows.find((item) => item.id === id);
  if (!row) return;

  if (action === 'name') row.name = event.target.value;
  if (action === 'marks') row.marks = event.target.value;
  if (action === 'phone') row.phone = event.target.value;
  if (action === 'feedback') row.feedback = event.target.value;
  if (action === 'toggle-select') row.selected = event.target.checked;
  calculateRowDetails(row);

  if (action === 'select') {
    const index = state.rows.findIndex((item) => item.id === id);
    if (index >= 0) setSelectedIndex(index);
  }

  if (action === 'delete') {
    state.rows = state.rows.filter((item) => item.id !== id);
    if (state.selectedIndex >= state.rows.length) state.selectedIndex = 0;
    saveState();
    renderTable();
    renderPreview();
    return;
  }

  const validation = validateRow(row, state.settings);
  row.errors = validation.errors;
  row.warnings = validation.warnings;
  row.status = validation.valid ? 'valid' : 'error';
  saveState();
  renderTable();
  renderPreview();
}

async function handleFileUpload(file) {
  if (!file) return;

  const allowedExtensions = ['csv', 'xlsx', 'xls', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'png', 'jpg', 'jpeg'];
  const fileExt = (file.name.split('.').pop() || '').toLowerCase();
  const isSupported = allowedExtensions.includes(fileExt) || file.type.startsWith('image/') || file.type.includes('pdf') || file.type.includes('sheet') || file.type.includes('document') || file.type.includes('officedocument') || file.type.includes('text/plain');

  if (!isSupported) {
    showToast('This file type is not accepted. Please choose a PDF, Word, Excel, PowerPoint, image, or CSV file.');
    return;
  }

  const extensionLabel = fileExt ? fileExt.toUpperCase() : (file.type || 'file');
  fileStatus.textContent = `Selected file: ${file.name} (${extensionLabel}) accepted. Spreadsheets are parsed automatically; PDFs, Word, and PowerPoint files are kept ready for manual mapping or reference.`;
  uploadInstructions.value = `File uploaded: ${file.name}\nType: ${extensionLabel}\nInstructions: use the student list for marks and names. For documents such as PDF, Word, or PPT files, confirm the data manually in the table after upload.`;

  if (!['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type) && !/\.(csv|xlsx|xls)$/i.test(file.name)) {
    showToast('File accepted. For the best automatic result generation, prefer CSV or Excel files.');
    return;
  }

  try {
    if (/\.csv$/i.test(file.name)) {
      const text = await file.text();
      const rows = parseCsvText(text);
      const list = rows.slice(1).map((item) => ({ ...item }));
      state.rows = list.map((item, idx) => {
        const row = normalizeStudentRow(item, idx + 1);
        row.total = Number(item.total ?? state.settings.totalMarks ?? 15);
        return calculateRowDetails(row);
      });
    } else {
      const arrayBuffer = await file.arrayBuffer();
      const { read, utils } = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm');
      const workbook = read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = utils.sheet_to_json(worksheet, { defval: '' });
      state.rows = rows.map((item, idx) => {
        const row = normalizeStudentRow(item, idx + 1);
        row.total = Number(item.total ?? state.settings.totalMarks ?? 15);
        return calculateRowDetails(row);
      });
    }

    state.selectedIndex = 0;
    saveState();
    renderTable();
    renderPreview();
    showToast('File uploaded successfully.');
  } catch (error) {
    console.error(error);
    showToast('Could not parse the file. Please check the columns and try again.');
  }
}

function exportLinksCsv() {
  const rows = state.rows.filter((row) => row.name);
  const header = ['name', 'roll_no', 'phone', 'link'];
  const body = rows.map((row) => {
    const token = row.linkToken || `post-${row.id}`;
    const link = `https://example.com/r/${token}`;
    row.linkToken = token;
    row.link = link;
    return [row.name, row.rollNo || row.roll_no || '', row.phone || '', link].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',');
  });
  const csv = [header.join(','), ...body].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'student-links.csv';
  link.click();
  URL.revokeObjectURL(url);
  saveState();
}

async function generateAllPosts() {
  if (!state.rows.length) {
    showToast('Add some students before generating posts.');
    return;
  }

  state.isGenerating = true;
  const validRows = state.rows.filter((row) => row.errors.length === 0);
  let generated = [];
  progressFill.style.width = '0%';

  for (let i = 0; i < validRows.length; i += 1) {
    if (!state.isGenerating) break;
    const row = validRows[i];
    const canvas = buildCanvasForRow(row, state.settings);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    generated.push({
      id: row.id,
      name: row.name,
      canvas,
      blob,
      fileName: `${buildFilename(row.rollNo || row.name || `student-${i + 1}`)}.png`
    });
    const percent = ((i + 1) / validRows.length) * 100;
    progressFill.style.width = `${percent}%`;
    progressLabel.textContent = `${Math.round(percent)}%`;
    await new Promise((resolve) => setTimeout(resolve, 12));
  }

  state.generated = generated;
  state.isGenerating = false;
  progressLabel.textContent = `${generated.length}/${validRows.length}`;
  showToast(`${generated.length} posts generated.`);
}

async function downloadZip() {
  if (!state.generated.length) {
    showToast('Generate posts first.');
    return;
  }

  const blob = await generateZipFromCanvases(state.generated);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'quiz-posts.zip';
  anchor.click();
  URL.revokeObjectURL(url);
}

async function downloadPdfBundle() {
  if (!state.generated.length) {
    showToast('Generate posts first.');
    return;
  }

  const blob = await generatePdfFromCanvases(state.generated);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'quiz-posts.pdf';
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadSelectedCanvas() {
  const row = state.rows[state.selectedIndex];
  if (!row) return;
  const canvas = buildCanvasForRow(row, state.settings);
  const url = canvas.toDataURL('image/png');
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${buildFilename(row.name || 'student')}.png`;
  anchor.click();
}

function downloadSelectedPdf() {
  const row = state.rows[state.selectedIndex];
  if (!row) return;
  const canvas = buildCanvasForRow(row, state.settings);
  const pdf = generatePdfFromCanvases([{ canvas, fileName: `${row.name}.png` }]);
  pdf.then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${buildFilename(row.name || 'student')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function changeStep(stepIndex) {
  state.currentStep = stepIndex;
  stepButtons.forEach((button, index) => {
    button.classList.toggle('is-active', index === stepIndex);
  });
  stepPanels.forEach((panel, index) => {
    panel.classList.toggle('is-visible', index === stepIndex);
  });
}

function attachEvents() {
  stepButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextStep = Number(button.dataset.step);
      changeStep(nextStep);
    });
  });

  fileInput.addEventListener('change', (event) => handleFileUpload(event.target.files[0]));
  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('dragging');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragging'));
  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('dragging');
    handleFileUpload(event.dataTransfer.files[0]);
  });
  dropzone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  });

  manualStudentForm.addEventListener('submit', handleManualStudentSubmit);
  studentTableBody.addEventListener('input', updateFromTableInput);
  studentTableBody.addEventListener('click', updateFromTableInput);
  tableSearch.addEventListener('input', renderTable);

  headerSelect.addEventListener('change', () => {
    state.rows.forEach((row) => {
      row.selected = headerSelect.checked;
    });
    saveState();
    renderTable();
  });

  selectAllBtn.addEventListener('click', () => {
    const nextValue = !state.rows.every((row) => row.selected);
    state.rows.forEach((row) => {
      row.selected = nextValue;
    });
    saveState();
    renderTable();
  });

  saveSettingsBtn.addEventListener('click', () => {
    state.settings.theme = getCurrentThemeFromInputs();
    state.settings = {
      ...state.settings,
      courseName: settingsFields.courseName.value,
      quizTitle: settingsFields.quizTitle.value,
      totalMarks: Number(settingsFields.totalMarks.value || 15),
      date: settingsFields.date.value,
      feedbackEnabled: settingsFields.feedbackEnabled.checked,
      starRuleMode: settingsFields.starRuleMode.value,
      customStarRules: getCustomStarThresholds(),
      starRules: settingsFields.starRuleMode.value === 'custom' ? getCustomStarRules() : undefined,
      theme: state.settings.theme
    };
    state.rows = state.rows.map((row) => calculateRowDetails(row));
    saveState();
    renderTable();
    renderPreview();
    showToast('Settings saved.');
  });

  generateBtn.addEventListener('click', generateAllPosts);
  cancelBtn.addEventListener('click', () => {
    state.isGenerating = false;
    showToast('Generation cancelled.');
  });
  downloadZipBtn.addEventListener('click', downloadZip);
  downloadPdfBtn.addEventListener('click', downloadPdfBundle);
  exportLinksBtn.addEventListener('click', exportLinksCsv);
  whatsappQueueBtn.addEventListener('click', () => openWhatsAppQueue(state.rows));
  downloadSingleBtn.addEventListener('click', downloadSelectedCanvas);
  downloadSinglePdfBtn.addEventListener('click', downloadSelectedPdf);
  prevPreviewBtn.addEventListener('click', () => setSelectedIndex(state.selectedIndex - 1));
  nextPreviewBtn.addEventListener('click', () => setSelectedIndex(state.selectedIndex + 1));
  deleteAllBtn.addEventListener('click', () => {
    if (!window.confirm('Delete all local student data?')) return;
    state.rows = [];
    state.generated = [];
    localStorage.removeItem('skill2success-state');
    renderTable();
    renderPreview();
    showToast('All data cleared.');
  });
  downloadSampleBtn.addEventListener('click', () => {
    const csv = 'name,marks,total,roll_no,phone\nHashir Usman,10,15,S2S-001,03001234567\nAyesha Khan,14,15,S2S-002,03111234567\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-students.csv';
    link.click();
    URL.revokeObjectURL(url);
  });

  settingsFields.themeTemplate.addEventListener('change', applyThemePreset);

  const liveSettingsFields = [
    settingsFields.courseName,
    settingsFields.quizTitle,
    settingsFields.totalMarks,
    settingsFields.date,
    settingsFields.themeBgStart,
    settingsFields.themeBgEnd,
    settingsFields.themeAccent,
    settingsFields.starMax1,
    settingsFields.starMax2,
    settingsFields.starMax3,
    settingsFields.starMax4
  ];
  liveSettingsFields.forEach((field) => field.addEventListener('input', () => {
    state.settings.theme = getCurrentThemeFromInputs();
    state.settings.courseName = settingsFields.courseName.value;
    state.settings.quizTitle = settingsFields.quizTitle.value;
    state.settings.totalMarks = Number(settingsFields.totalMarks.value || 15);
    state.settings.date = settingsFields.date.value;
    state.settings.feedbackEnabled = settingsFields.feedbackEnabled.checked;
    state.settings.starRuleMode = settingsFields.starRuleMode.value;
    state.settings.customStarRules = getCustomStarThresholds();
    state.settings.starRules = settingsFields.starRuleMode.value === 'custom' ? getCustomStarRules() : undefined;
    state.rows = state.rows.map((row) => calculateRowDetails(row));
    saveState();
    renderTable();
    renderPreview();
  }));
  settingsFields.feedbackEnabled.addEventListener('change', () => {
    state.settings.feedbackEnabled = settingsFields.feedbackEnabled.checked;
    saveState();
    renderPreview();
  });
  settingsFields.starRuleMode.addEventListener('change', () => {
    settingsFields.customStarRules.style.display = settingsFields.starRuleMode.value === 'custom' ? 'grid' : 'none';
    state.settings.starRuleMode = settingsFields.starRuleMode.value;
    state.settings.customStarRules = getCustomStarThresholds();
    state.settings.starRules = settingsFields.starRuleMode.value === 'custom' ? getCustomStarRules() : undefined;
    state.rows = state.rows.map((row) => calculateRowDetails(row));
    saveState();
    renderTable();
    renderPreview();
  });
}

async function init() {
  loadState();
  syncSettingsForm();
  attachEvents();
  await ensureFontsLoaded();
  renderTable();
  renderPreview();
}

init();
