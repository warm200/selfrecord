/*
  storage.js —— 本地数据存取层。
  所有记录都用浏览器的 localStorage 保存在手机本地，
  不联网、不登录、不上传到任何服务器。

  一条记录的结构（「道痕」模板，七个问题）：
  {
    id,                // 唯一标识
    createdAt,         // 创建时间（ISO 字符串）
    biggestRipple,     // 今天最起波澜的一件事是什么。
    firstReaction,     // 当时我的第一反应是什么。
    reallyWanted,      // 我其实想得到什么。
    reallyFeared,      // 我其实在害怕什么。
    excuseIGave,       // 我给自己找了什么理由。
    mainStone,         // 今天捞出来的主石头是什么。
    nextChoice         // 如果明天再遇到同样的事，我准备怎么选。
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
        biggestRipple: '',
        firstReaction: '',
        reallyWanted: '',
        reallyFeared: '',
        excuseIGave: '',
        mainStone: '',
        nextChoice: ''
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
  },

  // 删除全部记录（重置密码时使用）
  clearAll() {
    localStorage.removeItem(this.KEY);
  }
};
