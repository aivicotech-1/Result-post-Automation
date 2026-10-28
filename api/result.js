export default async function handler(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 });
  }

  return Response.json({
    token,
    name: 'Hashir Usman',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    quizTitle: 'Quiz 1 Report',
    course: 'Python Programming Course'
  });
}
