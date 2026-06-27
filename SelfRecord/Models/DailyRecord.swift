//
//  DailyRecord.swift
//  SelfRecord
//
//  数据模型。@Model 是 SwiftData 提供的标记，
//  加上它之后，这个类的对象就能被自动保存到手机本地数据库。
//

import Foundation
import SwiftData

@Model
final class DailyRecord {
    // 每条记录的唯一标识。
    var id: UUID
    // 创建时间，用于列表排序和显示。
    var createdAt: Date

    // 六个问题对应的答案。
    var energyMoment: String          // 今天什么时候最有能量？
    var tiredMoment: String           // 今天什么时候最疲惫？
    var peoplePleasingMoment: String  // 今天有没有哪一刻，我是在迎合别人，而不是表达自己？
    var trueDesire: String            // 今天我真正想要的是什么？
    var unexpressedEmotion: String    // 今天我有什么情绪，但没有表达出来？
    var selfAction: String            // 今天我做了什么是为了自己？

    init(
        id: UUID = UUID(),
        createdAt: Date = Date(),
        energyMoment: String = "",
        tiredMoment: String = "",
        peoplePleasingMoment: String = "",
        trueDesire: String = "",
        unexpressedEmotion: String = "",
        selfAction: String = ""
    ) {
        self.id = id
        self.createdAt = createdAt
        self.energyMoment = energyMoment
        self.tiredMoment = tiredMoment
        self.peoplePleasingMoment = peoplePleasingMoment
        self.trueDesire = trueDesire
        self.unexpressedEmotion = unexpressedEmotion
        self.selfAction = selfAction
    }
}

// 把六个问题的文字集中放在一个地方，
// 新建页面和详情页面都从这里取，避免文字写得不一致。
enum Question {
    static let energy = "今天什么时候最有能量？"
    static let tired = "今天什么时候最疲惫？"
    static let peoplePleasing = "今天有没有哪一刻，我是在迎合别人，而不是表达自己？"
    static let trueDesire = "今天我真正想要的是什么？"
    static let unexpressed = "今天我有什么情绪，但没有表达出来？"
    static let selfAction = "今天我做了什么是为了自己？"
}

extension DailyRecord {
    /// 主页面列表里显示的简短预览：把所有非空答案拼成一段文字。
    var previewText: String {
        let answers = [
            energyMoment,
            tiredMoment,
            peoplePleasingMoment,
            trueDesire,
            unexpressedEmotion,
            selfAction
        ]
        .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        .filter { !$0.isEmpty }

        return answers.isEmpty ? "（空白记录）" : answers.joined(separator: " · ")
    }
}
