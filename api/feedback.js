export default async function handler(request) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const firstName = String(body.firstName || 'Student');
    const tier = String(body.tier || 'good');
    const lang = String(body.lang || 'English');

    const templates = {
      excellent: ['Outstanding work, {firstName}! Keep shining!', 'Superb result, {firstName} — true Python star!'],
      good: ['Great effort, {firstName}! Keep coding!', 'Nice progress, {firstName} — aim higher next time!'],
      practice: ['Keep practicing, {firstName} — you will get there!', 'Every bug fixed makes you stronger, {firstName}!']
    };

    const options = templates[tier] || templates.good;
    const message = options[Math.floor(Math.random() * options.length)].replace('{firstName}', firstName);

    return Response.json({
      message,
      language: lang,
      tier,
      status: 'ok'
    });
  } catch (error) {
    return Response.json({
      message: 'Great effort — keep coding!',
      status: 'fallback'
    });
  }
}
