import SwiftUI

// MARK: - Toast model

struct Toast: Identifiable, Sendable {
    enum Style { case success, error, info, warning }

    let id = UUID()
    let message: String
    let style: Style
    var duration: TimeInterval = 2.8

    var icon: String {
        switch style {
        case .success: "checkmark.circle.fill"
        case .error:   "xmark.circle.fill"
        case .info:    "info.circle.fill"
        case .warning: "exclamationmark.triangle.fill"
        }
    }

    var tint: Color {
        switch style {
        case .success: .zGreen
        case .error:   .zRed
        case .info:    .zBlue
        case .warning: .zAmber
        }
    }
}

// MARK: - Toast manager

@Observable @MainActor
final class ToastManager {
    static let shared = ToastManager()
    private(set) var current: Toast?
    private var dismissTask: Task<Void, Never>?

    func show(_ message: String, style: Toast.Style = .info) {
        dismissTask?.cancel()
        withAnimation(DS.Anim.standard) {
            current = Toast(message: message, style: style)
        }
        dismissTask = Task {
            try? await Task.sleep(for: .seconds(current?.duration ?? 2.8))
            guard !Task.isCancelled else { return }
            withAnimation(DS.Anim.standard) { current = nil }
        }
    }

    func success(_ msg: String) { show(msg, style: .success) }
    func error(_ msg: String)   { show(msg, style: .error)   }
    func warning(_ msg: String) { show(msg, style: .warning) }

    func dismiss() {
        dismissTask?.cancel()
        withAnimation(DS.Anim.standard) { current = nil }
    }
}

// MARK: - Toast overlay view

struct ToastOverlay: View {
    @State private var manager = ToastManager.shared

    var body: some View {
        Group {
            if let toast = manager.current {
                ToastView(toast: toast) { manager.dismiss() }
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                    .zIndex(999)
            }
        }
        .animation(DS.Anim.standard, value: manager.current?.id)
    }
}

private struct ToastView: View {
    let toast: Toast
    let onDismiss: () -> Void

    var body: some View {
        HStack(spacing: DS.Spacing.sm) {
            Image(systemName: toast.icon)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(toast.tint)

            Text(toast.message)
                .font(AppFont.body(14, weight: .medium))
                .foregroundStyle(.primary)
                .lineLimit(2)

            Spacer()

            Button(action: onDismiss) {
                Image(systemName: "xmark")
                    .font(.caption.bold())
                    .foregroundStyle(.secondary)
            }
        }
        .padding(DS.Spacing.md)
        .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.lg))
        .overlay {
            RoundedRectangle(cornerRadius: DS.Radius.lg)
                .strokeBorder(toast.tint.opacity(0.3), lineWidth: 0.5)
        }
        .shadow(color: .black.opacity(0.35), radius: 20, y: 8)
        .padding(.horizontal, DS.Spacing.base)
        .padding(.bottom, DS.Spacing.xxl)
        .contentShape(.rect)
        .onTapGesture { onDismiss() }
    }
}

// MARK: - View modifier

extension View {
    func toastOverlay() -> some View {
        overlay(alignment: .bottom) { ToastOverlay() }
    }
}
