//
//  RecordDetailView.swift
//  SelfRecord
//
//  详情页：查看一条记录的完整内容，并可以编辑或删除。
//

import SwiftUI
import SwiftData

struct RecordDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    // @Bindable 让这条记录在被编辑后，详情页能自动刷新显示。
    @Bindable var record: DailyRecord

    @State private var showingEditor = false
    @State private var showingDeleteAlert = false

    var body: some View {
        List {
            QuestionRow(title: Question.energy, answer: record.energyMoment)
            QuestionRow(title: Question.tired, answer: record.tiredMoment)
            QuestionRow(title: Question.peoplePleasing, answer: record.peoplePleasingMoment)
            QuestionRow(title: Question.trueDesire, answer: record.trueDesire)
            QuestionRow(title: Question.unexpressed, answer: record.unexpressedEmotion)
            QuestionRow(title: Question.selfAction, answer: record.selfAction)

            Section {
                Button(role: .destructive) {
                    showingDeleteAlert = true
                } label: {
                    Label("删除这条记录", systemImage: "trash")
                }
            }
        }
        .navigationTitle(record.createdAt.formatted(date: .abbreviated, time: .shortened))
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("编辑") { showingEditor = true }
            }
        }
        .sheet(isPresented: $showingEditor) {
            RecordEditorView(record: record)
        }
        .alert("确定删除？", isPresented: $showingDeleteAlert) {
            Button("删除", role: .destructive) { delete() }
            Button("取消", role: .cancel) { }
        } message: {
            Text("删除后无法恢复。")
        }
    }

    private func delete() {
        modelContext.delete(record)
        try? modelContext.save()
        dismiss() // 删除后返回主页面。
    }
}

// 详情页里显示单个问题及其答案。
struct QuestionRow: View {
    let title: String
    let answer: String

    var body: some View {
        Section {
            // 答案为空时显示一句灰色占位文字。
            if answer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                Text("（未填写）")
                    .foregroundStyle(.secondary)
            } else {
                Text(answer)
            }
        } header: {
            Text(title)
        }
    }
}

#Preview {
    NavigationStack {
        RecordDetailView(
            record: DailyRecord(
                energyMoment: "早上喝完咖啡之后",
                tiredMoment: "下午开了很久的会",
                trueDesire: "想要一段安静的独处时间"
            )
        )
    }
    .modelContainer(for: DailyRecord.self, inMemory: true)
}
