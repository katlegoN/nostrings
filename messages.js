// NOSTRINGS · mock Messages inbox + chat (demo data only, stored in this browser)
(function () {
  const $ = (s) => document.querySelector(s);
  const ns = () => window.NS || { toast() {} };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MIN = 60000;

  // ---------- mock members ----------
  const USERS = {
    thando: { name: 'Thando', age: 27, area: 'Rosebank', km: 2, online: true, verified: true, g: ['#ff1f5a', '#ff9a5c'] },
    lerato: { name: 'Lerato', age: 25, area: 'Sandton', km: 5, online: true, g: ['#a83cff', '#ff4fa3'] },
    naledi: { name: 'Naledi', age: 28, area: 'Melville', km: 6, verified: true, seen: 25, g: ['#ff6a3d', '#ffc046'] },
    jason:  { name: 'Jason', age: 30, area: 'Braamfontein', km: 3, seen: 70, g: ['#1fb5ff', '#6a5cff'] },
    zara:   { name: 'Zara', age: 26, area: 'Fourways', km: 14, online: true, g: ['#ff2d55', '#a20f3a'] },
    kabelo: { name: 'Kabelo', age: 29, area: 'Midrand', km: 18, verified: true, seen: 240, g: ['#00c98d', '#0b7f8c'] },
    sipho:  { name: 'Sipho', age: 32, area: 'Parktown', km: 4, seen: 1600, g: ['#596bff', '#2b2f8f'] },
    aisha:  { name: 'Aisha', age: 24, area: 'Parkhurst', km: 4, online: true, verified: true, g: ['#ff4fa3', '#ff9ac6'] },
    mpho:   { name: 'Mpho', age: 31, area: 'Soweto', km: 12, g: ['#ffb03b', '#ff5e3a'] },
    chris:  { name: 'Chris', age: 27, area: 'Greenside', km: 7, online: true, g: ['#3fd0ff', '#2a7bff'] },
    amara:  { name: 'Amara', age: 29, area: 'Killarney', km: 5, verified: true, g: ['#c86bff', '#6b2bd9'] }
  };

  // [from, minutes ago, text]
  const SEED = {
    thando: { unread: 2, msgs: [
      ['them', 1150, 'Hey you 👋 your profile made me smile'],
      ['me', 1140, 'Haha thank you! Is that Zanzibar in your third pic?'],
      ['them', 1132, 'Good eye 😄 Paje beach, last December'],
      ['them', 1131, 'You look like someone who knows the good spots in Joburg though'],
      ['me', 1100, "I might know one or two 😏"],
      ['them', 14, 'Okay so… are you free Friday?'],
      ['them', 13, 'There’s a rooftop in Maboneng with the best sunset 🌇🍸']
    ] },
    lerato: { unread: 1, msgs: [
      ['me', 300, 'Your music taste is elite. Who’s on repeat right now?'],
      ['them', 290, 'Tyla, always 😌 and a bit of Amapiano on Fridays'],
      ['me', 240, 'Sending you my playlist then 🎧'],
      ['them', 38, 'Okay that playlist is actually fire 🔥']
    ] },
    naledi: { unread: 1, msgs: [
      ['them', 600, 'Hi! We matched last night 🙈'],
      ['me', 590, 'We did! How’s your day going?'],
      ['them', 95, 'Busy but better now. Coffee first? I like to see if the vibe is real ☕']
    ] },
    jason: { unread: 0, msgs: [
      ['them', 1500, 'You still keen for the food market on Sunday?'],
      ['me', 1490, 'Definitely. Neighbourgoods at 11?'],
      ['them', 1480, 'Perfect 👌'],
      ['me', 1475, 'Sounds like a plan, see you there']
    ] },
    zara: { unread: 0, msgs: [
      ['them', 3000, 'Two truths and a lie. Go 😈'],
      ['me', 2990, 'I’ve been skydiving, I can cook a mean oxtail, I’ve never been late'],
      ['them', 2980, 'lol you’re definitely late to everything 👀']
    ] },
    kabelo: { unread: 0, msgs: [
      ['me', 4300, 'That gig was unreal last night'],
      ['them', 4200, 'Good morning ☀️ I’m still recovering haha. Same time next month?']
    ] },
    sipho: { unread: 0, msgs: [
      ['them', 9000, 'Hey, nice to match with you'],
      ['me', 8990, 'Likewise 🙂 What are you up to this week?']
    ] }
  };

  const REPLIES = [
    'Haha I like that 😄', 'Okay you’ve got my attention 👀', 'Tell me more…',
    'That sounds fun. When are you free?', '😂 stop', 'Deal. Let’s lock it in 🔒',
    'I was literally thinking the same thing', 'You’re trouble, I can tell 😏',
    'Send me the location and I’m there', 'Hmm convince me 😌', 'Cute. Very cute.'
  ];

  // ---------- storage ----------
  const TKEY = 'nostrings_threads_v1';
  let threads = load();
  function seed() {
    const now = Date.now(), out = {};
    for (const id in SEED) out[id] = { unread: SEED[id].unread, msgs: SEED[id].msgs.map(([from, ago, text]) => ({ from, t: now - ago * MIN, text })) };
    return out;
  }
  function load() { try { const v = JSON.parse(localStorage.getItem(TKEY)); if (v) return v; } catch (e) {} return seed(); }
  function save() { try { localStorage.setItem(TKEY, JSON.stringify(threads)); } catch (e) {} }

  // ---------- helpers ----------
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  const hhmm = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  function listTime(t) {
    const d = new Date(t), n = new Date(), y = new Date(n - 864e5);
    if (sameDay(d, n)) return hhmm(t);
    if (sameDay(d, y)) return 'Yesterday';
    if (n - d < 6 * 864e5) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  }
  function dayLabel(t) {
    const d = new Date(t), n = new Date(), y = new Date(n - 864e5);
    if (sameDay(d, n)) return 'Today';
    if (sameDay(d, y)) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' });
  }
  function status(u) {
    if (u.online) return 'Online now';
    const m = u.seen || 60;
    return 'Active ' + (m < 60 ? m + 'm' : m < 1440 ? Math.round(m / 60) + 'h' : Math.round(m / 1440) + 'd') + ' ago';
  }
  const TICK = '<svg class="tick" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1l2.6 2.2 3.4-.4.9 3.3 3 1.7-1.3 3.2 1.3 3.2-3 1.7-.9 3.3-3.4-.4L12 23l-2.6-2.2-3.4.4-.9-3.3-3-1.7L3.4 12 2.1 8.8l3-1.7.9-3.3 3.4.4z"/><path d="M8 12.2l2.6 2.6L16.2 9" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function ava(id, size, dot) {
    const u = USERS[id];
    return `<div class="ava" style="--g1:${u.g[0]};--g2:${u.g[1]};width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px">${esc(u.name[0])}${dot && u.online ? '<i class="dot"></i>' : ''}</div>`;
  }
  const last = (id) => { const m = threads[id] && threads[id].msgs; return m && m.length ? m[m.length - 1] : null; };
  const totalUnread = () => Object.values(threads).reduce((a, t) => a + (t.unread || 0), 0);

  function updateBadges() {
    const n = totalUnread();
    document.querySelectorAll('[data-badge]').forEach((b) => (b.textContent = n ? (n > 9 ? '9+' : n) : ''));
    const h = $('#mCount'); if (h) h.textContent = n ? n + ' new' : '';
  }

  // ---------- inbox ----------
  function renderList() {
    const q = ($('#mSearch').value || '').trim().toLowerCase();
    const match = (id) => !q || USERS[id].name.toLowerCase().includes(q);

    const fresh = Object.keys(USERS).filter((id) => !(threads[id] && threads[id].msgs.length) && match(id));
    $('#mMatches').innerHTML = (q ? '' : `<div class="match likes"><div class="ring"><div class="blur">12</div></div>Likes</div>`) +
      fresh.map((id) => `<button class="match" data-chat="${id}"><div class="ring">${ava(id, 62, true)}</div>${esc(USERS[id].name)}</button>`).join('');
    $('#mMatchLabel').classList.toggle('hidden', !fresh.length && !!q);

    const ids = Object.keys(threads).filter((id) => USERS[id] && threads[id].msgs.length && match(id)).sort((a, b) => last(b).t - last(a).t);
    $('#mList').innerHTML = ids.length ? ids.map((id) => {
      const u = USERS[id], m = last(id), un = threads[id].unread || 0;
      return `<button class="convo${un ? ' unread' : ''}" data-chat="${id}">${ava(id, 58, true)}
        <div class="mid"><div class="top"><span class="nm">${esc(u.name)}, ${u.age}${u.verified ? TICK : ''}</span><span class="tm">${listTime(m.t)}</span></div>
        <div class="pv"><span>${m.from === 'me' ? 'You: ' : ''}${esc(m.text)}</span>${un ? `<b class="ub">${un}</b>` : m.from === 'me' ? '<svg class="seen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12.5l4.5 4.5L15 8.5M9.5 16l1 1L19 8.5"/></svg>' : ''}</div></div></button>`;
    }).join('') : `<div class="empty-search">No one called “${esc(q)}” yet</div>`;
    updateBadges();
  }

  // ---------- chat ----------
  let current = null, typingFor = null;
  function openChat(id) {
    current = id;
    const u = USERS[id];
    $('#cAva').innerHTML = ava(id, 42, true);
    $('#cName').innerHTML = esc(u.name) + ', ' + u.age + (u.verified ? TICK : '');
    setStatus();
    if (threads[id]) { threads[id].unread = 0; save(); }
    updateBadges();
    $('#cInput').value = ''; autosize(); toggleSend();
    renderMsgs(false);
    requestAnimationFrame(() => scrollBottom(false));
  }
  function setStatus() {
    const u = USERS[current], st = $('#cStatus');
    if (typingFor === current) { st.textContent = 'typing…'; st.className = 'st on'; return; }
    st.textContent = status(u) + ' · ' + u.km + ' km away';
    st.className = 'st' + (u.online ? ' on' : '');
  }
  function renderMsgs(animateLast) {
    const box = $('#cMsgs'), id = current, u = USERS[id];
    const msgs = (threads[id] && threads[id].msgs) || [];
    if (!msgs.length) {
      box.innerHTML = `<div class="matchcard">${ava(id, 96)}<h3>You matched with ${esc(u.name)} 🎉</h3>
        <p>${esc(u.area)} · ${u.km} km away. Break the ice.</p>
        <div class="chips">${['Hey ' + u.name + ' 👋', 'Your smile though 😍', 'Drinks this week?', 'Two truths and a lie?'].map((c) => `<button class="chip">${esc(c)}</button>`).join('')}</div></div>`;
      return;
    }
    let html = '', prevDay = '';
    msgs.forEach((m, i) => {
      const d = dayLabel(m.t);
      if (d !== prevDay) { html += `<div class="day">${d}</div>`; prevDay = d; }
      const p = msgs[i - 1], n = msgs[i + 1];
      const first = !p || p.from !== m.from || dayLabel(p.t) !== d || m.t - p.t > 10 * MIN;
      const lastG = !n || n.from !== m.from || dayLabel(n.t) !== d || n.t - m.t > 10 * MIN;
      const cls = first && lastG ? 'first last' : first ? 'first' : lastG ? 'last' : 'mid';
      html += `<div class="mrow ${m.from === 'me' ? 'mine' : 'theirs'} ${cls}${first && i ? ' gap' : ''}${animateLast && i === msgs.length - 1 ? ' pop' : ''}"><div class="bub">${esc(m.text)}</div></div>`;
      if (lastG) {
        const isLast = i === msgs.length - 1;
        html += `<div class="meta ${m.from === 'me' ? 'mine' : 'theirs'}">${hhmm(m.t)}${m.from === 'me' && isLast ? (m.read ? ' · Seen' : ' · Delivered') : ''}</div>`;
      }
    });
    if (typingFor === id) html += `<div class="mrow theirs gap pop"><div class="bub typing"><i></i><i></i><i></i></div></div>`;
    box.innerHTML = html;
  }
  function scrollBottom(smooth) { const s = $('#cScroll'); s.scrollTo({ top: s.scrollHeight, behavior: smooth ? 'smooth' : 'auto' }); }

  function send(text) {
    text = text.trim(); if (!text || !current) return;
    const id = current;
    threads[id] = threads[id] || { unread: 0, msgs: [] };
    threads[id].msgs.push({ from: 'me', t: Date.now(), text });
    save(); renderMsgs(true); scrollBottom(true);
    reply(id);
  }
  function reply(id) {
    const u = USERS[id];
    const readIn = u.online ? 700 : 1600;
    setTimeout(() => {
      const mine = last(id); if (mine && mine.from === 'me') { mine.read = true; save(); }
      typingFor = id;
      if (current === id && visible()) { renderMsgs(false); setStatus(); scrollBottom(true); }
    }, readIn);
    setTimeout(() => {
      typingFor = null;
      const text = REPLIES[Math.floor(Math.random() * REPLIES.length)];
      threads[id].msgs.push({ from: 'them', t: Date.now(), text });
      if (current === id && visible()) { renderMsgs(true); setStatus(); scrollBottom(true); }
      else { threads[id].unread = (threads[id].unread || 0) + 1; ns().toast(u.name + ': ' + text); }
      save(); updateBadges();
      if (!$('#messages').classList.contains('hidden')) renderList();
    }, readIn + 1300 + Math.random() * 1200);
  }
  const visible = () => !$('#chat').classList.contains('hidden');

  // ---------- composer ----------
  const input = () => $('#cInput');
  function autosize() { const t = input(); t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }
  function toggleSend() { $('#cSend').disabled = !input().value.trim(); }

  function bind() {
    document.addEventListener('click', (e) => {
      const c = e.target.closest('[data-chat]');
      if (c) { location.hash = 'chat-' + c.dataset.chat; return; }
      const chip = e.target.closest('.chip');
      if (chip) { send(chip.textContent); return; }
      if (e.target.closest('.likes')) ns().toast('Upgrade to see who likes you 💎');
    });
    $('#mSearch').addEventListener('input', renderList);
    input().addEventListener('input', () => { autosize(); toggleSend(); });
    input().addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && window.matchMedia('(hover:hover)').matches) { e.preventDefault(); $('#cSend').click(); }
    });
    $('#cSend').addEventListener('mousedown', (e) => e.preventDefault()); // keep keyboard open
    $('#cSend').addEventListener('click', () => { send(input().value); input().value = ''; autosize(); toggleSend(); });
    $('#cPlus').addEventListener('click', () => ns().toast('Photo sharing is coming soon 📸'));
    const sheet = $('#cSheet'), scrim = $('#scrim');
    const closeSheet = () => { sheet.classList.remove('open'); scrim.classList.remove('open'); };
    $('#cMore').addEventListener('click', () => { sheet.classList.add('open'); scrim.classList.add('open'); });
    scrim.addEventListener('click', closeSheet);
    sheet.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      closeSheet();
      const name = USERS[current].name;
      ({
        profile: () => ns().toast('Profiles are coming soon'),
        unmatch: () => { delete threads[current]; save(); ns().toast('Unmatched with ' + name); location.hash = 'messages'; },
        report: () => ns().toast(name + ' has been blocked and reported'),
        cancel: () => {}
      })[b.dataset.act]();
    });

    // keep the composer above the iOS keyboard
    const vv = window.visualViewport;
    if (vv) {
      const fit = () => {
        const c = $('#chat'); if (c.classList.contains('hidden')) return;
        c.style.top = vv.offsetTop + 'px'; c.style.height = vv.height + 'px'; c.style.bottom = 'auto';
        scrollBottom(false);
      };
      vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit);
    }
  }

  window.Msg = {
    has: (id) => !!USERS[id],
    renderList,
    openChat,
    updateBadges,
    leaveChat() { current = null; },
    reset() { try { localStorage.removeItem(TKEY); } catch (e) {} threads = seed(); updateBadges(); },
    bind
  };
})();
