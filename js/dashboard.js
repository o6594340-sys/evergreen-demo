const Dashboard = (() => {

  let currentUser = null;
  let projects    = [];

  /* ─── AUTH ──────────────────────────────────── */
  function init() {
    auth.onAuthStateChanged(user => {
      currentUser = user;
      if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-screen').classList.remove('hidden');
        document.getElementById('user-email').textContent = user.email;
        loadProjects();
      } else {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('dashboard-screen').classList.add('hidden');
      }
    });
  }

  async function login() {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl    = document.getElementById('login-error');
    errEl.classList.add('hidden');
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch(e) {
      errEl.textContent = e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password'
        ? 'Неверный email или пароль'
        : 'Ошибка входа. Попробуйте ещё раз.';
      errEl.classList.remove('hidden');
    }
  }

  async function register() {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl    = document.getElementById('login-error');
    errEl.classList.add('hidden');
    if (!email) { errEl.textContent = 'Введите email'; errEl.classList.remove('hidden'); return; }
    if (password.length < 6) { errEl.textContent = 'Пароль — минимум 6 символов'; errEl.classList.remove('hidden'); return; }
    try {
      await auth.createUserWithEmailAndPassword(email, password);
    } catch(e) {
      errEl.textContent = e.code === 'auth/email-already-in-use'
        ? 'Этот email уже зарегистрирован — войдите'
        : 'Ошибка регистрации.';
      errEl.classList.remove('hidden');
    }
  }

  function logout() {
    auth.signOut();
  }

  /* ─── PROJECTS ──────────────────────────────── */
  async function loadProjects() {
    const listEl = document.getElementById('projects-list');
    listEl.innerHTML = '<div class="loading">Загрузка проектов...</div>';
    try {
      const snap = await db.collection('projects')
        .where('ownerId', '==', currentUser.uid)
        .get();
      projects = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.created_at ? a.created_at.toMillis() : 0;
          const tb = b.created_at ? b.created_at.toMillis() : 0;
          return tb - ta;
        });
      renderProjects();
    } catch(e) {
      listEl.innerHTML = '<div class="loading">Ошибка загрузки. Обновите страницу.</div>';
      console.error(e);
    }
  }

  function renderProjects() {
    const listEl = document.getElementById('projects-list');
    if (!projects.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-text">Нет проектов</div>
          <div class="empty-sub">Создайте первый — нажмите «Новый проект»</div>
        </div>`;
      return;
    }
    listEl.innerHTML = projects.map(p => {
      const archived = p.status === 'archived';
      const meta     = p.meta || {};
      const created  = p.created_at ? new Date(p.created_at.toDate()).toLocaleDateString('ru') : '';
      const details  = [meta.dates, meta.location].filter(Boolean).join(' · ');
      return `
        <div class="project-card ${archived ? 'archived' : ''}">
          <div class="project-card-top">
            <div class="project-emoji">${meta.emoji || '📋'}</div>
            <div class="project-info">
              <div class="project-name">${p.name || 'Без названия'}</div>
              ${details ? `<div class="project-meta">${details}</div>` : ''}
              ${created ? `<div class="project-created">Создан: ${created}</div>` : ''}
            </div>
            <div class="project-badge ${archived ? 'badge-archived' : 'badge-active'}">
              ${archived ? 'Архив' : 'Активный'}
            </div>
          </div>
          <div class="project-actions">
            <a class="btn-card btn-card-primary" href="index.html?p=${p.id}" target="_blank">👁 Открыть</a>
            <a class="btn-card btn-card-secondary" href="admin.html?p=${p.id}" target="_blank">⚙️ Редактировать</a>
            <button class="btn-card btn-card-ghost" onclick="Dashboard.copyProject('${p.id}')">📋 Копия</button>
            <button class="btn-card btn-card-ghost" onclick="Dashboard.toggleArchive('${p.id}', ${archived})">
              ${archived ? '♻️ Восстановить' : '📦 Архив'}
            </button>
          </div>
        </div>`;
    }).join('');
  }

  async function createProject() {
    const name  = document.getElementById('new-project-name').value.trim();
    const emoji = document.getElementById('new-project-emoji').value.trim() || '📋';
    if (!name) { alert('Введите название'); return; }
    try {
      const ref = await db.collection('projects').add({
        ownerId:    currentUser.uid,
        name,
        status:     'active',
        meta:       { emoji, dates: '', location: '' },
        data:       { event: { title: name } },
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      });
      closeNewProjectModal();
      window.open('admin.html?p=' + ref.id, '_blank');
      loadProjects();
    } catch(e) {
      alert('Ошибка создания проекта');
      console.error(e);
    }
  }

  async function copyProject(id) {
    const src = projects.find(p => p.id === id);
    if (!src) return;
    if (!confirm(`Скопировать «${src.name}»?`)) return;
    try {
      await db.collection('projects').add({
        ownerId:    currentUser.uid,
        name:       (src.name || 'Без названия') + ' (копия)',
        status:     'active',
        meta:       { ...(src.meta || {}) },
        data:       JSON.parse(JSON.stringify(src.data || {})),
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      });
      loadProjects();
    } catch(e) {
      alert('Ошибка копирования');
      console.error(e);
    }
  }

  async function toggleArchive(id, isArchived) {
    try {
      await db.collection('projects').doc(id).update({
        status:     isArchived ? 'active' : 'archived',
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      });
      loadProjects();
    } catch(e) {
      alert('Ошибка');
      console.error(e);
    }
  }

  /* ─── MODAL ─────────────────────────────────── */
  function openNewProjectModal() {
    document.getElementById('modal-new-project').classList.remove('hidden');
    setTimeout(() => document.getElementById('new-project-name').focus(), 80);
  }
  function closeNewProjectModal() {
    document.getElementById('modal-new-project').classList.add('hidden');
    document.getElementById('new-project-name').value  = '';
    document.getElementById('new-project-emoji').value = '';
  }

  return { init, login, register, logout, copyProject, toggleArchive, openNewProjectModal, closeNewProjectModal, createProject };
})();

document.addEventListener('DOMContentLoaded', Dashboard.init);
