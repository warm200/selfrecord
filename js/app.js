/*
  app.js —— 界面与交互。
  视图：解锁/设置密码 → 列表 → 新建·编辑 / 详情 / 修改密码。
*/

// 六个问题。这个数组同时驱动「新建页」和「详情页」，改文字只需改这里。
const QUESTIONS = [
  { key: 'energyMoment',         text: '今天什么时候最有能量？' },
  { key: 'tiredMoment',          text: '今天什么时候最疲惫？' },
  { key: 'peoplePleasingMoment', text: '今天有没有哪一刻，我是在迎合别人，而不是表达自己？' },
  { key: 'trueDesire',           text: '今天我真正想要的是什么？' },
  { key: 'unexpressedEmotion',   text: '今天我有什么情绪，但没有表达出来？' },
  { key: 'selfAction',           text: '今天我做了什么是为了自己？' }
];

const app = document.getElementById('app');

// ---------- 小工具 ----------

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function previewOf(record) {
  const parts = QUESTIONS
    .map(q => (record[q.key] || '').trim())
    .filter(t => t.length > 0);
  return parts.length ? parts.join(' · ') : '（空白记录）';
}

// ========== 密码锁相关视图 ==========

// 第一次使用：设置密码
function renderSetPasscode() {
  app.innerHTML = `
    <div class="nav"><h1 style="flex:1;text-align:center">设置密码</h1></div>
    <div class="content">
      <p class="lock-tip">第一次使用，请设置一个密码来保护你的记录。</p>
      <div class="question">
        <label for="pin1">新密码</label>
        <input type="password" id="pin1" class="pin-input" placeholder="至少 4 位">
      </div>
      <div class="question">
        <label for="pin2">确认密码</label>
        <input type="password" id="pin2" class="pin-input" placeholder="再次输入">
      </div>
      <div class="lock-error" id="err"></div>
      <button class="primary-btn" id="ok">设置并进入</button>
    </div>
  `;
  const err = document.getElementById('err');
  document.getElementById('ok').onclick = async () => {
    const a = document.getElementById('pin1').value;
    const b = document.getElementById('pin2').value;
    if (a.length < 4) { err.textContent = '密码至少 4 位。'; return; }
    if (a !== b) { err.textContent = '两次输入不一致。'; return; }
    await Lock.set(a);
    renderList();
  };
}

// 已设置过：输入密码解锁
function renderLock() {
  app.innerHTML = `
    <div class="nav"><h1 style="flex:1;text-align:center">已锁定</h1></div>
    <div class="content lock-screen">
      <div class="lock-icon">🔒</div>
      <div class="question" style="width:100%">
        <input type="password" id="pin" class="pin-input" placeholder="输入密码解锁">
      </div>
      <div class="lock-error" id="err"></div>
      <button class="primary-btn" id="unlock">解锁</button>
      <button class="text-btn danger" id="forgot">忘记密码？重置</button>
    </div>
  `;
  const err = document.getElementById('err');
  const pin = document.getElementById('pin');

  async function tryUnlock() {
    if (await Lock.verify(pin.value)) {
      renderList();
    } else {
      err.textContent = '密码不对，再试一次。';
      pin.value = '';
      pin.focus();
    }
  }

  document.getElementById('unlock').onclick = tryUnlock;
  pin.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
  pin.focus();

  document.getElementById('forgot').onclick = () => {
    if (confirm('重置会删除全部记录，且无法恢复。\n确定要重置吗？')) {
      Store.clearAll();
      Lock.clear();
      renderSetPasscode();
    }
  };
}

// 修改密码（已解锁状态下）
function renderChangePasscode() {
  app.innerHTML = `
    <div class="nav">
      <button class="nav-btn" id="cancel">取消</button>
      <h1 style="flex:1;text-align:center">修改密码</h1>
      <button class="nav-btn" id="save">保存</button>
    </div>
    <div class="content">
      <div class="question"><label for="cur">当前密码</label><input type="password" id="cur" class="pin-input"></div>
      <div class="question"><label for="n1">新密码</label><input type="password" id="n1" class="pin-input" placeholder="至少 4 位"></div>
      <div class="question"><label for="n2">确认新密码</label><input type="password" id="n2" class="pin-input"></div>
      <div class="lock-error" id="err"></div>
    </div>
  `;
  const err = document.getElementById('err');
  document.getElementById('cancel').onclick = () => renderList();
  document.getElementById('save').onclick = async () => {
    const ok = await Lock.verify(document.getElementById('cur').value);
    if (!ok) { err.textContent = '当前密码不对。'; return; }
    const a = document.getElementById('n1').value;
    const b = document.getElementById('n2').value;
    if (a.length < 4) { err.textContent = '新密码至少 4 位。'; return; }
    if (a !== b) { err.textContent = '两次输入不一致。'; return; }
    await Lock.set(a);
    renderList();
  };
}

// ========== 记录相关视图 ==========

// 视图一：历史列表（主页面）
function renderList() {
  const records = Store.all();

  const cards = records.map(r => `
    <div class="card" data-id="${esc(r.id)}">
      <div class="date">${esc(formatDate(r.createdAt))}</div>
      <div class="preview">${esc(previewOf(r))}</div>
    </div>
  `).join('');

  const body = records.length
    ? `<div class="content">${cards}
         <button class="text-btn" id="pw-btn">修改密码</button>
       </div>`
    : `<div class="empty">
         <div class="big">✎</div>
         <div>还没有记录</div>
         <div>点击下方的 + 写下今天</div>
         <button class="text-btn" id="pw-btn" style="margin-top:24px">修改密码</button>
       </div>`;

  app.innerHTML = `
    <div class="nav">
      <button class="nav-btn" id="lock-btn">🔒 锁定</button>
      <h1 style="flex:1;text-align:center">我的记录</h1>
      <span style="width:64px"></span>
    </div>
    ${body}
    <button class="fab" id="add-btn" aria-label="新建记录">+</button>
  `;

  document.getElementById('add-btn').onclick = () => renderEditor(null);
  document.getElementById('lock-btn').onclick = () => renderLock();
  document.getElementById('pw-btn').onclick = () => renderChangePasscode();
  document.querySelectorAll('.card').forEach(el => {
    el.onclick = () => renderDetail(el.dataset.id);
  });
}

// 视图二：新建 / 编辑（record 为 null 表示新建）
function renderEditor(record) {
  const isEdit = !!record;

  const fields = QUESTIONS.map(q => `
    <div class="question">
      <label for="${q.key}">${esc(q.text)}</label>
      <textarea id="${q.key}" placeholder="在这里写下你的答案…">${esc(record ? record[q.key] : '')}</textarea>
    </div>
  `).join('');

  app.innerHTML = `
    <div class="nav">
      <button class="nav-btn" id="cancel-btn">取消</button>
      <h1 style="flex:1;text-align:center">${isEdit ? '编辑记录' : '新建记录'}</h1>
      <button class="nav-btn" id="save-btn">保存</button>
    </div>
    <div class="content">${fields}</div>
  `;

  function collect() {
    const data = {};
    QUESTIONS.forEach(q => { data[q.key] = document.getElementById(q.key).value; });
    return data;
  }

  document.getElementById('cancel-btn').onclick = () => {
    isEdit ? renderDetail(record.id) : renderList();
  };

  document.getElementById('save-btn').onclick = () => {
    const data = collect();
    if (isEdit) {
      Store.update(record.id, data);
      renderDetail(record.id);
    } else {
      Store.add(data);
      renderList();
    }
  };

  const first = document.getElementById(QUESTIONS[0].key);
  if (first) first.focus();
}

// 视图三：详情
function renderDetail(id) {
  const record = Store.get(id);
  if (!record) { renderList(); return; }

  const blocks = QUESTIONS.map(q => {
    const ans = (record[q.key] || '').trim();
    return `
      <div class="detail-block">
        <div class="q">${esc(q.text)}</div>
        <div class="a ${ans ? '' : 'empty-a'}">${ans ? esc(ans) : '（未填写）'}</div>
      </div>
    `;
  }).join('');

  app.innerHTML = `
    <div class="nav">
      <button class="nav-btn" id="back-btn">‹ 返回</button>
      <div class="nav-spacer"></div>
      <button class="nav-btn" id="edit-btn">编辑</button>
    </div>
    <div class="content">
      <div class="date" style="font-weight:600;margin-bottom:16px">
        ${esc(formatDate(record.createdAt))}
      </div>
      ${blocks}
      <button class="delete-btn" id="delete-btn">删除这条记录</button>
    </div>
  `;

  document.getElementById('back-btn').onclick = () => renderList();
  document.getElementById('edit-btn').onclick = () => renderEditor(record);
  document.getElementById('delete-btn').onclick = () => {
    if (confirm('确定删除这条记录？删除后无法恢复。')) {
      Store.remove(record.id);
      renderList();
    }
  };
}

// ---------- 启动 ----------
// 没设置过密码 → 去设置；已设置 → 先解锁。
if (Lock.isSet()) {
  renderLock();
} else {
  renderSetPasscode();
}

// 注册 Service Worker（让 App 添加到主屏幕后可离线使用）。
// 只有在 http/https 下（如 GitHub Pages）才注册；本地 file:// 打开会自动跳过。
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
