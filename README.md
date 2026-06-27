# SelfRecord（极简本地记录 App）

一个只在 iPhone 本地保存数据的极简记录 App：**不需要登录、不需要联网、不需要云同步、不需要服务器**。
使用 Swift + SwiftUI 编写，本地存储用的是 **SwiftData**。

---

## 一、功能

- 主页面按日期倒序显示所有历史记录（最新的在最上面）。
- 每条记录显示创建日期 + 所有答案的简短预览。
- 底部中间有一个圆形 “+” 按钮，点击后打开新建记录页面。
- 新建页面有六个问题，每个问题下面是可多行输入的文本框。
- 填写后点“保存”，自动返回主页面并看到新记录。
- 点击任意记录进入详情页，可查看完整内容、**编辑**、**删除**。
- 列表里也可以左滑删除。

六个问题：
1. 今天什么时候最有能量？
2. 今天什么时候最疲惫？
3. 今天有没有哪一刻，我是在迎合别人，而不是表达自己？
4. 今天我真正想要的是什么？
5. 今天我有什么情绪，但没有表达出来？
6. 今天我做了什么是为了自己？

---

## 二、项目结构

```
SelfRecord.xcodeproj        ← Xcode 工程文件（直接双击打开）
SelfRecord/
├── SelfRecordApp.swift       App 入口，挂载 SwiftData 本地数据库
├── Models/
│   └── DailyRecord.swift     数据模型（一条记录的所有字段）+ 六个问题文字
├── Views/
│   ├── RecordListView.swift     主页面：历史列表 + “+” 按钮
│   ├── RecordEditorView.swift   新建 / 编辑页面
│   └── RecordDetailView.swift   详情页：查看 / 编辑 / 删除
└── Assets.xcassets/          App 图标与主题色占位
```

数据模型 `DailyRecord` 字段：
`id`、`createdAt`、`energyMoment`、`tiredMoment`、`peoplePleasingMoment`、
`trueDesire`、`unexpressedEmotion`、`selfAction`。

---

## 三、运行到 iPhone（推荐方式：直接打开本工程）

> 需要 **Xcode 16 或更新版本**（本工程使用了 Xcode 16 的新工程格式）。
> 系统要求：iPhone 为 **iOS 17 或更新**。

### 1. 打开工程
1. 把本仓库下载/克隆到 Mac 上。
2. 双击 `SelfRecord.xcodeproj`，用 Xcode 打开。

### 2. 配置签名（Signing，第一次必须做）
1. 在左侧选中最上面的蓝色项目图标 **SelfRecord**。
2. 选中 TARGETS 下的 **SelfRecord**，打开顶部 **Signing & Capabilities** 标签。
3. 勾选 **Automatically manage signing（自动管理签名）**。
4. 在 **Team** 下拉里选择你的 Apple ID。
   - 如果没有 Team：点 Xcode 菜单 **Settings → Accounts → 左下角 “+” → Apple ID**，
     用你自己的 Apple ID 登录（**免费账号即可**，不需要付费开发者账号）。
5. 把 **Bundle Identifier** 改成一个全世界唯一的名字，例如
   `com.你的名字.SelfRecord`（默认是 `com.example.SelfRecord`，建议改掉）。
   改完后 Xcode 会自动生成证书，出现绿色对勾即成功。

### 3. 连接 iPhone 并运行
1. 用数据线把 iPhone 连到 Mac（第一次会弹出“信任此电脑”，点信任）。
2. 在 Xcode 顶部中间的设备选择处，选中你的 iPhone（不是模拟器）。
3. 点左上角的 ▶️（Run）按钮，等待编译安装。

### 4. 在 iPhone 上信任开发者（免费账号第一次必做）
第一次运行 App 可能在手机上打不开，提示“不受信任的开发者”：
1. iPhone 打开 **设置 → 通用 → VPN与设备管理（或“描述文件与设备管理”）**。
2. 找到你的 Apple ID，点 **信任**。
3. 回到桌面再次点开 App 即可。

> 说明：用免费 Apple ID 安装的 App，有效期约 7 天，过期后在 Xcode 里重新 Run 一次即可。
> 这对“只给自己用”的 App 完全够用，无需上架 App Store。

---

## 四、备用方式：自己在 Xcode 里新建工程并粘贴代码

如果你的 Xcode 版本较老、打不开本工程，可以手动新建：

1. Xcode → **File → New → Project → iOS → App → Next**。
2. Product Name 填 `SelfRecord`；
   Interface 选 **SwiftUI**；Language 选 **Swift**；
   Storage 选 **SwiftData**（如果没有这个选项就选 None，代码里已经自己配置好了）。
3. 创建后，把本仓库 `SelfRecord/` 文件夹里的几个 `.swift` 文件内容，
   逐一**覆盖**到 Xcode 自动生成的同名文件里；缺少的文件就 **New File → Swift File** 新建后粘贴。
   - 确保有这五个文件：`SelfRecordApp.swift`、`DailyRecord.swift`、
     `RecordListView.swift`、`RecordEditorView.swift`、`RecordDetailView.swift`。
4. 然后按上面第三节的 **Signing → 连接 iPhone → Run** 步骤运行。

---

## 五、关于权限

本 App **不使用相机、麦克风、定位、网络等任何敏感权限**，
所有数据只通过 SwiftData 存在手机本地沙盒里，因此 **不需要在 Info.plist 里配置任何权限**。
唯一需要配置的就是上面第三节的 **Signing（签名）**。

---

## 六、数据存在哪里 / 会不会丢

- 数据保存在 iPhone 本地（App 的沙盒数据库里），不会上传到任何地方。
- 删除 App 会一并删除数据，请知悉。
- 如需备份，可日后自行扩展“导出文本”等功能（当前版本未包含，保持极简）。
