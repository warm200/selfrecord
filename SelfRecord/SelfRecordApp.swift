//
//  SelfRecordApp.swift
//  SelfRecord
//
//  App 入口。这里完成两件事：
//  1. 指定 App 启动后显示的第一个页面（主页面 RecordListView）。
//  2. 通过 .modelContainer 把 SwiftData 的本地数据库挂载到整个 App。
//     所有数据都保存在手机本地，不联网、不登录、不同步。
//

import SwiftUI
import SwiftData

@main
struct SelfRecordApp: App {
    var body: some Scene {
        WindowGroup {
            RecordListView()
        }
        // 告诉 SwiftData：本 App 需要为 DailyRecord 这个模型创建本地数据库。
        .modelContainer(for: DailyRecord.self)
    }
}
