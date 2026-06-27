/*
  lock.js —— 密码锁。
  作用：第一次使用时设置一个密码，之后每次打开都要输入密码才能看到记录。

  说明（重要）：
  - 密码不是明文保存，而是保存它的「加盐哈希」（用浏览器自带的 Web Crypto）。
  - 这是一道「防别人随手翻看」的隐私锁，适合个人使用；
    它不是军用级加密，记录本身仍以普通文本存在本机。
  - 忘记密码时只能「重置」：会删除全部记录并重新设置密码（你已选择此方案）。
*/

const Lock = {
  KEY: 'selfrecord.lock.v1',

  // 是否已经设置过密码
  isSet() {
    return !!localStorage.getItem(this.KEY);
  },

  // 生成随机盐（十六进制字符串）
  _randHex(n) {
    const a = new Uint8Array(n);
    if (window.crypto && crypto.getRandomValues) {
      crypto.getRandomValues(a);
    } else {
      for (let i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // 计算 (盐 + 密码) 的哈希
  async _hash(pin, salt) {
    const text = salt + ':' + pin;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // 兜底：本地 file:// 等非安全环境下没有 crypto.subtle，用简单哈希（安全性较弱）
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
    return 'w' + (h >>> 0).toString(16);
  },

  // 设置/修改密码
  async set(pin) {
    const salt = this._randHex(8);
    const hash = await this._hash(pin, salt);
    localStorage.setItem(this.KEY, JSON.stringify({ salt, hash }));
  },

  // 校验密码是否正确
  async verify(pin) {
    const raw = localStorage.getItem(this.KEY);
    if (!raw) return false;
    let obj;
    try { obj = JSON.parse(raw); } catch (e) { return false; }
    const hash = await this._hash(pin, obj.salt);
    return hash === obj.hash;
  },

  // 清除密码（用于重置）
  clear() {
    localStorage.removeItem(this.KEY);
  }
};
