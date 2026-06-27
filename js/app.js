/*
  app.js —— 界面与交互。
  整个 App 只有一个页面，靠 JS 在「列表 / 新建·编辑 / 详情」三个视图之间切换。
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

// 把时间格式化成中文可读的日期
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// 转义文本，安全地放进 HTML
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 列表里显示的简短预览：拼接所有非空答案
function previewOf(record) {
  const parts = QUESTIONS
    .map(q => (record[q.key] || '').trim())
    .filter(t => t.length > 0);
  return parts.length ? parts.join(' · ') : '（空白记录）';
}

// ---------- 视图一：历史列表（主页面） ----------

function renderList() {
  const records = Store.all();

  const cards = records.map(r => `
    <div class="card" data-id="${esc(r.id)}">
      <div class="date">${esc(formatDate(r.createdAt))}</div>
      <div class="preview">${esc(previewOf(r))}</div>
    </div>
  `).join('');

  const body = records.length
    ? `<div class="content">${cards}</div>`
    : `<div class="empty">
         <div class="big">✎</div>
         <div>还没有记录</div>
         <div>点击下方的 + 写下今天</div>
       </div>`;

  app.innerHTML = `
    <div class="nav"><h1>我的记录</h1></div>
    ${body}
    <button class="fab" id="add-btn" aria-label="新建记录">+</button>
  `;

  document.getElementById('add-btn').onclick = () => renderEditor(null);
  document.querySelectorAll('.card').forEach(el => {
    el.onclick = () => renderDetail(el.dataset.id);
  });
}

// ---------- 视图二：新建 / 编辑 ----------
// record 为 null 表示新建；传入记录表示编辑。

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
      <div class="nav-spacer" style="text-align:center;font-weight:600">${isEdit ? '编辑记录' : '新建记录'}</div>
      <button class="nav-btn" id="save-btn">保存</button>
    </div>
    <div class="content">${fields}</div>
  `;

  // 收集输入框里的内容
  function collect() {
    const data = {};
    QUESTIONS.forEach(q => {
      data[q.key] = document.getElementById(q.key).value;
    });
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

  // 自动聚焦第一个输入框
  const first = document.getElementById(QUESTIONS[0].key);
  if (first) first.focus();
}

// ---------- 视图三：详情 ----------

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

renderList();

// 注册 Service Worker，让 App 添加到主屏幕后可以离线使用。
// 只有在 http/https 下（如 GitHub Pages）才注册；本地 file:// 打开会自动跳过。
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* 离线功能不可用也不影响正常使用 */ });
  });
}
