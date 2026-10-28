export const DEFAULT_SETTINGS = {
  courseName: 'Python Programming Course',
  quizTitle: 'Quiz 1 Report',
  totalMarks: 15,
  date: '',
  feedbackEnabled: true,
  starRuleMode: 'default',
  language: 'English',
  teacherName: '',
  linkExpiryDays: 30,
  whatsappMessage: 'Assalam o Alaikum {first_name}! Here is your {quiz_title} result for {course}: {link}',
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
};

export const DEFAULT_STAR_RULES = [
  { maxPct: 20, stars: 1 },
  { maxPct: 40, stars: 2 },
  { maxPct: 60, stars: 3 },
  { maxPct: 80, stars: 4 },
  { maxPct: 100, stars: 5 }
];

export const FEEDBACK_FALLBACKS = {
  excellent: [
    'Outstanding work, {firstName}! Keep shining!',
    'Superb result, {firstName} — true Python star!'
  ],
  good: [
    'Great effort, {firstName}! Keep coding!',
    'Nice progress, {firstName} — aim higher next time!'
  ],
  practice: [
    'Keep practicing, {firstName} — you will get there!',
    'Every bug fixed makes you stronger, {firstName}!'
  ]
};
