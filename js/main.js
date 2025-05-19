function filterList() {
    const input = document.getElementById('inputField').value.toLowerCase();
    const items = document.querySelectorAll('#suggestionsList li');
    items.forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(input) ? '' : 'none';
    });
}

function toggleMode() {
    const body = document.body;
    const btn = document.getElementById('modeToggle');
    body.classList.toggle('dark');
    if (body.classList.contains('dark')) {
        btn.textContent = '☀️';
    } else {
        btn.textContent = '🌙';
    }
}

function toggleView() {
    const list = document.getElementById('suggestionsList');
    const btn = document.getElementById('viewToggle');
    if (list.classList.contains('list-view')) {
        list.classList.remove('list-view');
        list.classList.add('grid-view');
        btn.textContent = '☰';
    } else {
        list.classList.remove('grid-view');
        list.classList.add('list-view');
        btn.textContent = '⊞';
    }
}