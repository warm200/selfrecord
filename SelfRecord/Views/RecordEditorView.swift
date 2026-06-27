//
//  RecordEditorView.swift
//  SelfRecord
//
//  新建 / 编辑记录页面。
//  - 当 record == nil 时：是“新建”，保存时创建一条新记录。
//  - 当 record 有值时：是“编辑”，保存时更新这条已有的记录。
//

import SwiftUI
import SwiftData

struct RecordEditorView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    // 要编辑的记录；nil 表示新建。
    private let record: DailyRecord?

    // 用 @State 暂存输入框里的文字，保存时再写回数据库。
    @State private var energyMoment: String
    @State private var tiredMoment: String
    @State private var peoplePleasingMoment: String
    @State private var trueDesire: String
    @State private var unexpressedEmotion: String
    @State private var selfAction: String

    // 自定义初始化：如果传入了已有记录，就用它的内容填充输入框。
    init(record: DailyRecord? = nil) {
        self.record = record
        _energyMoment = State(initialValue: record?.energyMoment ?? "")
        _tiredMoment = State(initialValue: record?.tiredMoment ?? "")
        _peoplePleasingMoment = State(initialValue: record?.peoplePleasingMoment ?? "")
        _trueDesire = State(initialValue: record?.trueDesire ?? "")
        _unexpressedEmotion = State(initialValue: record?.unexpressedEmotion ?? "")
        _selfAction = State(initialValue: record?.selfAction ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                QuestionField(title: Question.energy, text: $energyMoment)
                QuestionField(title: Question.tired, text: $tiredMoment)
                QuestionField(title: Question.peoplePleasing, text: $peoplePleasingMoment)
                QuestionField(title: Question.trueDesire, text: $trueDesire)
                QuestionField(title: Question.unexpressed, text: $unexpressedEmotion)
                QuestionField(title: Question.selfAction, text: $selfAction)
            }
            .navigationTitle(record == nil ? "新建记录" : "编辑记录")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") { save() }
                }
            }
        }
    }

    private func save() {
        if let record {
            // 编辑模式：更新已有记录（保留原来的创建时间）。
            record.energyMoment = energyMoment
            record.tiredMoment = tiredMoment
            record.peoplePleasingMoment = peoplePleasingMoment
            record.trueDesire = trueDesire
            record.unexpressedEmotion = unexpressedEmotion
            record.selfAction = selfAction
        } else {
            // 新建模式：创建一条新记录并插入数据库。
            let newRecord = DailyRecord(
                energyMoment: energyMoment,
                tiredMoment: tiredMoment,
                peoplePleasingMoment: peoplePleasingMoment,
                trueDesire: trueDesire,
                unexpressedEmotion: unexpressedEmotion,
                selfAction: selfAction
            )
            modelContext.insert(newRecord)
        }

        // SwiftData 通常会自动保存，这里再保存一次更稳妥。
        try? modelContext.save()
        dismiss()
    }
}

// 单个问题：上面一行问题文字，下面一个可多行输入的文本框。
struct QuestionField: View {
    let title: String
    @Binding var text: String

    var body: some View {
        Section {
            TextField("在这里写下你的答案…", text: $text, axis: .vertical)
                .lineLimit(3...8)
        } header: {
            Text(title)
        }
    }
}

#Preview {
    RecordEditorView()
        .modelContainer(for: DailyRecord.self, inMemory: true)
}
