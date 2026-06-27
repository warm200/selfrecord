/*
  storage.js —— 本地数据存取层。
  所有记录都用浏览器的 localStorage 保存在手机本地，
  不联网、不登录、不上传到任何服务器。

  一条记录的结构（与原需求一致）：
  {
    id,                     // 唯一标识
    createdAt,              // 创建时间（ISO 字符串）
    energyMoment,           // 今天什么时候最有能量？
    tiredMoment,            // 今天什么时候最疲惫？
    peoplePleasingMoment,   // 今天有没有哪一刻，我是在迎合别人，而不是表达自己？
    trueDesire,             // 今天我真正想要的是什么？
    unexpressedEmotion,     // 今天我有什么情绪，但没有表达出来？
    selfAction              // 今天我做了什么是为了自己？
  }
*/

const Store = {
  KEY: 'selfrecord.records.v1',

  // 生成唯一 id（优先用浏览器原生 UUID，旧环境用时间戳兜底）
  newId() {
    if (window.crypto && typeof crypto.randomUUID === 'function') {
      try { return crypto.randomUUID(); } catch (e) { /* 继续走兜底 */ }
    }
    return 'r-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  },

  // 读取全部记录（按创建时间倒序，最新在最前）
  all() {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch (e) {
      list = [];
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // 覆盖写入全部记录
  saveAll(list) {
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },

  // 按 id 取一条
  get(id) {
    return this.all().find(r => r.id === id) || null;
  },

  // 新增一条，返回新记录
  add(fields) {
    const list = this.all();
    const record = Object.assign(
      {
        id: this.newId(),
        createdAt: new Date().toISOString(),
        energyMoment: '',
        tiredMoment: '',
        peoplePleasingMoment: '',
        trueDesire: '',
        unexpressedEmotion: '',
        selfAction: ''
      },
      fields
    );
    list.push(record);
    this.saveAll(list);
    return record;
  },

  // 更新一条（保留原 id 和 createdAt）
  update(id, fields) {
    const list = this.all();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return null;
    list[idx] = Object.assign({}, list[idx], fields);
    this.saveAll(list);
    return list[idx];
  },

  // 删除一条
  remove(id) {
    const list = this.all().filter(r => r.id !== id);
    this.saveAll(list);
  }
};
