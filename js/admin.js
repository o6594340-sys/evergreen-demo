/* ═══════════════════════════════════════════
   Admin Panel Logic
   Пароль: evergreen2026
   Данные хранятся в localStorage — доступны
   на том же домене в index.html
═══════════════════════════════════════════ */

const Admin = (() => {

  const PASSWORD = 'evergreen2026';
  const _PID = new URLSearchParams(location.search).get('p'); // Firestore project ID

  const KEYS = {
    event:        'admin_event',
    days:         'admin_days',
    restaurants:  'admin_restaurants',
    announcement: 'admin_announcement',
    business:     'admin_business',
    hotel:        'admin_hotel',
    sights:       'admin_sights',
    cuisine:      'admin_cuisine',
    history:      'admin_history',
    typography:   'admin_typography',
    gradient:     'admin_gradient',
    cardStyle:    'admin_card_style',
    motion:       'admin_motion',
    brandKits:    'admin_brand_kits',
    transfers:    'admin_transfers',
    contacts:     'admin_contacts',
    memo:         'admin_memo',
    tabs:         'admin_tabs',
    bg:           'admin_bg',
    fontScale:    'admin_font_scale',
    dayTabStyle:  'admin_day_tab_style',
    splash:       'admin_splash',
    favicon:      'admin_favicon',
    whiteLabel:   'admin_white_label',
  };

  const SPLASH_ANIMS = [
    { id: 'fade',  icon: '◌',  name: 'Fade',  desc: 'Плавное появление' },
    { id: 'rise',  icon: '↑',  name: 'Rise',  desc: 'Выезд снизу'       },
    { id: 'pulse', icon: '◎',  name: 'Pulse', desc: 'Пульс и масштаб'   },
  ];

  const SPLASH_CONTENTS = [
    { id: 'logo',   label: 'Только лого'     },
    { id: 'title',  label: 'Лого + название' },
    { id: 'slogan', label: 'Лого + слоган'   },
  ];

  const DAY_TAB_STYLES = [
    { id: 'pills',     icon: '●●●', name: 'Пилюли',        desc: 'По умолчанию' },
    { id: 'underline', icon: '─ ─', name: 'Подчёркивание', desc: 'Минимализм'  },
    { id: 'bold',      icon: '1 2', name: 'Цифры',          desc: 'Крупный день' },
  ];

  const FONT_SCALES = [
    { value: 0.9, label: 'А−', desc: 'Компактный' },
    { value: 1.0, label: 'А',  desc: 'Стандартный' },
    { value: 1.1, label: 'А+', desc: 'Крупный' },
  ];

  const MOTION_STYLES = {
    swift:   { icon: '⚡', name: 'Swift',   desc: 'Быстрые функциональные переходы', spec: '0.25s ease' },
    elegant: { icon: '🎬', name: 'Elegant', desc: 'Плавные замедленные переходы',    spec: '0.4s expo-out' },
    minimal: { icon: '○',  name: 'Minimal', desc: 'Только появление, без движения',  spec: '0.15s fade' },
  };

  const CARD_STYLES = {
    elevated: { name: 'Elevated', mood: 'По умолчанию', previewClass: 'p-elevated' },
    flat:     { name: 'Flat',     mood: 'Минимализм',   previewClass: 'p-flat'     },
    glass:    { name: 'Glass',    mood: 'Стекло',       previewClass: 'p-glass'    },
    outlined: { name: 'Outlined', mood: 'Акцент-рамка', previewClass: 'p-outlined' },
  };

  const GRADIENT_RECIPES = {
    glow:     { name: 'Glow',     mood: 'По умолчанию' },
    diagonal: { name: 'Diagonal', mood: 'Диагональ ↗'  },
    vertical: { name: 'Vertical', mood: 'Глубина ↓'    },
    mesh:     { name: 'Mesh',     mood: 'Органичный'   },
    flat:     { name: 'Flat',     mood: 'Минимализм'   },
  };

  function shadeHex(hex, pct) {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.min(255, Math.max(0, (n >> 16) + pct));
    const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + pct));
    const b = Math.min(255, Math.max(0, (n & 0xff) + pct));
    return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
  }

  function gradientForRecipe(key, accent) {
    const dark   = shadeHex(accent, -40);
    const darker = shadeHex(accent, -60);
    const light  = shadeHex(accent, +50);
    switch (key) {
      case 'diagonal': return { header: `linear-gradient(135deg, ${accent} 0%, ${dark} 100%)`,   now: `linear-gradient(135deg, ${accent} 0%, ${dark} 100%)` };
      case 'vertical': return { header: `linear-gradient(180deg, ${accent} 0%, ${darker} 100%)`, now: `linear-gradient(180deg, ${accent} 0%, ${darker} 100%)` };
      case 'mesh':     return { header: `radial-gradient(ellipse at 20% 50%, ${light} 0%, ${accent} 55%, ${dark} 100%)`, now: `radial-gradient(ellipse at 30% 20%, ${light} 0%, ${accent} 50%, ${dark} 100%)` };
      case 'flat':     return { header: accent, now: accent };
      default:         return { header: accent, now: `linear-gradient(135deg, ${accent} 0%, ${dark} 100%)` };
    }
  }

  const FONT_PAIRS = {
    modern:    { name: 'Modern',    mood: 'Нейтральный',  dispLabel: 'Poppins',           bodyLabel: 'Inter',    disp: 'Poppins',            body: 'Inter',    url: null },
    executive: { name: 'Executive', mood: 'Люкс · банки', dispLabel: 'Playfair Display',  bodyLabel: 'Inter',    disp: 'Playfair Display',   body: 'Inter',    url: 'Playfair+Display:wght@600;700|Inter:wght@400;500;600;700' },
    editorial: { name: 'Editorial', mood: 'Премиум',      dispLabel: 'Cormorant',         bodyLabel: 'Jost',     disp: 'Cormorant Garamond', body: 'Jost',     url: 'Cormorant+Garamond:wght@600;700|Jost:wght@400;500;600' },
    friendly:  { name: 'Friendly',  mood: 'Тепло · MICE', dispLabel: 'Jakarta Sans',      bodyLabel: 'DM Sans',  disp: 'Plus Jakarta Sans',  body: 'DM Sans',  url: 'Plus+Jakarta+Sans:wght@600;700;800|DM+Sans:wght@400;500;600' },
    tech:      { name: 'Tech',      mood: 'IT-компании',  dispLabel: 'Space Grotesk',     bodyLabel: 'DM Sans',  disp: 'Space Grotesk',      body: 'DM Sans',  url: 'Space+Grotesk:wght@600;700|DM+Sans:wght@400;500;600' },
  };

  let state = {
    section:        'announcement',
    programDay:     0,
    historySection: 0,
    days:           null,
    restaurants:    null,
    event:          null,
    business:       null,
    hotel:          null,
    sights:         null,
    cuisine:        null,
    history:        null,
    transfers:      null,
    contacts:       null,
    memo:           null,
  };

  /* ─── AUTH ────────────────────────────── */
  async function login() {
    if (_PID && window.auth) {
      // Firebase auth for SaaS projects
      const email    = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-input').value;
      const errEl    = document.getElementById('auth-error');
      errEl.classList.add('hidden');
      try {
        await auth.signInWithEmailAndPassword(email, password);
        // auth state listener handles the rest
      } catch(e) {
        errEl.textContent = 'Неверный email или пароль';
        errEl.classList.remove('hidden');
      }
      return;
    }
    // Legacy password auth (no ?p= param)
    const val = document.getElementById('auth-input').value;
    if (val === PASSWORD) {
      document.getElementById('auth-screen').classList.add('hidden');
      document.getElementById('admin-panel').classList.remove('hidden');
      loadAll();
      showSection('announcement', document.querySelector('.nav-btn'));
    } else {
      document.getElementById('auth-error').classList.remove('hidden');
      document.getElementById('auth-input').value = '';
    }
  }

  function logout() {
    if (_PID && window.auth) auth.signOut();
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('auth-input').value  = '';
    document.getElementById('auth-email').value  = '';
  }

  /* ─── LOAD DATA ───────────────────────── */
  function loadAll() {
    state.days        = getStored(KEYS.days)        || JSON.parse(JSON.stringify(DAYS));
    state.restaurants = getStored(KEYS.restaurants) || JSON.parse(JSON.stringify(RESTAURANTS));
    state.event       = getStored(KEYS.event)       || JSON.parse(JSON.stringify(EVENT));
    state.business    = getStored(KEYS.business)    || JSON.parse(JSON.stringify(BUSINESS_SESSIONS));
    state.hotel       = getStored(KEYS.hotel)       || JSON.parse(JSON.stringify(HOTEL));
    state.sights      = getStored(KEYS.sights)      || JSON.parse(JSON.stringify(SIGHTS));
    state.cuisine     = getStored(KEYS.cuisine)     || JSON.parse(JSON.stringify(CUISINE));
    state.history     = getStored(KEYS.history)     || JSON.parse(JSON.stringify(HISTORY));
    state.transfers   = getStored(KEYS.transfers)   || JSON.parse(JSON.stringify(TRANSFERS));
    state.contacts    = getStored(KEYS.contacts)    || JSON.parse(JSON.stringify(CONTACTS));
    state.memo        = getStored(KEYS.memo)        || JSON.parse(JSON.stringify(MEMO));
    loadAnnouncementPreview();
    loadSettingsForm();
  }

  function getStored(key) {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch { return null; }
  }

  let _syncTimer = null;

  function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    if (_PID && window.db) {
      clearTimeout(_syncTimer);
      _syncTimer = setTimeout(syncToFirestore, 2000);
    }
  }

  async function syncToFirestore() {
    if (!_PID || !window.db || !window.auth || !auth.currentUser) return;
    const data = {};
    Object.values(KEYS).forEach(lsKey => {
      const k = lsKey.replace('admin_', '');
      const v = localStorage.getItem(lsKey);
      if (v) { try { data[k] = JSON.parse(v); } catch(e) {} }
    });
    const eventData = data.event || {};
    try {
      await db.collection('projects').doc(_PID).update({
        data,
        name:            eventData.title   || 'Без названия',
        'meta.dates':    eventData.dates   || '',
        'meta.location': eventData.location || '',
        updated_at:      firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch(e) { console.error('Firestore sync error:', e); }
  }

  async function loadFromFirestore() {
    if (!_PID || !window.db) return;
    try {
      const snap = await db.collection('projects').doc(_PID).get();
      if (!snap.exists) return;
      const data = snap.data().data || {};
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined) localStorage.setItem('admin_' + k, JSON.stringify(v));
      });
    } catch(e) { console.error('Firestore load error:', e); }
  }

  /* ─── NAVIGATION ──────────────────────── */
  function showSection(name, btn) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('section-' + name).classList.remove('hidden');
    if (btn) btn.classList.add('active');
    state.section = name;

    if (name === 'program')     renderProgramSection();
    if (name === 'templates')   renderTemplatesSection();
    if (name === 'business')    renderBusinessSection();
    if (name === 'hotel')       renderHotelSection();
    if (name === 'sights')      renderSightsSection();
    if (name === 'restaurants') renderRestaurantsSection();
    if (name === 'cuisine')     renderCuisineSection();
    if (name === 'history')     renderHistorySection();
    if (name === 'brandkits')   renderBrandKitsSection();
    if (name === 'ai-import')   loadAiSection();
    if (name === 'transfers')   renderTransfersSection();
    if (name === 'contacts')    renderContactsSection();
    if (name === 'memo')        renderMemoSection();
  }

  /* ─── SORTABLE ───────────────────────── */
  function initSortable(listId, onReorder) {
    const el = document.getElementById(listId);
    if (!el || typeof Sortable === 'undefined') return;
    if (el._sortable) el._sortable.destroy();
    el._sortable = Sortable.create(el, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd({ oldIndex, newIndex }) {
        if (oldIndex === newIndex) return;
        onReorder(oldIndex, newIndex);
        el.querySelectorAll('.list-item[data-index]').forEach((item, i) => {
          item.dataset.index = i;
        });
      },
    });
  }

  function reorderArr(arr, from, to) {
    arr.splice(to, 0, arr.splice(from, 1)[0]);
  }

  /* ─── TEMPLATES ──────────────────────── */
  function renderTemplatesSection() {
    const activeKey = localStorage.getItem('admin_template') || '';
    const grid = document.getElementById('template-grid');

    grid.innerHTML = Object.entries(TEMPLATES).map(([key, tpl]) => {
      const active = key === activeKey;
      return `
        <div class="template-card ${active ? 'active' : ''}" onclick="Admin.applyTemplate('${key}')"
          style="${active ? '--tpl-color:' + tpl.meta.color : ''}">
          <div class="template-flag">${tpl.meta.flag}</div>
          <div class="template-name">${tpl.meta.name}</div>
          <div class="template-desc">${tpl.meta.desc}</div>
          <div class="template-bar" style="background:${tpl.meta.color}"></div>
          ${active ? '<div class="template-badge">✓ Активен</div>' : ''}
        </div>
      `;
    }).join('');

    const activeInfo = document.getElementById('template-active');
    if (activeKey && TEMPLATES[activeKey]) {
      const tpl = TEMPLATES[activeKey];
      activeInfo.innerHTML = `
        <div class="template-hint">
          Сейчас загружен: <strong>${tpl.meta.flag} ${tpl.meta.name}</strong>.
          Чтобы сменить направление — нажмите на другую карточку.
        </div>
      `;
    } else {
      activeInfo.innerHTML = `<div class="template-hint">Шаблон не выбран. Нажмите на страну, чтобы загрузить данные.</div>`;
    }
  }

  function applyTemplate(key) {
    const tpl = TEMPLATES[key];
    if (!tpl) return;
    const current = localStorage.getItem('admin_template') || '';
    if (current === key) return;

    if (!confirm(`Загрузить шаблон «${tpl.meta.flag} ${tpl.meta.name}»?\n\nЭто перезапишет: историю, кухню, достопримечательности, рестораны и отель.\nПрограмма мероприятия и расписание останутся без изменений.`)) return;

    // Beijing reuses existing data.js constants
    const hotel       = tpl.hotel       || JSON.parse(JSON.stringify(HOTEL));
    const sights      = tpl.sights      || JSON.parse(JSON.stringify(SIGHTS));
    const restaurants = tpl.restaurants || JSON.parse(JSON.stringify(RESTAURANTS));
    const cuisine     = tpl.cuisine     || JSON.parse(JSON.stringify(CUISINE));
    const history     = tpl.history     || JSON.parse(JSON.stringify(HISTORY));

    // patch event: update location + brand, keep title/dates/wifi/organizer/emergency
    const currentEvent = getStored(KEYS.event) || JSON.parse(JSON.stringify(EVENT));
    const patchedEvent = {
      ...currentEvent,
      location: tpl.event.location,
      subtitle: tpl.event.subtitle,
      brand:    tpl.event.brand,
    };

    save(KEYS.event,       patchedEvent);
    save(KEYS.hotel,       hotel);
    save(KEYS.sights,      sights);
    save(KEYS.restaurants, restaurants);
    save(KEYS.cuisine,     cuisine);
    save(KEYS.history,     history);
    localStorage.setItem('admin_template', key);

    // reload state
    state.event       = patchedEvent;
    state.hotel       = hotel;
    state.sights      = sights;
    state.restaurants = restaurants;
    state.cuisine     = cuisine;
    state.history     = history;

    renderTemplatesSection();
    showToast(`${tpl.meta.flag} Шаблон «${tpl.meta.name}» загружен`);
  }

  /* ─── ANNOUNCEMENT ────────────────────── */
  function saveAnnouncement() {
    const text = document.getElementById('announcement-text').value.trim();
    const type = document.getElementById('announcement-type').value;
    if (!text) { clearAnnouncement(); return; }
    const data = { text, type, date: new Date().toLocaleString('ru') };
    save(KEYS.announcement, data);
    loadAnnouncementPreview();
    showToast('Объявление опубликовано');
  }

  function clearAnnouncement() {
    localStorage.removeItem(KEYS.announcement);
    document.getElementById('announcement-text').value = '';
    loadAnnouncementPreview();
    showToast('Объявление убрано');
  }

  function loadAnnouncementPreview() {
    const stored = getStored(KEYS.announcement);
    const box = document.getElementById('announcement-preview');
    if (stored) {
      const icons = { info: 'ℹ️', warning: '⚠️', success: '✅' };
      box.innerHTML = `
        <div class="preview-label">Сейчас показывается участникам:</div>
        <div class="announcement-banner ${stored.type}">
          ${icons[stored.type] || 'ℹ️'} ${stored.text}
          <div class="ann-date">Опубликовано: ${stored.date}</div>
        </div>
      `;
      document.getElementById('announcement-text').value = stored.text;
      document.getElementById('announcement-type').value = stored.type;
    } else {
      box.innerHTML = `<div class="preview-empty">Объявление не активно</div>`;
    }
  }

  /* ─── SETTINGS ────────────────────────── */
  function loadSettingsForm() {
    const e     = state.event;
    const brand = e.brand || {};
    const color  = brand.color  || '#C9353F';
    const color2 = brand.color2 || '#1A6B8A';

    document.getElementById('s-brand-color').value      = color;
    document.getElementById('s-brand-color-hex').value  = color;
    document.getElementById('s-brand-color2').value     = color2;
    document.getElementById('s-brand-color2-hex').value = color2;
    document.getElementById('s-brand-logo').value       = brand.logo || '';
    document.getElementById('s-title').value           = e.title             || '';
    document.getElementById('s-dates').value           = e.dates             || '';
    document.getElementById('s-location').value        = e.location          || '';
    document.getElementById('s-org-name').value        = e.organizer?.name   || '';
    document.getElementById('s-org-tg').value          = e.organizer?.telegram || '';
    document.getElementById('s-wifi-net').value        = e.wifi?.network     || '';
    document.getElementById('s-wifi-pass').value       = e.wifi?.password    || '';
    document.getElementById('s-hotel-name').value      = e.hotel?.name       || '';
    document.getElementById('s-hotel-phone').value     = e.hotel?.phone      || '';
    document.getElementById('s-emergency').value       = e.emergency         || '';
    document.getElementById('s-chat-tg').value        = e.chat?.telegram    || '';
    document.getElementById('s-chat-wa').value        = e.chat?.whatsapp    || '';
    renderMotionGrid();
    renderCardStyleGrid();
    renderGradientGrid();
    renderTypoGrid();
    renderFontScaleGrid();
    renderDayTabStyleGrid();
    renderSplashSettings();
    renderFaviconSettings();
    loadWhiteLabelToggle();
    renderBgPicker();
    updateBrandPreview();
    loadTabVisibility();
  }

  function _splashCfg() {
    const raw = localStorage.getItem(KEYS.splash);
    const def = { enabled: false, content: 'logo', slogan: '', animation: 'fade' };
    if (!raw) return def;
    try { return { ...def, ...JSON.parse(raw) }; } catch { return def; }
  }

  function _patchSplash(patch) {
    localStorage.setItem(KEYS.splash, JSON.stringify({ ..._splashCfg(), ...patch }));
  }

  function renderSplashSettings() {
    const cfg = _splashCfg();
    const toggle = document.getElementById('splash-enabled');
    if (toggle) toggle.checked = cfg.enabled;
    const opts = document.getElementById('splash-options');
    if (opts) opts.classList.toggle('hidden', !cfg.enabled);

    const cGrid = document.getElementById('splash-content-grid');
    if (cGrid) {
      cGrid.innerHTML = SPLASH_CONTENTS.map(c =>
        `<button class="splash-chip${c.id === cfg.content ? ' active' : ''}"
           onclick="Admin.selectSplashContent('${c.id}')">${c.label}</button>`
      ).join('');
    }
    const sg = document.getElementById('splash-slogan-group');
    if (sg) sg.classList.toggle('hidden', cfg.content !== 'slogan');
    const sf = document.getElementById('splash-slogan');
    if (sf) sf.value = cfg.slogan || '';

    const aGrid = document.getElementById('splash-anim-grid');
    if (aGrid) {
      aGrid.innerHTML = SPLASH_ANIMS.map(a =>
        `<div class="scale-card${a.id === cfg.animation ? ' active' : ''}">
           <span class="scale-card-letter" style="font-size:24px">${a.icon}</span>
           <span style="font-size:12px;font-weight:700;color:var(--text)">${a.name}</span>
           <span class="scale-card-desc">${a.desc}</span>
           <button class="splash-preview-btn" onclick="event.stopPropagation();Admin.previewSplashAnim('${a.id}')">▶ Посмотреть</button>
           ${a.id === cfg.animation ? '<span class="motion-card-check">✓</span>' : ''}
         </div>`
      ).join('');
    }
  }

  function toggleSplash() {
    _patchSplash({ enabled: document.getElementById('splash-enabled').checked });
    document.getElementById('splash-options').classList.toggle('hidden', !_splashCfg().enabled);
  }

  function selectSplashContent(id) {
    _patchSplash({ content: id });
    renderSplashSettings();
  }

  function selectSplashAnim(id) {
    _patchSplash({ animation: id });
    renderSplashSettings();
  }

  function previewSplashAnim(id) {
    _patchSplash({ animation: id });
    renderSplashSettings();
    setTimeout(previewSplash, 50);
  }

  function saveSplashSlogan() {
    _patchSplash({ slogan: document.getElementById('splash-slogan').value });
  }

  function previewSplash() {
    const cfg = _splashCfg();
    const e     = state.event;
    const brand = e.brand || {};
    const color = brand.color || '#C9353F';
    const dark  = shadeHex(color, -40);
    const bg    = `linear-gradient(135deg, ${color} 0%, ${dark} 100%)`;

    const logoHtml = brand.logo
      ? `<img class="splash-logo" src="${brand.logo}" alt="">`
      : `<div class="splash-emoji">${brand.logoEmoji || '✦'}</div>`;
    let textHtml = '';
    if (cfg.content === 'title')  textHtml = `<div class="splash-title">${e.title || ''}</div>`;
    if (cfg.content === 'slogan') textHtml = `<div class="splash-title">${cfg.slogan || e.title || ''}</div>`;

    // inject splash styles if needed (admin.html doesn't load main.css)
    if (!document.getElementById('splash-css')) {
      const s = document.createElement('style');
      s.id = 'splash-css';
      s.textContent = `.splash-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center}.splash-inner{display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center;padding:32px}.splash-logo{width:88px;height:88px;object-fit:contain;border-radius:20px;filter:drop-shadow(0 6px 24px rgba(0,0,0,.25))}.splash-emoji{font-size:80px;line-height:1}.splash-title{font-size:22px;font-weight:700;color:#fff;max-width:280px;line-height:1.3;text-shadow:0 2px 10px rgba(0,0,0,.2)}.splash-fade{animation:splFadeIn .5s ease forwards}.splash-fade.splash-exit{animation:splFadeOut .6s ease forwards}.splash-rise .splash-inner{animation:splRiseIn .55s cubic-bezier(.16,1,.3,1) forwards}.splash-rise.splash-exit{animation:splFadeOut .5s ease forwards}.splash-pulse{animation:splFadeIn .3s ease forwards}.splash-pulse .splash-inner{animation:splPulseIn .7s cubic-bezier(.34,1.56,.64,1) .1s both}.splash-pulse.splash-exit{animation:splFadeOut .55s ease forwards}@keyframes splFadeIn{from{opacity:0}to{opacity:1}}@keyframes splFadeOut{from{opacity:1}to{opacity:0}}@keyframes splRiseIn{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}@keyframes splPulseIn{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}`;
      document.head.appendChild(s);
    }

    const el = document.createElement('div');
    el.className = `splash-overlay splash-${cfg.animation}`;
    el.style.background = bg;
    el.innerHTML = `<div class="splash-inner">${logoHtml}${textHtml}</div>`;
    document.body.appendChild(el);
    setTimeout(() => { el.classList.add('splash-exit'); setTimeout(() => el.remove(), 700); }, 2000);
  }

  function loadWhiteLabelToggle() {
    const el = document.getElementById('white-label-toggle');
    if (el) el.checked = localStorage.getItem(KEYS.whiteLabel) === 'true';
  }

  function toggleWhiteLabel() {
    const checked = document.getElementById('white-label-toggle').checked;
    localStorage.setItem(KEYS.whiteLabel, checked ? 'true' : 'false');
  }

  function _faviconCfg() {
    const raw = localStorage.getItem(KEYS.favicon);
    const def = { mode: 'logo', emoji: '', url: '' };
    if (!raw) return def;
    try { return { ...def, ...JSON.parse(raw) }; } catch { return def; }
  }

  function renderFaviconSettings() {
    const cfg  = _faviconCfg();
    const modes = [
      { id: 'logo',  label: 'Логотип бренда' },
      { id: 'emoji', label: 'Emoji'           },
      { id: 'url',   label: 'Своё изображение' },
    ];
    const cGrid = document.getElementById('favicon-mode-grid');
    if (cGrid) {
      cGrid.innerHTML = modes.map(m =>
        `<button class="splash-chip${m.id === cfg.mode ? ' active' : ''}"
           onclick="Admin.selectFaviconMode('${m.id}')">${m.label}</button>`
      ).join('');
    }
    const eg = document.getElementById('favicon-emoji-group');
    const ug = document.getElementById('favicon-url-group');
    if (eg) eg.classList.toggle('hidden', cfg.mode !== 'emoji');
    if (ug) ug.classList.toggle('hidden', cfg.mode !== 'url');
    const ef = document.getElementById('favicon-emoji');
    const uf = document.getElementById('favicon-url');
    if (ef) ef.value = cfg.emoji || '';
    if (uf) uf.value = cfg.url   || '';
  }

  function selectFaviconMode(mode) {
    const cfg = { ..._faviconCfg(), mode };
    localStorage.setItem(KEYS.favicon, JSON.stringify(cfg));
    renderFaviconSettings();
  }

  function saveFaviconEmoji() {
    const cfg = { ..._faviconCfg(), emoji: document.getElementById('favicon-emoji').value.trim() };
    localStorage.setItem(KEYS.favicon, JSON.stringify(cfg));
  }

  function saveFaviconUrl() {
    const cfg = { ..._faviconCfg(), url: document.getElementById('favicon-url').value.trim() };
    localStorage.setItem(KEYS.favicon, JSON.stringify(cfg));
  }

  function renderDayTabStyleGrid() {
    const grid = document.getElementById('day-tab-style-grid');
    if (!grid) return;
    const saved = localStorage.getItem(KEYS.dayTabStyle) || 'pills';
    grid.innerHTML = DAY_TAB_STYLES.map(s =>
      `<div class="scale-card${s.id === saved ? ' active' : ''}" onclick="Admin.selectDayTabStyle('${s.id}')">
        <span class="scale-card-letter" style="font-size:16px;letter-spacing:2px">${s.icon}</span>
        <span style="font-size:12px;font-weight:700;color:var(--text)">${s.name}</span>
        <span class="scale-card-desc">${s.desc}</span>
        ${s.id === saved ? '<span class="motion-card-check">✓</span>' : ''}
      </div>`
    ).join('');
  }

  function selectDayTabStyle(id) {
    localStorage.setItem(KEYS.dayTabStyle, id);
    renderDayTabStyleGrid();
  }

  function renderFontScaleGrid() {
    const grid = document.getElementById('font-scale-grid');
    if (!grid) return;
    const saved = parseFloat(localStorage.getItem(KEYS.fontScale) || '1');
    grid.innerHTML = FONT_SCALES.map(s =>
      `<div class="scale-card${s.value === saved ? ' active' : ''}" onclick="Admin.selectFontScale(${s.value})">
        <span class="scale-card-letter" style="font-size:${14 + (s.value - 1) * 30}px">${s.label}</span>
        <span class="scale-card-desc">${s.desc}</span>
        ${s.value === saved ? '<span class="motion-card-check">✓</span>' : ''}
      </div>`
    ).join('');
  }

  function selectFontScale(val) {
    localStorage.setItem(KEYS.fontScale, val);
    renderFontScaleGrid();
  }

  function renderBgPicker() {
    const grid = document.getElementById('bg-preset-grid');
    if (!grid) return;
    const saved = +(localStorage.getItem(KEYS.bg) ?? '1');

    const swatch = (p, i) => {
      const styleStr = p.bg
        ? `background:${p.bg}`
        : `background-color:${p.bgColor||'#fff'};background-image:${p.bgImage||''};background-size:${p.bgSize||'auto'}`;
      const labelStyle = p.dark ? 'color:rgba(255,255,255,0.85);background:rgba(0,0,0,0.4)' : '';
      return `<div class="bg-swatch${i === saved ? ' selected' : ''}" onclick="Admin.selectBg(${i})" style="${styleStr}">
        <span class="bg-swatch-label" style="${labelStyle}">${p.label}</span>
      </div>`;
    };

    const lightHtml = BG_PRESETS.map((p, i) => p.dark ? '' : swatch(p, i)).join('');
    const darkHtml  = BG_PRESETS.map((p, i) => p.dark ? swatch(p, i) : '').join('');

    grid.innerHTML =
      `<div class="bg-group-label">Светлые</div>${lightHtml}` +
      `<div class="bg-group-label bg-group-sep">Тёмные</div>${darkHtml}`;

    applyBgPreview(saved);
  }

  function applyBgPreview(i) {
    const p = BG_PRESETS[i];
    if (!p) return;
    const main = document.querySelector('.admin-main');
    if (!main) return;
    main.style.background = '';
    main.style.backgroundImage = '';
    main.style.backgroundSize = '';
    main.style.backgroundColor = '';
    if (p.bg) {
      main.style.background = p.bg;
    } else {
      if (p.bgColor) main.style.backgroundColor = p.bgColor;
      if (p.bgImage) main.style.backgroundImage = p.bgImage;
      if (p.bgSize)  main.style.backgroundSize  = p.bgSize;
    }
  }

  function selectBg(i) {
    localStorage.setItem(KEYS.bg, JSON.stringify(i));
    renderBgPicker();
  }

  const TAB_IDS = ['transfers','hotel','sights','cuisine','history','memo','contacts'];

  function loadTabVisibility() {
    const vis = getStored(KEYS.tabs) || {};
    TAB_IDS.forEach(id => {
      const el = document.getElementById('tv-' + id);
      if (el) el.checked = vis[id] !== false;
    });
  }

  function renderMotionGrid() {
    const grid = document.getElementById('motion-grid');
    if (!grid) return;
    const current = localStorage.getItem(KEYS.motion) || 'swift';

    grid.innerHTML = Object.entries(MOTION_STYLES).map(([key, m]) => {
      const active = key === current;
      return `
        <div class="motion-card ${active ? 'active' : ''}" onclick="Admin.selectMotion('${key}')">
          ${active ? '<div class="motion-card-check">✓</div>' : ''}
          <div class="motion-card-icon">${m.icon}</div>
          <div class="motion-card-name">${m.name}</div>
          <div class="motion-card-desc">${m.desc}</div>
          <div class="motion-card-spec">${m.spec}</div>
        </div>`;
    }).join('');
  }

  function selectMotion(key) {
    if (!MOTION_STYLES[key]) return;
    localStorage.setItem(KEYS.motion, key);
    renderMotionGrid();
  }

  function renderCardStyleGrid() {
    const grid = document.getElementById('cardstyle-grid');
    if (!grid) return;
    const current = localStorage.getItem(KEYS.cardStyle) || 'elevated';

    grid.innerHTML = Object.entries(CARD_STYLES).map(([key, s]) => {
      const active = key === current;
      return `
        <div class="cardstyle-card ${active ? 'active' : ''}" onclick="Admin.selectCardStyle('${key}')">
          ${active ? '<div class="cardstyle-check">✓</div>' : ''}
          <div class="cardstyle-preview ${s.previewClass}">Программа</div>
          <div class="cardstyle-name">${s.name}</div>
          <div class="cardstyle-mood">${s.mood}</div>
        </div>`;
    }).join('');
  }

  function selectCardStyle(key) {
    if (!CARD_STYLES[key]) return;
    localStorage.setItem(KEYS.cardStyle, key);
    renderCardStyleGrid();
  }

  function renderGradientGrid() {
    const grid = document.getElementById('gradient-grid');
    if (!grid) return;
    const current = localStorage.getItem(KEYS.gradient) || 'glow';
    const accent  = state.event?.brand?.color || '#C9353F';

    grid.innerHTML = Object.entries(GRADIENT_RECIPES).map(([key, r]) => {
      const active = key === current;
      const grad   = gradientForRecipe(key, accent);
      return `
        <div class="grad-card ${active ? 'active' : ''}" onclick="Admin.selectGradient('${key}')">
          ${active ? '<div class="grad-card-check">✓</div>' : ''}
          <div class="grad-card-preview" style="background:${grad.now}"></div>
          <div class="grad-card-name">${r.name}</div>
          <div class="grad-card-mood">${r.mood}</div>
        </div>`;
    }).join('');
  }

  function selectGradient(key) {
    if (!GRADIENT_RECIPES[key]) return;
    localStorage.setItem(KEYS.gradient, key);
    renderGradientGrid();
    const accent = document.getElementById('s-brand-color').value || '#C9353F';
    const bar = document.getElementById('brand-preview-bar');
    if (bar) bar.style.background = gradientForRecipe(key, accent).header;
  }

  function renderTypoGrid() {
    const grid = document.getElementById('typo-grid');
    if (!grid) return;
    const current = localStorage.getItem(KEYS.typography) || 'modern';

    // preload all non-default fonts for preview
    Object.values(FONT_PAIRS).forEach(p => {
      if (p.url && !document.querySelector(`link[data-typo="${p.name}"]`)) {
        const lk = document.createElement('link');
        lk.rel = 'stylesheet';
        lk.dataset.typo = p.name;
        lk.href = `https://fonts.googleapis.com/css2?family=${p.url}&display=swap`;
        document.head.appendChild(lk);
      }
    });

    grid.innerHTML = Object.entries(FONT_PAIRS).map(([key, p]) => {
      const active = key === current;
      return `
        <div class="typo-card ${active ? 'active' : ''}" onclick="Admin.selectTypography('${key}')">
          ${active ? '<div class="typo-card-check">✓</div>' : ''}
          <div class="typo-card-sample-disp" style="font-family:'${p.disp}',serif">Aa</div>
          <div class="typo-card-sample-body" style="font-family:'${p.body}',sans-serif">Программа · 15:00</div>
          <div class="typo-card-name">${p.name}</div>
          <div class="typo-card-meta">${p.dispLabel} · ${p.bodyLabel}</div>
          <div class="typo-card-meta">${p.mood}</div>
        </div>`;
    }).join('');
  }

  function selectTypography(key) {
    if (!FONT_PAIRS[key]) return;
    localStorage.setItem(KEYS.typography, key);
    renderTypoGrid();
  }

  function updateBrandPreview() {
    const color    = document.getElementById('s-brand-color').value;
    const color2   = document.getElementById('s-brand-color2').value;
    const logo     = document.getElementById('s-brand-logo').value.trim();
    const title    = document.getElementById('s-title').value    || 'Название события';
    const dates    = document.getElementById('s-dates').value    || '';
    const location = document.getElementById('s-location').value || '';
    const bar      = document.getElementById('brand-preview-bar');
    const titleEl  = document.getElementById('brand-preview-title');
    const subEl    = document.getElementById('brand-preview-sub');
    const logoEl   = document.getElementById('brand-preview-logo');
    const dot1     = document.getElementById('brand-preview-dot1');
    const dot2     = document.getElementById('brand-preview-dot2');
    const gradKey  = localStorage.getItem(KEYS.gradient) || 'glow';
    if (bar)     bar.style.background    = gradientForRecipe(gradKey, color).header;
    if (titleEl) titleEl.textContent     = title;
    if (subEl)   subEl.textContent       = [dates, location].filter(Boolean).join(' · ');
    if (dot1)    dot1.style.background   = color;
    if (dot2)    dot2.style.background   = color2;
    if (logoEl) {
      if (logo) { logoEl.src = logo; logoEl.classList.remove('hidden'); }
      else      { logoEl.classList.add('hidden'); }
    }
  }

  // sync hex text ↔ color picker (primary)
  function onBrandColorPicker(val) {
    document.getElementById('s-brand-color-hex').value = val;
    updateBrandPreview();
  }
  function onBrandColorHex(val) {
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      document.getElementById('s-brand-color').value = val;
      updateBrandPreview();
    }
  }

  // sync hex text ↔ color picker (secondary)
  function onBrandColor2Picker(val) {
    document.getElementById('s-brand-color2-hex').value = val;
    updateBrandPreview();
  }
  function onBrandColor2Hex(val) {
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      document.getElementById('s-brand-color2').value = val;
      updateBrandPreview();
    }
  }

  function saveSettings() {
    state.event = {
      ...state.event,
      brand: {
        color:  document.getElementById('s-brand-color').value,
        color2: document.getElementById('s-brand-color2').value,
        logo:   document.getElementById('s-brand-logo').value.trim(),
      },
      title:    document.getElementById('s-title').value,
      dates:    document.getElementById('s-dates').value,
      location: document.getElementById('s-location').value,
      organizer: {
        name:     document.getElementById('s-org-name').value,
        telegram: document.getElementById('s-org-tg').value,
      },
      wifi: {
        network:  document.getElementById('s-wifi-net').value,
        password: document.getElementById('s-wifi-pass').value,
      },
      hotel: {
        ...state.event.hotel,
        name:  document.getElementById('s-hotel-name').value,
        phone: document.getElementById('s-hotel-phone').value,
      },
      emergency: document.getElementById('s-emergency').value,
      chat: {
        telegram: document.getElementById('s-chat-tg').value.trim(),
        whatsapp: document.getElementById('s-chat-wa').value.trim(),
      },
    };
    save(KEYS.event, state.event);

    const vis = {};
    TAB_IDS.forEach(id => {
      const el = document.getElementById('tv-' + id);
      if (el) vis[id] = el.checked;
    });
    save(KEYS.tabs, vis);

    const hint = document.getElementById('settings-saved');
    hint.classList.remove('hidden');
    setTimeout(() => hint.classList.add('hidden'), 2500);
  }

  /* ─── PROGRAM ─────────────────────────── */
  function renderProgramSection() {
    const selector = document.getElementById('day-selector');
    selector.innerHTML = state.days.map((d, i) => `
      <button class="day-pill ${i === state.programDay ? 'active' : ''}"
        style="${i === state.programDay ? 'background:' + d.color : ''}"
        onclick="Admin.selectProgramDay(${i})">${d.label}</button>
    `).join('');
    renderActivityList();
  }

  function selectProgramDay(i) {
    state.programDay = i;
    renderProgramSection();
  }

  function renderActivityList() {
    const day  = state.days[state.programDay];
    const list = document.getElementById('program-list');
    if (!day.activities.length) {
      list.innerHTML = `<div class="empty-state">Активностей нет. Добавьте первую.</div>`;
      return;
    }
    list.innerHTML = day.activities.map((a, i) => `
      <div class="list-item" onclick="Admin.openActivityModal(${i})">
        <div class="list-item-left">
          <span class="list-time">${a.time}</span>
          <div>
            <div class="list-title">${a.title}</div>
            <div class="list-sub">📍 ${a.location}${a.note ? ' · ' + a.note : ''}</div>
          </div>
        </div>
        <span class="list-edit">✏️</span>
      </div>
    `).join('');
  }

  function openActivityModal(index) {
    const isNew = index === null;
    const a = isNew ? { time: '', title: '', location: '', type: 'business', note: '' }
                    : state.days[state.programDay].activities[index];

    document.getElementById('activity-modal-title').textContent = isNew ? 'Добавить активность' : 'Редактировать';
    document.getElementById('a-index').value    = isNew ? '' : index;
    document.getElementById('a-time').value     = a.time     || '';
    document.getElementById('a-title').value    = a.title    || '';
    document.getElementById('a-location').value = a.location || '';
    document.getElementById('a-type').value     = a.type     || 'business';
    document.getElementById('a-note').value     = a.note     || '';
    document.getElementById('a-delete-btn').style.display = isNew ? 'none' : 'inline-block';
    openModal('modal-activity');
  }

  function saveActivity() {
    const idx   = document.getElementById('a-index').value;
    const isNew = idx === '';
    const activity = {
      time:     document.getElementById('a-time').value.trim(),
      title:    document.getElementById('a-title').value.trim(),
      location: document.getElementById('a-location').value.trim(),
      type:     document.getElementById('a-type').value,
      note:     document.getElementById('a-note').value.trim() || undefined,
    };
    if (!activity.title || !activity.time) { alert('Заполните время и название'); return; }

    const acts = state.days[state.programDay].activities;
    if (isNew) acts.push(activity);
    else       acts[parseInt(idx)] = activity;

    save(KEYS.days, state.days);
    closeModal('modal-activity');
    renderActivityList();
    showToast('Сохранено');
  }

  function deleteActivity() {
    const idx = parseInt(document.getElementById('a-index').value);
    state.days[state.programDay].activities.splice(idx, 1);
    save(KEYS.days, state.days);
    closeModal('modal-activity');
    renderActivityList();
    showToast('Удалено');
  }

  /* ─── BUSINESS SESSIONS ───────────────── */
  const TRACK_LABELS = { '': 'Пленарная', A: 'Трек A', B: 'Трек B', C: 'Трек C' };
  const TRACK_COLORS = { '': '#6B7280', A: '#C9353F', B: '#2563EB', C: '#16A34A' };

  function renderBusinessSection() {
    const list = document.getElementById('business-list');
    if (!state.business.length) {
      list.innerHTML = `<div class="empty-state">Сессий нет. Добавьте первую.</div>`;
      return;
    }
    list.innerHTML = state.business.map((s, i) => {
      const trackColor = TRACK_COLORS[s.track || ''] || '#6B7280';
      const trackLabel = TRACK_LABELS[s.track || ''] || s.track;
      return `
        <div class="list-item" data-index="${i}" onclick="Admin.openBusinessModal(+this.dataset.index)">
          <span class="drag-handle">⠿</span>
          <div class="list-item-left">
            <span class="list-time">${s.time}</span>
            <div>
              <div class="list-title">${s.title}</div>
              <div class="list-sub">
                <span style="color:${trackColor};font-weight:700">${trackLabel}</span>
                · ${s.day} · ${s.room || ''}
              </div>
            </div>
          </div>
          <span class="list-edit">✏️</span>
        </div>
      `;
    }).join('');
    initSortable('business-list', (from, to) => {
      reorderArr(state.business, from, to);
      save(KEYS.business, state.business);
      showToast('Порядок сохранён');
    });
  }

  function openBusinessModal(index) {
    const isNew = index === null;
    const s = isNew
      ? { day: 'День 2', time: '', duration: '', track: '', title: '', room: '', speakers: [], desc: '' }
      : state.business[index];

    document.getElementById('business-modal-title').textContent = isNew ? 'Добавить сессию' : 'Редактировать';
    document.getElementById('b-index').value    = isNew ? '' : index;
    document.getElementById('b-day').value      = s.day      || 'День 2';
    document.getElementById('b-time').value     = s.time     || '';
    document.getElementById('b-duration').value = s.duration || '';
    document.getElementById('b-track').value    = s.track    || '';
    document.getElementById('b-title').value    = s.title    || '';
    document.getElementById('b-room').value     = s.room     || '';
    document.getElementById('b-speakers').value = (s.speakers || []).join('\n');
    document.getElementById('b-desc').value     = s.desc     || '';
    document.getElementById('b-delete-btn').style.display = isNew ? 'none' : 'inline-block';
    openModal('modal-business');
  }

  function saveBusiness() {
    const idx   = document.getElementById('b-index').value;
    const isNew = idx === '';
    const speakersRaw = document.getElementById('b-speakers').value.trim();
    const session = {
      id:       isNew ? 'b' + Date.now() : state.business[parseInt(idx)].id,
      day:      document.getElementById('b-day').value,
      time:     document.getElementById('b-time').value.trim(),
      duration: document.getElementById('b-duration').value.trim(),
      track:    document.getElementById('b-track').value,
      title:    document.getElementById('b-title').value.trim(),
      room:     document.getElementById('b-room').value.trim(),
      speakers: speakersRaw ? speakersRaw.split('\n').map(l => l.trim()).filter(Boolean) : [],
      desc:     document.getElementById('b-desc').value.trim(),
    };
    if (!session.title) { alert('Введите название сессии'); return; }

    if (isNew) state.business.push(session);
    else       state.business[parseInt(idx)] = session;

    save(KEYS.business, state.business);
    closeModal('modal-business');
    renderBusinessSection();
    showToast('Сохранено');
  }

  function deleteBusiness() {
    const idx = parseInt(document.getElementById('b-index').value);
    state.business.splice(idx, 1);
    save(KEYS.business, state.business);
    closeModal('modal-business');
    renderBusinessSection();
    showToast('Удалено');
  }

  /* ─── HOTEL ──────────────────────────── */
  function renderHotelSection() {
    const h = state.hotel;
    document.getElementById('h-name').value      = h.name      || '';
    document.getElementById('h-name-cn').value   = h.nameCn    || '';
    document.getElementById('h-phone').value     = h.phone     || '';
    document.getElementById('h-metro').value     = h.metro     || '';
    document.getElementById('h-checkin').value   = h.checkin   || '';
    document.getElementById('h-checkout').value  = h.checkout  || '';
    document.getElementById('h-breakfast').value = h.breakfast || '';
    document.getElementById('h-address').value   = h.address   || '';
    document.getElementById('h-address-cn').value= h.addressCn || '';
    document.getElementById('h-desc').value      = h.desc      || '';
    document.getElementById('h-image').value     = h.image     || '';
    showImgThumb('h-image', h.image || '');
    document.getElementById('h-tips').value      = (h.tips || []).join('\n');
    renderHotelAmenities();
  }

  function renderHotelAmenities() {
    const list = document.getElementById('hotel-amenities-list');
    const amenities = state.hotel.amenities || [];
    if (!amenities.length) {
      list.innerHTML = `<div class="empty-state">Удобств нет. Добавьте первое.</div>`;
      return;
    }
    list.innerHTML = amenities.map((a, i) => `
      <div class="list-item" onclick="Admin.openAmenityModal(${i})">
        <div class="list-item-left">
          <span style="font-size:22px">${a.icon}</span>
          <div>
            <div class="list-title">${a.title}</div>
            <div class="list-sub">${a.note}</div>
          </div>
        </div>
        <span class="list-edit">✏️</span>
      </div>
    `).join('');
  }

  function saveHotel() {
    const tipsRaw = document.getElementById('h-tips').value.trim();
    state.hotel = {
      ...state.hotel,
      name:      document.getElementById('h-name').value.trim(),
      nameCn:    document.getElementById('h-name-cn').value.trim(),
      phone:     document.getElementById('h-phone').value.trim(),
      metro:     document.getElementById('h-metro').value.trim(),
      checkin:   document.getElementById('h-checkin').value.trim(),
      checkout:  document.getElementById('h-checkout').value.trim(),
      breakfast: document.getElementById('h-breakfast').value.trim(),
      address:   document.getElementById('h-address').value.trim(),
      addressCn: document.getElementById('h-address-cn').value.trim(),
      desc:      document.getElementById('h-desc').value.trim(),
      image:     document.getElementById('h-image').value.trim() || state.hotel.image,
      tips:      tipsRaw ? tipsRaw.split('\n').map(l => l.trim()).filter(Boolean) : [],
    };
    save(KEYS.hotel, state.hotel);
    const hint = document.getElementById('hotel-saved');
    hint.classList.remove('hidden');
    setTimeout(() => hint.classList.add('hidden'), 2500);
  }

  function openAmenityModal(index) {
    const isNew = index === null;
    const used  = (state.hotel.amenities || []).map(a => a.icon);
    const a = isNew
      ? { icon: pickUniqueEmoji('amenities', used), title: '', note: '' }
      : (state.hotel.amenities || [])[index];

    document.getElementById('amenity-modal-title').textContent = isNew ? 'Добавить удобство' : 'Редактировать';
    document.getElementById('am-index').value = isNew ? '' : index;
    document.getElementById('am-title').value = a.title || '';
    document.getElementById('am-note').value  = a.note  || '';
    document.getElementById('am-delete-btn').style.display = isNew ? 'none' : 'inline-block';
    renderEmojiPicker('am-icon-grid', 'am-icon', 'amenities', a.icon);
    openModal('modal-amenity');
  }

  function saveAmenity() {
    const idx   = document.getElementById('am-index').value;
    const isNew = idx === '';
    const amenity = {
      icon:  document.getElementById('am-icon').value.trim() || '✅',
      title: document.getElementById('am-title').value.trim(),
      note:  document.getElementById('am-note').value.trim(),
    };
    if (!amenity.title) { alert('Введите название'); return; }

    if (!state.hotel.amenities) state.hotel.amenities = [];
    if (isNew) state.hotel.amenities.push(amenity);
    else       state.hotel.amenities[parseInt(idx)] = amenity;

    save(KEYS.hotel, state.hotel);
    closeModal('modal-amenity');
    renderHotelAmenities();
    showToast('Сохранено');
  }

  function deleteAmenity() {
    const idx = parseInt(document.getElementById('am-index').value);
    state.hotel.amenities.splice(idx, 1);
    save(KEYS.hotel, state.hotel);
    closeModal('modal-amenity');
    renderHotelAmenities();
    showToast('Удалено');
  }

  /* ─── SIGHTS ──────────────────────────── */
  function renderSightsSection() {
    const list = document.getElementById('sights-list');
    if (!state.sights.length) {
      list.innerHTML = `<div class="empty-state">Мест нет. Добавьте первое.</div>`;
      return;
    }
    list.innerHTML = state.sights.map((s, i) => `
      <div class="list-item" data-index="${i}" onclick="Admin.openSightModal(+this.dataset.index)">
        <span class="drag-handle">⠿</span>
        <div class="list-item-left">
          <span style="font-size:22px">${s.emoji}</span>
          <div>
            <div class="list-title">${s.title}</div>
            <div class="list-sub">${s.sub || ''} · ${s.distance || ''}</div>
          </div>
        </div>
        <span class="list-edit">✏️</span>
      </div>
    `).join('');
    initSortable('sights-list', (from, to) => {
      reorderArr(state.sights, from, to);
      save(KEYS.sights, state.sights);
      showToast('Порядок сохранён');
    });
  }

  function openSightModal(index) {
    const isNew = index === null;
    const used  = state.sights.map(s => s.emoji);
    const s = isNew
      ? { title: '', emoji: pickUniqueEmoji('sights', used), sub: '', distance: '', hours: '', price: '', tags: [], desc: '', tip: '', image: '' }
      : state.sights[index];

    document.getElementById('sight-modal-title').textContent = isNew ? 'Добавить место' : 'Редактировать';
    document.getElementById('si-index').value    = isNew ? '' : index;
    document.getElementById('si-title').value    = s.title    || '';
    document.getElementById('si-emoji').value    = s.emoji    || '🏛';
    document.getElementById('si-sub').value      = s.sub      || '';
    document.getElementById('si-distance').value = s.distance || '';
    document.getElementById('si-hours').value    = s.hours    || '';
    document.getElementById('si-price').value    = s.price    || '';
    document.getElementById('si-tags').value     = (s.tags || []).join(', ');
    document.getElementById('si-desc').value     = s.desc     || '';
    document.getElementById('si-tip').value      = s.tip      || '';
    document.getElementById('si-image').value    = s.image    || '';
    showImgThumb('si-image', s.image || '');
    document.getElementById('si-delete-btn').style.display = isNew ? 'none' : 'inline-block';
    renderEmojiPicker('si-emoji-grid', 'si-emoji', 'sights', s.emoji);
    openModal('modal-sight');
  }

  function saveSight() {
    const idx   = document.getElementById('si-index').value;
    const isNew = idx === '';
    const tagsRaw = document.getElementById('si-tags').value.trim();
    const sight = {
      id:       isNew ? 's' + Date.now() : state.sights[parseInt(idx)].id,
      title:    document.getElementById('si-title').value.trim(),
      emoji:    document.getElementById('si-emoji').value.trim() || '🏛',
      sub:      document.getElementById('si-sub').value.trim(),
      distance: document.getElementById('si-distance').value.trim(),
      hours:    document.getElementById('si-hours').value.trim(),
      price:    document.getElementById('si-price').value.trim(),
      tags:     tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
      desc:     document.getElementById('si-desc').value.trim(),
      tip:      document.getElementById('si-tip').value.trim(),
      image:    document.getElementById('si-image').value.trim() ||
                'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=700&q=80',
    };
    if (!sight.title) { alert('Введите название'); return; }

    if (isNew) state.sights.push(sight);
    else       state.sights[parseInt(idx)] = sight;

    save(KEYS.sights, state.sights);
    closeModal('modal-sight');
    renderSightsSection();
    showToast('Сохранено');
  }

  function deleteSight() {
    const idx = parseInt(document.getElementById('si-index').value);
    state.sights.splice(idx, 1);
    save(KEYS.sights, state.sights);
    closeModal('modal-sight');
    renderSightsSection();
    showToast('Удалено');
  }

  /* ─── RESTAURANTS ─────────────────────── */
  function renderRestaurantsSection() {
    const list = document.getElementById('restaurants-list');
    if (!state.restaurants.length) {
      list.innerHTML = `<div class="empty-state">Ресторанов нет. Добавьте первый.</div>`;
      return;
    }
    list.innerHTML = state.restaurants.map((r, i) => `
      <div class="list-item" data-index="${i}" onclick="Admin.openRestaurantModal(+this.dataset.index)">
        <span class="drag-handle">⠿</span>
        <div class="list-item-left">
          <span style="font-size:22px">${r.emoji}</span>
          <div>
            <div class="list-title">${r.title}</div>
            <div class="list-sub">${r.cuisine} · ${r.price} · ${r.type === 'program' ? 'По программе' : 'Самостоятельно'}</div>
          </div>
        </div>
        <span class="list-edit">✏️</span>
      </div>
    `).join('');
    initSortable('restaurants-list', (from, to) => {
      reorderArr(state.restaurants, from, to);
      save(KEYS.restaurants, state.restaurants);
      showToast('Порядок сохранён');
    });
  }

  function openRestaurantModal(index) {
    const isNew = index === null;
    const used  = state.restaurants.map(r => r.emoji);
    const r = isNew
      ? { title: '', emoji: pickUniqueEmoji('restaurants', used), cuisine: '', price: '¥¥', type: 'free', metro: '', hours: '', address: '', note: '', desc: '', image: '' }
      : state.restaurants[index];

    document.getElementById('restaurant-modal-title').textContent = isNew ? 'Добавить ресторан' : 'Редактировать';
    document.getElementById('r-index').value   = isNew ? '' : index;
    document.getElementById('r-title').value   = r.title   || '';
    document.getElementById('r-emoji').value   = r.emoji   || '🍜';
    document.getElementById('r-cuisine').value = r.cuisine || '';
    document.getElementById('r-price').value   = r.price   || '¥¥';
    document.getElementById('r-type').value    = r.type    || 'free';
    document.getElementById('r-metro').value   = r.metro   || '';
    document.getElementById('r-hours').value   = r.hours   || '';
    document.getElementById('r-address').value = r.address || '';
    document.getElementById('r-note').value    = r.note    || '';
    document.getElementById('r-desc').value    = r.desc    || '';
    document.getElementById('r-image').value   = r.image   || '';
    showImgThumb('r-image', r.image || '');
    document.getElementById('r-delete-btn').style.display = isNew ? 'none' : 'inline-block';
    renderEmojiPicker('r-emoji-grid', 'r-emoji', 'restaurants', r.emoji);
    openModal('modal-restaurant');
  }

  function saveRestaurant() {
    const idx   = document.getElementById('r-index').value;
    const isNew = idx === '';
    const rest = {
      id:      isNew ? 'r' + Date.now() : state.restaurants[parseInt(idx)].id,
      title:   document.getElementById('r-title').value.trim(),
      emoji:   document.getElementById('r-emoji').value.trim() || '🍜',
      cuisine: document.getElementById('r-cuisine').value.trim(),
      price:   document.getElementById('r-price').value,
      type:    document.getElementById('r-type').value,
      metro:   document.getElementById('r-metro').value.trim(),
      hours:   document.getElementById('r-hours').value.trim(),
      address: document.getElementById('r-address').value.trim(),
      note:    document.getElementById('r-note').value.trim(),
      desc:    document.getElementById('r-desc').value.trim(),
      image:   document.getElementById('r-image').value.trim() ||
               'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80',
    };
    if (!rest.title) { alert('Введите название'); return; }

    if (isNew) state.restaurants.push(rest);
    else       state.restaurants[parseInt(idx)] = rest;

    save(KEYS.restaurants, state.restaurants);
    closeModal('modal-restaurant');
    renderRestaurantsSection();
    showToast('Сохранено');
  }

  function deleteRestaurant() {
    const idx = parseInt(document.getElementById('r-index').value);
    state.restaurants.splice(idx, 1);
    save(KEYS.restaurants, state.restaurants);
    closeModal('modal-restaurant');
    renderRestaurantsSection();
    showToast('Удалено');
  }

  /* ─── CUISINE ─────────────────────────── */
  function renderCuisineSection() {
    const list = document.getElementById('cuisine-list');
    if (!state.cuisine.length) {
      list.innerHTML = `<div class="empty-state">Блюд нет. Добавьте первое.</div>`;
      return;
    }
    list.innerHTML = state.cuisine.map((d, i) => `
      <div class="list-item" data-index="${i}" onclick="Admin.openCuisineModal(+this.dataset.index)">
        <span class="drag-handle">⠿</span>
        <div class="list-item-left">
          <span style="font-size:22px">${d.emoji}</span>
          <div>
            <div class="list-title">${d.title} ${d.must ? '<span style="color:#C9353F;font-size:11px;font-weight:700">МАСТ</span>' : ''}</div>
            <div class="list-sub">${d.cn || ''} · ${d.price || ''}</div>
          </div>
        </div>
        <span class="list-edit">✏️</span>
      </div>
    `).join('');
    initSortable('cuisine-list', (from, to) => {
      reorderArr(state.cuisine, from, to);
      save(KEYS.cuisine, state.cuisine);
      showToast('Порядок сохранён');
    });
  }

  function openCuisineModal(index) {
    const isNew = index === null;
    const used  = state.cuisine.map(d => d.emoji);
    const d = isNew
      ? { title: '', emoji: pickUniqueEmoji('cuisine', used), cn: '', price: '', where: '', desc: '', must: false }
      : state.cuisine[index];

    document.getElementById('cuisine-modal-title').textContent = isNew ? 'Добавить блюдо' : 'Редактировать';
    document.getElementById('c-index').value = isNew ? '' : index;
    document.getElementById('c-title').value = d.title || '';
    document.getElementById('c-emoji').value = d.emoji || '🥢';
    document.getElementById('c-cn').value    = d.cn    || '';
    document.getElementById('c-price').value = d.price || '';
    document.getElementById('c-where').value = d.where || '';
    document.getElementById('c-desc').value  = d.desc  || '';
    document.getElementById('c-must').checked = !!d.must;
    document.getElementById('c-delete-btn').style.display = isNew ? 'none' : 'inline-block';
    renderEmojiPicker('c-emoji-grid', 'c-emoji', 'cuisine', d.emoji);
    openModal('modal-cuisine');
  }

  function saveCuisine() {
    const idx   = document.getElementById('c-index').value;
    const isNew = idx === '';
    const dish = {
      id:    isNew ? 'c' + Date.now() : state.cuisine[parseInt(idx)].id,
      title: document.getElementById('c-title').value.trim(),
      emoji: document.getElementById('c-emoji').value.trim() || '🥢',
      cn:    document.getElementById('c-cn').value.trim(),
      price: document.getElementById('c-price').value.trim(),
      where: document.getElementById('c-where').value.trim(),
      desc:  document.getElementById('c-desc').value.trim(),
      must:  document.getElementById('c-must').checked,
    };
    if (!dish.title) { alert('Введите название блюда'); return; }

    if (isNew) state.cuisine.push(dish);
    else       state.cuisine[parseInt(idx)] = dish;

    save(KEYS.cuisine, state.cuisine);
    closeModal('modal-cuisine');
    renderCuisineSection();
    showToast('Сохранено');
  }

  function deleteCuisine() {
    const idx = parseInt(document.getElementById('c-index').value);
    state.cuisine.splice(idx, 1);
    save(KEYS.cuisine, state.cuisine);
    closeModal('modal-cuisine');
    renderCuisineSection();
    showToast('Удалено');
  }

  /* ─── HISTORY ─────────────────────────── */
  function renderHistorySection() {
    const selector = document.getElementById('history-section-selector');
    selector.innerHTML = state.history.map((sec, i) => `
      <button class="day-pill ${i === state.historySection ? 'active' : ''}"
        style="${i === state.historySection ? 'background:#C9353F' : ''}"
        onclick="Admin.selectHistorySection(${i})">${sec.emoji} ${sec.section}</button>
    `).join('');
    renderHistoryList();
  }

  function selectHistorySection(i) {
    state.historySection = i;
    renderHistorySection();
  }

  function renderHistoryList() {
    const sec  = state.history[state.historySection];
    const list = document.getElementById('history-list');
    if (!sec.facts.length) {
      list.innerHTML = `<div class="empty-state">Фактов нет. Добавьте первый.</div>`;
      return;
    }
    list.innerHTML = sec.facts.map((f, i) => `
      <div class="list-item" onclick="Admin.openHistoryModal(${i})">
        <div class="list-item-left">
          <span style="font-size:20px">${f.wow ? '🤯' : '📌'}</span>
          <div>
            <div class="list-title">${f.title}</div>
            <div class="list-sub">${(f.text || '').slice(0, 60)}${f.text && f.text.length > 60 ? '…' : ''}</div>
          </div>
        </div>
        <span class="list-edit">✏️</span>
      </div>
    `).join('');
  }

  function openHistoryModal(index) {
    const isNew = index === null;
    const f = isNew
      ? { title: '', text: '', wow: false }
      : state.history[state.historySection].facts[index];

    // populate section dropdown
    const sel = document.getElementById('h-section-select');
    sel.innerHTML = state.history.map((sec, i) => `
      <option value="${i}" ${i === state.historySection ? 'selected' : ''}>${sec.emoji} ${sec.section}</option>
    `).join('');

    document.getElementById('history-modal-title').textContent = isNew ? 'Добавить факт' : 'Редактировать';
    document.getElementById('h-index').value         = isNew ? '' : index;
    document.getElementById('h-section-index').value = state.historySection;
    document.getElementById('h-title').value = f.title || '';
    document.getElementById('h-text').value  = f.text  || '';
    document.getElementById('h-wow').checked = !!f.wow;
    document.getElementById('h-delete-btn').style.display = isNew ? 'none' : 'inline-block';
    openModal('modal-history');
  }

  function saveHistory() {
    const idx        = document.getElementById('h-index').value;
    const isNew      = idx === '';
    const fromSec    = parseInt(document.getElementById('h-section-index').value);
    const toSec      = parseInt(document.getElementById('h-section-select').value);
    const fact = {
      title: document.getElementById('h-title').value.trim(),
      text:  document.getElementById('h-text').value.trim(),
      wow:   document.getElementById('h-wow').checked,
    };
    if (!fact.title) { alert('Введите заголовок факта'); return; }

    if (!isNew && fromSec !== toSec) {
      // move fact to different section
      state.history[fromSec].facts.splice(parseInt(idx), 1);
      state.history[toSec].facts.push(fact);
    } else if (isNew) {
      state.history[toSec].facts.push(fact);
    } else {
      state.history[fromSec].facts[parseInt(idx)] = fact;
    }

    save(KEYS.history, state.history);
    state.historySection = toSec;
    closeModal('modal-history');
    renderHistorySection();
    showToast('Сохранено');
  }

  function deleteHistory() {
    const idx    = parseInt(document.getElementById('h-index').value);
    const secIdx = parseInt(document.getElementById('h-section-index').value);
    state.history[secIdx].facts.splice(idx, 1);
    save(KEYS.history, state.history);
    closeModal('modal-history');
    renderHistorySection();
    showToast('Удалено');
  }

  /* ─── EMOJI PICKER ───────────────────── */
  const EMOJI_POOLS = {
    cuisine:     ['🦆','🍜','🍤','🥟','🍲','🥩','🍣','🍱','🫕','🧆','🍛','🍝','🥗','🫔','🍢','🍡','🥮','🧋','🍕','🌮','🌯','🥪','🍖','🍗','🧀','🍩','🍰','🎂','🍦','🍵','🥐','🦐','🦀','🦞','🐟','🍔','🥙','🌽','🥑','🫙'],
    sights:      ['🏯','🏛️','🗼','🌿','🏔️','🗻','🏖️','🌊','🏙️','⛩️','🕌','⛪','🏰','🎡','🌃','🌉','🗽','🏟️','🎭','🌅','🏜️','💎','🔮','🌸','🌋','🏝️','🎪','🚀','🌁','🏞️','⛰️','🌄','🗿','🏗️','🌺','🚦','⛵','🛕','☸️','🕍'],
    restaurants: ['🍜','🦆','🍣','🥩','🍕','🌮','🥐','🦞','🍢','🥟','🍛','🧆','🫕','🐟','🥗','🦐','🦀','☕','🥂','🍷','🍺','🍱','🌯','🍔','🥙','🍝','🫖','🍻','🍾','🥘'],
    amenities:   ['🏊','💪','🧖','🍽','🏪','👔','🚤','⛵','🎾','♨️','🛎️','🌴','🏖️','🛁','💆','🏋️','🅿️','📺','🌐','🏌️','🚁','🎯','🛍️','🧹','🎱','🎰','🧘','🛗','🍸','🌡️'],
  };

  function pickUniqueEmoji(poolKey, usedEmojis) {
    const pool = EMOJI_POOLS[poolKey] || EMOJI_POOLS.cuisine;
    return pool.find(e => !usedEmojis.includes(e)) || pool[0];
  }

  function renderEmojiPicker(gridId, inputId, poolKey, selected) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    const pool = EMOJI_POOLS[poolKey] || EMOJI_POOLS.cuisine;
    grid.innerHTML = pool.map(e => `
      <button type="button" class="emoji-btn ${e === selected ? 'selected' : ''}"
        onclick="Admin.selectEmoji('${gridId}','${inputId}','${e}')">${e}</button>
    `).join('');
  }

  function selectEmoji(gridId, inputId, emoji) {
    document.getElementById(inputId).value = emoji;
    document.querySelectorAll('#' + gridId + ' .emoji-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.textContent.trim() === emoji);
    });
  }

  /* ─── IMAGE PICKER ───────────────────── */
  function pickImage(input, targetId) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const MAX    = 900;
        const scale  = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
        const field   = document.getElementById(targetId);
        if (field) field.value = dataUrl;
        showImgThumb(targetId, dataUrl);
        input.value = '';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function showImgThumb(targetId, src) {
    const thumb = document.getElementById(targetId + '-preview');
    if (!thumb) return;
    if (src) {
      thumb.src = src;
      thumb.classList.remove('hidden');
    } else {
      thumb.classList.add('hidden');
    }
  }

  /* ─── MEMO ──────────────────────────── */
  function renderMemoSection() {
    const list = document.getElementById('memo-sections-list');
    if (!list) return;
    if (!state.memo.length) {
      list.innerHTML = `<div class="empty-state">Разделов нет. Нажмите «+ Добавить раздел».</div>`;
      return;
    }
    list.innerHTML = state.memo.map((sec, si) => `
      <div class="memo-section-block" data-section="${si}">
        <div class="memo-section-head">
          <span class="drag-handle">⠿</span>
          <span style="font-size:20px">${sec.emoji}</span>
          <span class="memo-section-head-title">${sec.title}</span>
          <div class="memo-section-actions">
            <button class="btn-small" onclick="Admin.openMemoSectionModal(${si})">✏️ Раздел</button>
            <button class="btn-small btn-small-danger" onclick="Admin.deleteMemoSection(${si})">🗑</button>
          </div>
        </div>
        <div class="memo-section-body">
          <div id="memo-items-${si}">
            ${(sec.items || []).map((item, ii) => `
              <div class="memo-item-row" data-index="${ii}">
                <span class="drag-handle">⠿</span>
                <span class="memo-item-icon">${item.icon}</span>
                <div class="memo-item-body" style="cursor:pointer" onclick="Admin.openMemoItemModal(${si}, ${ii})">
                  <div class="memo-item-title">${item.title}</div>
                  <div class="memo-item-text">${item.text}</div>
                </div>
                <button class="btn-small btn-small-danger" style="flex-shrink:0" onclick="Admin.deleteMemoItem(${si},${ii})">🗑</button>
              </div>
            `).join('')}
          </div>
          <button class="btn-add" style="margin-top:8px" onclick="Admin.openMemoItemModal(${si}, null)">+ Добавить строку</button>
        </div>
      </div>
    `).join('');

    initSortable('memo-sections-list', (from, to) => {
      reorderArr(state.memo, from, to);
      save(KEYS.memo, state.memo);
      renderMemoSection();
      showToast('Порядок сохранён');
    });

    state.memo.forEach((sec, si) => {
      const itemList = document.getElementById('memo-items-' + si);
      if (!itemList) return;
      initSortable('memo-items-' + si, (from, to) => {
        reorderArr(state.memo[si].items, from, to);
        save(KEYS.memo, state.memo);
        showToast('Порядок сохранён');
        renderMemoSection();
      });
    });
  }

  function openMemoSectionModal(index) {
    const isNew = index === null;
    const sec   = isNew ? { emoji: '📌', title: '' } : state.memo[index];
    document.getElementById('memo-section-modal-title').textContent = isNew ? 'Добавить раздел' : 'Редактировать раздел';
    document.getElementById('ms-index').value = isNew ? '' : index;
    document.getElementById('ms-emoji').value = sec.emoji || '📌';
    document.getElementById('ms-title').value = sec.title || '';
    document.getElementById('ms-delete-btn').style.display = isNew ? 'none' : 'inline-block';
    openModal('modal-memo-section');
  }

  function saveMemoSection() {
    const idx   = document.getElementById('ms-index').value;
    const isNew = idx === '';
    const sec   = {
      emoji: document.getElementById('ms-emoji').value.trim() || '📌',
      title: document.getElementById('ms-title').value.trim(),
      items: isNew ? [] : state.memo[parseInt(idx)].items,
    };
    if (!sec.title) { alert('Введите название раздела'); return; }
    if (isNew) state.memo.push(sec);
    else       state.memo[parseInt(idx)] = sec;
    save(KEYS.memo, state.memo);
    closeModal('modal-memo-section');
    renderMemoSection();
    showToast('Сохранено');
  }

  function deleteMemoSection(index) {
    if (index === undefined) index = parseInt(document.getElementById('ms-index').value);
    if (!confirm('Удалить раздел и все его строки?')) return;
    state.memo.splice(index, 1);
    save(KEYS.memo, state.memo);
    closeModal('modal-memo-section');
    renderMemoSection();
    showToast('Удалено');
  }

  function openMemoItemModal(sectionIndex, itemIndex) {
    const isNew = itemIndex === null;
    const item  = isNew ? { icon: '📍', title: '', text: '' } : state.memo[sectionIndex].items[itemIndex];
    document.getElementById('memo-item-modal-title').textContent = isNew ? 'Добавить строку' : 'Редактировать строку';
    document.getElementById('mi-section-index').value = sectionIndex;
    document.getElementById('mi-item-index').value    = isNew ? '' : itemIndex;
    document.getElementById('mi-icon').value          = item.icon  || '📍';
    document.getElementById('mi-title').value         = item.title || '';
    document.getElementById('mi-text').value          = item.text  || '';
    document.getElementById('mi-delete-btn').style.display = isNew ? 'none' : 'inline-block';
    openModal('modal-memo-item');
  }

  function saveMemoItem() {
    const si    = parseInt(document.getElementById('mi-section-index').value);
    const idx   = document.getElementById('mi-item-index').value;
    const isNew = idx === '';
    const item  = {
      icon:  document.getElementById('mi-icon').value.trim()  || '📍',
      title: document.getElementById('mi-title').value.trim(),
      text:  document.getElementById('mi-text').value.trim(),
    };
    if (!item.title) { alert('Введите заголовок'); return; }
    if (!state.memo[si].items) state.memo[si].items = [];
    if (isNew) state.memo[si].items.push(item);
    else       state.memo[si].items[parseInt(idx)] = item;
    save(KEYS.memo, state.memo);
    closeModal('modal-memo-item');
    renderMemoSection();
    showToast('Сохранено');
  }

  function deleteMemoItem(si, ii) {
    if (si === undefined) {
      si = parseInt(document.getElementById('mi-section-index').value);
      ii = parseInt(document.getElementById('mi-item-index').value);
    }
    state.memo[si].items.splice(ii, 1);
    save(KEYS.memo, state.memo);
    closeModal('modal-memo-item');
    renderMemoSection();
    showToast('Удалено');
  }

  /* ─── TRANSFERS ─────────────────────── */
  function renderTransfersSection() {
    const list = document.getElementById('transfers-list');
    if (!list) return;
    if (!state.transfers.length) {
      list.innerHTML = `<div class="empty-state">Трансферов нет. Нажмите «+ Добавить маршрут».</div>`;
      return;
    }
    let html = '';
    state.transfers.forEach((day, di) => {
      html += `
        <div class="transfers-day-header" style="margin-top:${di > 0 ? 16 : 0}px">
          <span class="transfers-day-dot" style="background:${day.color}"></span>
          <span class="transfers-day-label" style="color:${day.color}">${day.day}</span>
          <span class="transfers-day-date">${day.date}</span>
        </div>`;
      if (!day.routes.length) {
        html += `<div class="empty-state" style="margin:4px 0 8px">Маршрутов нет</div>`;
      } else {
        day.routes.forEach((r, ri) => {
          html += `
            <div class="list-item" onclick="Admin.openTransferModal(${di}, ${ri})">
              <div class="list-item-left">
                <span class="list-time">${r.time}</span>
                <div>
                  <div class="list-title">${r.title}</div>
                  <div class="list-sub">${r.from} → ${r.to} · ${r.vehicle}</div>
                </div>
              </div>
              <span class="list-edit">✏️</span>
            </div>`;
        });
      }
    });
    list.innerHTML = html;
  }

  function openTransferModal(dayIndex, routeIndex) {
    const isNew = routeIndex === null;
    const days  = state.transfers;

    const sel = document.getElementById('tr-day-select');
    sel.innerHTML = days.map((d, i) =>
      `<option value="${i}">${d.day} · ${d.date}</option>`
    ).join('');

    let r = { time: '', title: '', from: '', to: '', vehicle: '🚌 Автобус', duration: '', meet: '', note: '' };
    if (!isNew && dayIndex !== null) {
      sel.value = dayIndex;
      r = days[dayIndex].routes[routeIndex];
    } else if (dayIndex !== null) {
      sel.value = dayIndex;
    }

    document.getElementById('transfer-modal-title').textContent = isNew ? 'Добавить маршрут' : 'Редактировать маршрут';
    document.getElementById('tr-day-index').value   = isNew ? '' : dayIndex;
    document.getElementById('tr-route-index').value = isNew ? '' : routeIndex;
    document.getElementById('tr-time').value     = r.time     || '';
    document.getElementById('tr-title').value    = r.title    || '';
    document.getElementById('tr-from').value     = r.from     || '';
    document.getElementById('tr-to').value       = r.to       || '';
    document.getElementById('tr-vehicle').value  = r.vehicle  || '🚌 Автобус';
    document.getElementById('tr-duration').value = r.duration || '';
    document.getElementById('tr-meet').value     = r.meet     || '';
    document.getElementById('tr-note').value     = r.note     || '';
    document.getElementById('tr-delete-btn').style.display = isNew ? 'none' : 'inline-block';
    openModal('modal-transfer');
  }

  function saveTransfer() {
    const dayIdx   = parseInt(document.getElementById('tr-day-select').value);
    const routeIdx = document.getElementById('tr-route-index').value;
    const isNew    = routeIdx === '';
    const route = {
      time:     document.getElementById('tr-time').value.trim(),
      title:    document.getElementById('tr-title').value.trim(),
      from:     document.getElementById('tr-from').value.trim(),
      to:       document.getElementById('tr-to').value.trim(),
      vehicle:  document.getElementById('tr-vehicle').value.trim(),
      duration: document.getElementById('tr-duration').value.trim(),
      meet:     document.getElementById('tr-meet').value.trim(),
      note:     document.getElementById('tr-note').value.trim() || null,
    };
    if (!route.title) { alert('Введите название маршрута'); return; }
    if (isNew) state.transfers[dayIdx].routes.push(route);
    else       state.transfers[dayIdx].routes[parseInt(routeIdx)] = route;
    save(KEYS.transfers, state.transfers);
    closeModal('modal-transfer');
    renderTransfersSection();
    showToast('Сохранено');
  }

  function deleteTransfer() {
    const dayIdx   = parseInt(document.getElementById('tr-day-select').value);
    const routeIdx = parseInt(document.getElementById('tr-route-index').value);
    state.transfers[dayIdx].routes.splice(routeIdx, 1);
    save(KEYS.transfers, state.transfers);
    closeModal('modal-transfer');
    renderTransfersSection();
    showToast('Удалено');
  }

  /* ─── CONTACTS ───────────────────────── */
  const CONTACT_EMOJIS = ['👩‍💼','👨‍💼','🧭','🚌','🤝','🏨','🚑','🇷🇺','📞','💼','👑','🛡'];

  function renderContactsSection() {
    const list = document.getElementById('contacts-list');
    if (!list) return;
    if (!state.contacts.length) {
      list.innerHTML = `<div class="empty-state">Контактов нет. Нажмите «+ Добавить контакт».</div>`;
      return;
    }
    list.innerHTML = state.contacts.map((c, i) => `
      <div class="list-item ${c.accent ? 'list-item-accent' : ''}" data-index="${i}" onclick="Admin.openContactModal(+this.dataset.index)">
        <span class="drag-handle">⠿</span>
        <div class="list-item-left">
          <span style="font-size:22px">${c.emoji}</span>
          <div>
            <div class="list-title">${c.name} ${c.accent ? '<span style="color:var(--accent);font-size:11px;font-weight:600">● ключевой</span>' : ''}</div>
            <div class="list-sub">${c.role} · ${c.phone}</div>
          </div>
        </div>
        <span class="list-edit">✏️</span>
      </div>
    `).join('');
    initSortable('contacts-list', (from, to) => {
      reorderArr(state.contacts, from, to);
      save(KEYS.contacts, state.contacts);
      showToast('Порядок сохранён');
    });
  }

  function openContactModal(index) {
    const isNew = index === null;
    const c = isNew
      ? { emoji: '👤', role: '', name: '', phone: '', telegram: '', note: '', accent: false }
      : state.contacts[index];

    const grid = document.getElementById('ct-emoji-grid');
    grid.innerHTML = CONTACT_EMOJIS.map(e =>
      `<button type="button" class="emoji-btn${c.emoji === e ? ' selected' : ''}" onclick="Admin.selectEmoji('ct-emoji-grid','ct-emoji','${e}')">${e}</button>`
    ).join('');

    document.getElementById('contact-modal-title').textContent = isNew ? 'Добавить контакт' : 'Редактировать контакт';
    document.getElementById('ct-index').value    = isNew ? '' : index;
    document.getElementById('ct-emoji').value    = c.emoji    || '👤';
    document.getElementById('ct-role').value     = c.role     || '';
    document.getElementById('ct-name').value     = c.name     || '';
    document.getElementById('ct-phone').value    = c.phone    || '';
    document.getElementById('ct-telegram').value = c.telegram || '';
    document.getElementById('ct-note').value     = c.note     || '';
    document.getElementById('ct-accent').checked = !!c.accent;
    document.getElementById('ct-delete-btn').style.display = isNew ? 'none' : 'inline-block';
    openModal('modal-contact');
  }

  function saveContact() {
    const idx   = document.getElementById('ct-index').value;
    const isNew = idx === '';
    const contact = {
      emoji:    document.getElementById('ct-emoji').value    || '👤',
      role:     document.getElementById('ct-role').value.trim(),
      name:     document.getElementById('ct-name').value.trim(),
      phone:    document.getElementById('ct-phone').value.trim(),
      telegram: document.getElementById('ct-telegram').value.trim() || null,
      note:     document.getElementById('ct-note').value.trim(),
      accent:   document.getElementById('ct-accent').checked,
    };
    if (!contact.name) { alert('Введите имя контакта'); return; }
    if (isNew) state.contacts.push(contact);
    else       state.contacts[parseInt(idx)] = contact;
    save(KEYS.contacts, state.contacts);
    closeModal('modal-contact');
    renderContactsSection();
    showToast('Сохранено');
  }

  function deleteContact() {
    const idx = parseInt(document.getElementById('ct-index').value);
    state.contacts.splice(idx, 1);
    save(KEYS.contacts, state.contacts);
    closeModal('modal-contact');
    renderContactsSection();
    showToast('Удалено');
  }

  /* ─── BRAND KITS ─────────────────────── */
  const LABEL_MAP = {
    typography: { modern: 'Modern', executive: 'Executive', editorial: 'Editorial', friendly: 'Friendly', tech: 'Tech' },
    gradient:   { glow: 'Glow', diagonal: 'Diagonal', vertical: 'Vertical', mesh: 'Mesh', flat: 'Flat' },
    cardStyle:  { elevated: 'Elevated', flat: 'Flat', glass: 'Glass', outlined: 'Outlined' },
    motion:     { swift: 'Swift', elegant: 'Elegant', minimal: 'Minimal' },
  };

  function renderBrandKitsSection() {
    const list  = document.getElementById('brand-kits-list');
    if (!list) return;
    const kits  = getStored(KEYS.brandKits) || [];

    if (!kits.length) {
      list.innerHTML = '<div class="brandkit-empty">Нет сохранённых пресетов.<br>Настройте оформление и нажмите «Сохранить текущие настройки».</div>';
      return;
    }

    list.innerHTML = kits.map(kit => {
      const date = new Date(kit.savedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
      return `
        <div class="brandkit-card">
          <div class="brandkit-card-header" style="background:${kit.color}">
            <div class="brandkit-card-swatch" style="background:${kit.color}; filter:brightness(1.3)"></div>
            <div class="brandkit-card-name">${kit.name}</div>
            <button class="brandkit-card-delete" onclick="Admin.deleteBrandKit('${kit.id}')" title="Удалить">✕</button>
          </div>
          <div class="brandkit-card-body">
            <div class="brandkit-card-row"><span>Шрифт</span><span>${LABEL_MAP.typography[kit.typography] || kit.typography}</span></div>
            <div class="brandkit-card-row"><span>Градиент</span><span>${LABEL_MAP.gradient[kit.gradient] || kit.gradient}</span></div>
            <div class="brandkit-card-row"><span>Карточки</span><span>${LABEL_MAP.cardStyle[kit.cardStyle] || kit.cardStyle}</span></div>
            <div class="brandkit-card-row"><span>Анимации</span><span>${LABEL_MAP.motion[kit.motion] || kit.motion}</span></div>
            <div class="brandkit-date">Сохранён ${date}</div>
            <button class="brandkit-card-apply" onclick="Admin.applyBrandKit('${kit.id}')">Применить к событию</button>
          </div>
        </div>`;
    }).join('');
  }

  function saveBrandKit() {
    const nameInput = document.getElementById('kit-name-input');
    const name = (nameInput?.value || '').trim();
    if (!name) { nameInput?.focus(); showToast('Введите название пресета'); return; }

    const kit = {
      id:         Date.now().toString(),
      name,
      color:      state.event?.brand?.color || '#C9353F',
      logo:       state.event?.brand?.logo  || '',
      typography: localStorage.getItem(KEYS.typography) || 'modern',
      gradient:   localStorage.getItem(KEYS.gradient)   || 'glow',
      cardStyle:  localStorage.getItem(KEYS.cardStyle)  || 'elevated',
      motion:     localStorage.getItem(KEYS.motion)     || 'swift',
      savedAt:    new Date().toISOString(),
    };

    const kits = getStored(KEYS.brandKits) || [];
    kits.unshift(kit);
    save(KEYS.brandKits, kits);

    if (nameInput) nameInput.value = '';
    renderBrandKitsSection();
    showToast('Brand Kit «' + name + '» сохранён');
  }

  function applyBrandKit(id) {
    const kits = getStored(KEYS.brandKits) || [];
    const kit  = kits.find(k => k.id === id);
    if (!kit) return;

    state.event = {
      ...state.event,
      brand: { color: kit.color, logo: kit.logo },
    };
    save(KEYS.event, state.event);
    localStorage.setItem(KEYS.typography, kit.typography);
    localStorage.setItem(KEYS.gradient,   kit.gradient);
    localStorage.setItem(KEYS.cardStyle,  kit.cardStyle);
    localStorage.setItem(KEYS.motion,     kit.motion);

    loadSettingsForm();
    showToast('Применён «' + kit.name + '»');
  }

  function deleteBrandKit(id) {
    const kits    = getStored(KEYS.brandKits) || [];
    const updated = kits.filter(k => k.id !== id);
    save(KEYS.brandKits, updated);
    renderBrandKitsSection();
    showToast('Пресет удалён');
  }

  /* ─── IMPORT ──────────────────────── */
  let aiResult = null;

  const IMPORT_TEMPLATE = `День 1 | 18 ноября, понедельник
09:00 | Завтрак в ресторане отеля
10:30 | Трансфер до конференц-центра
11:00 | Деловая: Открытие форума
13:00 | Обед
19:00 | Приветственный ужин

День 2 | 19 ноября, вторник
09:00 | Завтрак
10:00 | Деловая: Круглый стол
13:30 | Обед
15:00 | Экскурсия по городу`;

  function copyTemplate() {
    navigator.clipboard.writeText(IMPORT_TEMPLATE).then(() => {
      showToast('Шаблон скопирован!');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = IMPORT_TEMPLATE;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Шаблон скопирован!');
    });
  }

  function parseImportText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const days = [];
    let currentDay = null;
    let dayIndex = 0;
    const business = [];
    const DAY_COLORS = ['#C9353F', '#1D4ED8', '#047857', '#7C3AED', '#EA580C', '#6B7280'];

    for (const line of lines) {
      const dayMatch = line.match(/^(?:день|day)\s*(\d+)\s*[|—\-–:.]?\s*(.+)/i);
      if (dayMatch) {
        dayIndex++;
        currentDay = {
          id: dayIndex,
          label: `День ${dayIndex}`,
          date: dayMatch[2].trim(),
          theme: '',
          color: DAY_COLORS[(dayIndex - 1) % DAY_COLORS.length],
          activities: [],
        };
        days.push(currentDay);
        continue;
      }

      const timeMatch = line.match(/^(\d{1,2}[:.]\d{2})\s*[|—\-–]?\s*(.+)/);
      if (timeMatch && currentDay) {
        const time = timeMatch[1].replace('.', ':');
        const desc = timeMatch[2].trim();
        const bizMatch = desc.match(/^(?:деловая[яе]?|сессия)[:\-–\s]+(.+)/i);
        if (bizMatch) {
          const title = bizMatch[1].trim();
          business.push({ id: `b${business.length + 1}`, time, day: currentDay.label, duration: '', track: null, title, speakers: [], room: '', desc: '' });
          currentDay.activities.push({ time, title, location: '', type: 'business', note: null });
        } else {
          const low = desc.toLowerCase();
          let type = 'key';
          if (/завтрак|обед|ужин|банкет/.test(low))         type = 'meal';
          else if (/гала|gala/.test(low))                    type = 'gala';
          else if (/трансфер|автобус|вылет|прилёт|аэропорт/.test(low)) type = 'transfer';
          else if (/экскурс/.test(low))                      type = 'excursion';
          else if (/отель|check.in|заселен|заезд|выселен/.test(low))   type = 'hotel';
          currentDay.activities.push({ time, title: desc, location: '', type, note: null });
        }
      }
    }
    return { days, business };
  }

  function parseProgram() {
    const text   = document.getElementById('ai-program-text').value.trim();
    const status = document.getElementById('ai-status');
    if (!text) { showToast('Вставьте текст программы'); return; }

    const parsed = parseImportText(text);
    if (!parsed.days.length) {
      status.textContent = '❌ Дни не найдены. Используйте формат: «День 1 | 18 ноября»';
      return;
    }

    aiResult = { days: parsed.days, business: parsed.business };
    status.textContent = '';
    showAIPreview(aiResult);
  }

  function handleFileDrop(e) {
    e.preventDefault();
    document.getElementById('file-upload-zone').classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileUpload(input) {
    const file = input.files[0];
    if (file) processFile(file);
    input.value = '';
  }

  function processFile(file) {
    const status = document.getElementById('ai-status');
    const ext = file.name.split('.').pop().toLowerCase();
    status.textContent = '⏳ Читаю файл…';
    document.getElementById('ai-result').classList.add('hidden');

    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = e => {
        document.getElementById('ai-program-text').value = e.target.result;
        status.textContent = '';
        parseProgram();
      };
      reader.readAsText(file, 'UTF-8');

    } else if (ext === 'docx') {
      if (typeof mammoth === 'undefined') { status.textContent = '❌ Библиотека не загружена, проверьте интернет'; return; }
      const reader = new FileReader();
      reader.onload = e => {
        mammoth.extractRawText({ arrayBuffer: e.target.result })
          .then(result => {
            document.getElementById('ai-program-text').value = result.value;
            status.textContent = '';
            parseProgram();
          })
          .catch(err => { status.textContent = '❌ Ошибка Word: ' + err.message; });
      };
      reader.readAsArrayBuffer(file);

    } else if (ext === 'pdf') {
      if (typeof pdfjsLib === 'undefined') { status.textContent = '❌ Библиотека не загружена, проверьте интернет'; return; }
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
          }
          document.getElementById('ai-program-text').value = text;
          status.textContent = '';
          parseProgram();
        } catch (err) {
          status.textContent = '❌ Ошибка PDF: ' + err.message;
        }
      };
      reader.readAsArrayBuffer(file);

    } else {
      status.textContent = '❌ Формат не поддерживается. Используйте .docx, .pdf или .txt';
    }
  }

  function showAIPreview(result) {
    const daysCount  = (result.days || []).length;
    const actsCount  = (result.days || []).reduce((n, d) => n + (d.activities || []).length, 0);
    const bizCount   = (result.business || []).length;

    document.getElementById('ai-result-summary').textContent =
      `Найдено: ${daysCount} дн., ${actsCount} активностей, ${bizCount} деловых сессий`;

    let html = '';
    if (result.event?.title) {
      html += `<div class="ai-preview-block"><strong>📋 ${result.event.title}</strong> · ${result.event.dates || ''} · ${result.event.location || ''}</div>`;
    }
    (result.days || []).forEach(day => {
      html += `<div class="ai-preview-block">
        <strong style="color:${day.color}">${day.label} — ${day.date}</strong>
        ${(day.activities || []).map(a => `<div class="ai-preview-item">⏰ ${a.time} &nbsp; ${a.title} · 📍 ${a.location || '—'}</div>`).join('')}
      </div>`;
    });
    if (bizCount) {
      html += `<div class="ai-preview-block"><strong>💼 Деловые сессии</strong>`;
      (result.business || []).forEach(s => {
        html += `<div class="ai-preview-item">${s.day} · ${s.time} · ${s.title}</div>`;
      });
      html += `</div>`;
    }
    if (result.hotel?.name) {
      html += `<div class="ai-preview-block"><strong>🏨 Отель:</strong> ${result.hotel.name}</div>`;
    }

    document.getElementById('ai-result-preview').innerHTML = html;
    document.getElementById('ai-result').classList.remove('hidden');
  }

  function applyAIResult() {
    if (!aiResult) return;

    if (aiResult.event && Object.keys(aiResult.event).length) {
      const cur = getStored(KEYS.event) || JSON.parse(JSON.stringify(EVENT));
      const merged = { ...cur, ...aiResult.event };
      save(KEYS.event, merged);
      state.event = merged;
    }
    if ((aiResult.days || []).length) {
      save(KEYS.days, aiResult.days);
      state.days = aiResult.days;
    }
    if ((aiResult.business || []).length) {
      save(KEYS.business, aiResult.business);
      state.business = aiResult.business;
    }
    if (aiResult.hotel?.name) {
      const cur = getStored(KEYS.hotel) || JSON.parse(JSON.stringify(HOTEL));
      const merged = { ...cur, ...aiResult.hotel };
      save(KEYS.hotel, merged);
      state.hotel = merged;
    }

    aiResult = null;
    document.getElementById('ai-result').classList.add('hidden');
    document.getElementById('ai-program-text').value = '';
    loadSettingsForm();
    showToast('✅ Программа загружена в приложение!');
  }

  function discardAIResult() {
    aiResult = null;
    document.getElementById('ai-result').classList.add('hidden');
  }

  /* ─── BACKUP / RESTORE ────────────────── */
  function exportData() {
    const backup = { _version: 1, _exported: new Date().toISOString() };
    Object.values(KEYS).forEach(key => {
      const val = localStorage.getItem(key);
      if (val) { try { backup[key] = JSON.parse(val); } catch { backup[key] = val; } }
    });
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'mice-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Бэкап скачан');
  }

  function importData(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data._version) throw new Error('Неверный формат — не похоже на файл бэкапа этого приложения');
        const dateStr = data._exported ? new Date(data._exported).toLocaleString('ru') : 'неизвестно';
        if (!confirm(`Восстановить данные из файла?\nЭкспортирован: ${dateStr}\n\nТекущие данные будут перезаписаны.`)) {
          input.value = '';
          return;
        }
        Object.values(KEYS).forEach(key => {
          if (data[key] !== undefined) localStorage.setItem(key, JSON.stringify(data[key]));
        });
        loadAll();
        input.value = '';
        const status = document.getElementById('backup-status');
        if (status) status.innerHTML = `<div class="backup-success">✓ Данные восстановлены из файла от ${dateStr}</div>`;
        showToast('Данные восстановлены');
      } catch (err) {
        alert('Ошибка при чтении файла: ' + err.message);
        input.value = '';
      }
    };
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const tpl = `// ═══════════════════════════════════════════
// Новое мероприятие — данные
// Заполните все поля и загрузите файл в репозиторий
// ═══════════════════════════════════════════

const EVENT = {
  title:    'Название события',
  subtitle: 'Компания · XX участников',
  dates:    'ДД–ДД месяца ГГГГ',
  location: 'Город, Страна',
  brand: {
    color:     '#C8102E',
    logo:      '',
    logoEmoji: '🏢',
  },
  hotel: {
    name:     'Название отеля ★★★★',
    address:  'Адрес отеля',
    phone:    '+X XXX XXX XX XX',
    maps:     '',
    checkin:  '15:00',
    checkout: '12:00',
  },
  wifi:      { network: '', password: '' },
  organizer: { name: 'Имя', telegram: '' },
  emergency: '112',
};

const TODAY_INDEX = 0;

const HOTEL = {
  name:      'Название отеля',
  nameCn:    'Краткое описание расположения',
  stars:     4,
  image:     '',
  gallery:   [],
  address:   'Адрес',
  addressCn: 'Адрес (доп.)',
  metro:     'Как добраться',
  phone:     '+X XXX XXX XX XX',
  checkin:   '15:00',
  checkout:  '12:00',
  breakfast: 'Описание завтрака',
  desc:      'Описание отеля.',
  amenities: [
    { icon: '🍳', title: 'Завтрак',    note: 'Время · включён/не включён' },
    { icon: '📶', title: 'Wi-Fi',      note: 'Бесплатный' },
    { icon: '🧳', title: 'Багаж',      note: 'Хранение на ресепшн' },
  ],
  tips: [
    'Совет 1.',
    'Совет 2.',
  ],
};

const DAYS = [
  {
    day: 'День 1', date: 'ДД месяца, день недели',
    color: '#2196F3',
    items: [
      { time: '00:00', type: 'transfer', title: 'Трансфер', note: '' },
      { time: '00:00', type: 'meal',     title: 'Завтрак',  note: '' },
      { time: '00:00', type: 'excursion',title: 'Экскурсия', note: '' },
      { time: '00:00', type: 'meal',     title: 'Обед',     note: '' },
      { time: '00:00', type: 'meal',     title: 'Ужин',     note: '' },
    ],
  },
];

const BUSINESS_SESSIONS = [];

const TRANSFERS = [
  {
    day: 'День 1', date: 'ДД месяца', color: '#2196F3',
    routes: [
      {
        time: '00:00', title: 'Название трансфера',
        from: 'Откуда', to: 'Куда',
        vehicle: 'Автобус', duration: '30 мин',
        meet: '00:00 у выхода',
        note: '',
      },
    ],
  },
];

const SIGHTS = [
  {
    id: 's1',
    title: 'Название места',
    sub: 'Подзаголовок · год',
    emoji: '🏛',
    image: '',
    distance: 'Расстояние от отеля',
    hours: '09:00–18:00',
    price: 'Цена / Бесплатно',
    tags: ['Тег'],
    desc: 'Описание места.',
    tip: 'Совет посетителям.',
  },
];

const RESTAURANTS = [
  {
    id: 'r1', type: 'program',
    title: 'Название ресторана',
    cuisine: 'Тип кухни',
    emoji: '🍽',
    price: '₺₺₺',
    address: 'Адрес',
    metro: 'Как добраться',
    hours: '12:00–23:00',
    note: 'Включено — Ужин · День 1',
    image: '',
    desc: 'Описание.',
    menu: ['Блюдо 1', 'Блюдо 2', 'Десерт'],
  },
];

const CUISINE = [
  {
    id: 'c1', must: true,
    title: 'Блюдо',
    cn: 'Транслитерация — описание',
    emoji: '🥩',
    price: 'Примерная цена',
    desc: 'Описание блюда.',
    where: 'Где попробовать',
  },
];

const ETIQUETTE = [];
const PRACTICAL = [];

const FAQ = [
  { q: 'Вопрос?', a: 'Ответ.' },
];

const HISTORY = [
  {
    section: 'Раздел',
    emoji: '📜',
    facts: [
      { title: 'Факт', text: 'Текст.', wow: false },
    ],
  },
];

const NEARBY = [];

const CONTACTS = [
  {
    group: 'Организаторы',
    people: [
      { name: 'Имя Фамилия', role: 'Организатор', phone: '+X XXX XXX-XX-XX', messengers: ['WhatsApp', 'Telegram'] },
    ],
  },
];
`;
    const blob = new Blob([tpl], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'data.js';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Шаблон data.js скачан');
  }

  function resetToDefaults() {
    if (!confirm('Сбросить все данные приложения к содержимому data.js?\n\nОформление (шрифты, цвета, стили карточек) сохранится.\nПрограмма, отель, места, кухня, история и контакты вернутся к дефолтным.')) return;
    const dataKeys = [KEYS.event, KEYS.days, KEYS.restaurants, KEYS.business, KEYS.hotel, KEYS.sights, KEYS.cuisine, KEYS.history, 'admin_contacts', 'admin_transfers', 'admin_faq', 'admin_practical'];
    dataKeys.forEach(k => localStorage.removeItem(k));
    showToast('Данные сброшены к данным по умолчанию');
    const status = document.getElementById('backup-status');
    if (status) status.innerHTML = `<div class="backup-success">✓ Данные сброшены. Откройте приложение — там будут актуальные данные из data.js</div>`;
  }

  /* ─── MODAL / TOAST ───────────────────── */
  function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
  }

  function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
  }

  let toastTimer;
  function showToast(msg) {
    let el = document.getElementById('admin-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'admin-toast';
      el.className = 'admin-toast';
      document.body.appendChild(el);
    }
    el.textContent = '✓ ' + msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /* ─── PUBLIC ──────────────────────────── */
  return {
    login, logout, showSection, applyTemplate,
    // backup
    exportData, importData, resetToDefaults, downloadTemplate,
    // program
    selectProgramDay, openActivityModal, saveActivity, deleteActivity,
    // business
    openBusinessModal, saveBusiness, deleteBusiness,
    // hotel
    saveHotel, openAmenityModal, saveAmenity, deleteAmenity,
    // sights
    openSightModal, saveSight, deleteSight,
    // restaurants
    openRestaurantModal, saveRestaurant, deleteRestaurant,
    // cuisine
    openCuisineModal, saveCuisine, deleteCuisine,
    // history
    selectHistorySection, openHistoryModal, saveHistory, deleteHistory,
    // announcement + settings
    saveAnnouncement, clearAnnouncement,
    saveSettings, updateBrandPreview, onBrandColorPicker, onBrandColorHex, onBrandColor2Picker, onBrandColor2Hex,
    selectFontScale, selectDayTabStyle,
    toggleSplash, selectSplashContent, selectSplashAnim, previewSplashAnim, saveSplashSlogan, previewSplash,
    selectFaviconMode, saveFaviconEmoji, saveFaviconUrl,
    toggleWhiteLabel,
    selectTypography,
    selectGradient,
    selectCardStyle,
    selectMotion,
    selectBg,
    // import
    copyTemplate, parseProgram, handleFileUpload, handleFileDrop, applyAIResult, discardAIResult,
    // brand kits
    saveBrandKit, applyBrandKit, deleteBrandKit,
    // memo
    openMemoSectionModal, saveMemoSection, deleteMemoSection,
    openMemoItemModal, saveMemoItem, deleteMemoItem,
    // transfers
    openTransferModal, saveTransfer, deleteTransfer,
    // contacts
    openContactModal, saveContact, deleteContact,
    // emoji
    selectEmoji,
    // image
    pickImage,
    // modal
    openModal, closeModal,
  };

  // Firebase Auth listener for SaaS projects (?p=PROJECT_ID)
  if (_PID && window.auth) {
    // Show email field and update UI for Firebase mode
    document.addEventListener('DOMContentLoaded', () => {
      const emailEl = document.getElementById('auth-email');
      if (emailEl) emailEl.classList.remove('hidden');
      const subEl = document.querySelector('.auth-sub');
      if (subEl) subEl.textContent = 'Войдите в аккаунт организатора';
    });

    auth.onAuthStateChanged(async user => {
      if (user) {
        // Verify project ownership
        try {
          const snap = await db.collection('projects').doc(_PID).get();
          if (!snap.exists || snap.data().ownerId !== user.uid) {
            document.getElementById('auth-error').textContent = 'Нет доступа к этому проекту';
            document.getElementById('auth-error').classList.remove('hidden');
            auth.signOut();
            return;
          }
          // Load Firestore data into localStorage
          await loadFromFirestore();
        } catch(e) { console.error('Project access check:', e); }

        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        // Update preview link to include project ID
        const previewLink = document.querySelector('.preview-link');
        if (previewLink) previewLink.href = 'index.html?p=' + _PID;
        loadAll();
        showSection('announcement', document.querySelector('.nav-btn'));
      } else {
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('admin-panel').classList.add('hidden');
      }
    });
  }

})();

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => {
    if (e.target === el) el.classList.add('hidden');
  });
});
