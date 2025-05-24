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
    const homeBtn = document.getElementById('homeIcon');

    if (homeBtn) {
        homeBtn.classList.toggle('dark');
        homeBtn.src = homeBtn.classList.contains('dark') ? './img/dark_home.png' : './img/assets/home.png';
    }

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

function openInIframe(event, url, icon, label) {
    event.preventDefault();
    document.getElementById('suggestionsList').style.display = 'none';
    document.querySelector('.search-bar').style.display = 'none';
    document.getElementById('iframeContainer').style.display = 'flex';
    document.getElementById('projectIframe').src = url;

    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = label;
}

function closeIframe() {
    document.getElementById('iframeContainer').style.display = 'none';
    document.getElementById('suggestionsList').style.display = '';
    document.querySelector('.search-bar').style.display = '';
    document.getElementById('projectIframe').src = '';

    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = "Sato's Hub";
}
