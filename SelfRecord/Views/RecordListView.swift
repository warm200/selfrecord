//
//  RecordListView.swift
//  SelfRecord
//
//  主页面：显示所有历史记录，按日期倒序（最新在最上面）。
//  底部中间有一个 “+” 按钮，点击后打开新建记录页面。
//

import SwiftUI
import SwiftData

struct RecordListView: View {
    // SwiftData 的上下文，用来增删数据。
    @Environment(\.modelContext) private var modelContext

    // @Query 会自动从本地数据库读取所有记录，
    // sort 按 createdAt 倒序排列，数据变化时界面会自动刷新。
    @Query(sort: \DailyRecord.createdAt, order: .reverse)
    private var records: [DailyRecord]

    // 控制“新建记录”页面是否弹出。
    @State private var showingEditor = false

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottom) {
                content

                addButton
                    .padding(.bottom, 24)
            }
            .navigationTitle("我的记录")
            .sheet(isPresented: $showingEditor) {
                // record 传 nil 表示这是“新建”模式。
                RecordEditorView()
            }
        }
    }

    // 列表内容：没有记录时显示一段安静的提示，有记录时显示列表。
    @ViewBuilder
    private var content: some View {
        if records.isEmpty {
            ContentUnavailableView(
                "还没有记录",
                systemImage: "square.and.pencil",
                description: Text("点击下方的 + 写下今天")
            )
        } else {
            List {
                ForEach(records) { record in
                    NavigationLink {
                        RecordDetailView(record: record)
                    } label: {
                        RecordRow(record: record)
                    }
                }
                .onDelete(perform: deleteRecords)
            }
            .listStyle(.plain)
        }
    }

    // 底部中间的圆形 “+” 按钮。
    private var addButton: some View {
        Button {
            showingEditor = true
        } label: {
            Image(systemName: "plus")
                .font(.title.weight(.semibold))
                .foregroundStyle(.white)
                .frame(width: 60, height: 60)
                .background(Color.accentColor, in: Circle())
                .shadow(radius: 6, y: 3)
        }
        .accessibilityLabel("新建记录")
    }

    // 在列表里左滑删除记录。
    private func deleteRecords(at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(records[index])
        }
    }
}

// 列表里的单行：上面是日期，下面是简短预览。
struct RecordRow: View {
    let record: DailyRecord

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(record.createdAt.formatted(date: .abbreviated, time: .shortened))
                .font(.headline)

            Text(record.previewText)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(2)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    RecordListView()
        .modelContainer(for: DailyRecord.self, inMemory: true)
}
