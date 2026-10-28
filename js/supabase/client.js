export function getSupabaseConfig() {
  const url = window.localStorage.getItem('supabase_url') || '';
  const key = window.localStorage.getItem('supabase_anon_key') || '';
  return { url, key };
}

export function initSupabaseClient() {
  const { url, key } = getSupabaseConfig();
  if (!url || !key || !window.supabase) {
    return null;
  }

  return window.supabase.createClient(url, key);
}

export async function saveQuizSession(sessionData) {
  const client = initSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.from('quiz_sessions').insert([sessionData]).select();
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function saveStudentRecords(sessionId, students) {
  const client = initSupabaseClient();
  if (!client) return null;

  const payload = students.map((student) => ({
    session_id: sessionId,
    name: student.name,
    marks: student.marks,
    total_marks: student.total,
    roll_no: student.rollNo || student.roll_no || null,
    phone: student.phone || null,
    feedback: student.feedback || null,
    tier: student.tier || null,
    stars: student.stars || null,
    whatsapp_sent: Boolean(student.whatsappSent)
  }));

  const { data, error } = await client.from('students').insert(payload).select();
  if (error) throw error;
  return data;
}
