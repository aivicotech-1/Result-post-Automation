const resultShell = document.getElementById('student-result-shell');
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (!token) {
  resultShell.innerHTML = '<h2>Link expired or missing.</h2><p>This result link is invalid or has expired.</p>';
} else {
  const url = `https://example.com/api/result?token=${encodeURIComponent(token)}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!data || !data.imageUrl) {
        resultShell.innerHTML = '<h2>Result not found.</h2><p>This student result could not be loaded.</p>';
        return;
      }

      resultShell.innerHTML = `
        <h2>${data.name}</h2>
        <img src="${data.imageUrl}" alt="${data.name} result post" style="max-width: 100%; border-radius: 20px; margin: 20px auto;" />
        <div class="preview-actions">
          <a class="btn btn-primary" href="${data.imageUrl}" download>Download</a>
          <button class="btn btn-secondary" type="button" onclick="navigator.share ? navigator.share({ title: 'Result Post', text: 'Check my result', url: window.location.href }) : window.open('${data.imageUrl}', '_blank')">Share</button>
        </div>
      `;
    })
    .catch(() => {
      resultShell.innerHTML = '<h2>Result not found.</h2><p>This student result could not be loaded.</p>';
    });
}
