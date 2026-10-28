export const state = {
  rows: [],
  selectedIndex: 0,
  settings: {
    courseName: 'Python Programming Course',
    quizTitle: 'Quiz 1 Report',
    totalMarks: 15,
    date: '',
    feedbackEnabled: true,
    language: 'English',
    teacherName: '',
    theme: {
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
    }
  },
  generated: [],
  isGenerating: false,
  currentStep: 0
};

export function saveState() {
  localStorage.setItem('skill2success-state', JSON.stringify({
    rows: state.rows,
    settings: state.settings,
    selectedIndex: state.selectedIndex,
    generated: state.generated
  }));
}

export function loadState() {
  const raw = localStorage.getItem('skill2success-state');
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (parsed.rows) state.rows = parsed.rows;
    if (parsed.settings) state.settings = { ...state.settings, ...parsed.settings };
    if (typeof parsed.selectedIndex === 'number') state.selectedIndex = parsed.selectedIndex;
    if (parsed.generated) state.generated = parsed.generated;
  } catch (error) {
    console.warn('Could not load saved state', error);
  }
}
