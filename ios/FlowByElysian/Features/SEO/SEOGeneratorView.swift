import SwiftUI

struct SEOGeneratorView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var vm = SEOGeneratorViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: DS.Spacing.xl) {
                    inputSection
                    attributeSection
                    if let result = vm.result {
                        resultSection(result)
                    }
                    if let err = vm.errorMessage {
                        Label(err, systemImage: "exclamationmark.triangle.fill")
                            .font(AppFont.body(13))
                            .foregroundStyle(Color.zRed)
                            .padding(DS.Spacing.md)
                            .background(Color.zRed.opacity(0.08), in: .rect(cornerRadius: DS.Radius.md))
                    }
                }
                .padding(DS.Spacing.base)
                .padding(.bottom, DS.Spacing.xxxl)
            }
            .background(Color.zBg.ignoresSafeArea())
            .navigationTitle("SEO Generator")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") { dismiss() }.tint(.secondary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    if vm.isGenerating {
                        ProgressView()
                    } else {
                        Button("Generate", action: { Task { await vm.generate() } })
                            .fontWeight(.semibold)
                            .tint(Color.zBlue)
                            .disabled(vm.originalText.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                }
            }
        }
    }

    private var inputSection: some View {
        FormCard(title: "Property Description") {
            ZStack(alignment: .topLeading) {
                TextEditor(text: Bindable(vm).originalText)
                    .font(AppFont.body(15))
                    .frame(minHeight: 120)
                    .scrollContentBackground(.hidden)
                    .padding(DS.Spacing.md)
                if vm.originalText.isEmpty {
                    Text("Describe the property: location, specs, unique features…")
                        .font(AppFont.body(15))
                        .foregroundStyle(.tertiary)
                        .padding(DS.Spacing.md + 5)
                        .allowsHitTesting(false)
                }
            }
            .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
            .overlay {
                RoundedRectangle(cornerRadius: DS.Radius.md)
                    .strokeBorder(Color.zBorderSubtle, lineWidth: 0.5)
            }
        }
    }

    private var attributeSection: some View {
        VStack(spacing: DS.Spacing.lg) {
            ChipSelector(title: "Target Audience",
                         options: ["Investors", "End Users", "Expats", "Families", "Young Professionals"],
                         selected: Bindable(vm).targetAudience)
            ChipSelector(title: "Tone",
                         options: ["Luxury", "Professional", "Approachable", "Urgent", "Exclusive"],
                         selected: Bindable(vm).tone)
            ChipSelector(title: "Key Features",
                         options: ["Private Pool", "Sea View", "Fully Furnished", "Maid's Room",
                                   "Smart Home", "Private Gym", "Beach Access", "Upgraded"],
                         selected: Bindable(vm).features)
            ChipSelector(title: "Purpose",
                         options: ["Sale", "Rent", "Investment", "Holiday Home"],
                         selected: Bindable(vm).purpose)
        }
    }

    private func resultSection(_ text: String) -> some View {
        FormCard(title: "Optimised Description") {
            VStack(alignment: .leading, spacing: DS.Spacing.md) {
                Text(text)
                    .font(AppFont.body(14))
                    .foregroundStyle(.primary)
                    .lineSpacing(4)

                HStack(spacing: DS.Spacing.sm) {
                    Spacer()
                    Button {
                        UIPasteboard.general.string = text
                        ToastManager.shared.success("Copied to clipboard")
                    } label: {
                        Label("Copy", systemImage: "doc.on.doc")
                            .font(AppFont.body(13, weight: .medium))
                    }
                    .tint(Color.zBlue)
                    .buttonStyle(LiquidButtonStyle())
                }
            }
            .padding(DS.Spacing.md)
            .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
            .overlay {
                RoundedRectangle(cornerRadius: DS.Radius.md)
                    .strokeBorder(Color.zBlue.opacity(0.3), lineWidth: 1)
            }
        }
    }
}

// MARK: - Multi-select chip group

private struct ChipSelector: View {
    let title: String
    let options: [String]
    @Binding var selected: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Spacing.sm) {
            Text(title)
                .font(AppFont.label(11))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
                .tracking(0.8)

            FlowLayout(spacing: DS.Spacing.sm) {
                ForEach(options, id: \.self) { opt in
                    let isOn = selected.contains(opt)
                    Button(opt) {
                        withAnimation(DS.Anim.quick) {
                            if isOn { selected.removeAll { $0 == opt } }
                            else    { selected.append(opt) }
                        }
                    }
                    .font(AppFont.body(13, weight: isOn ? .semibold : .regular))
                    .foregroundStyle(isOn ? .white : .primary)
                    .padding(.horizontal, DS.Spacing.md)
                    .padding(.vertical, DS.Spacing.sm - 2)
                    .background(isOn ? Color.zBlue : Color.zCard, in: Capsule())
                    .overlay {
                        Capsule().strokeBorder(isOn ? Color.clear : Color.zBorderDefault, lineWidth: 0.5)
                    }
                    .buttonStyle(LiquidButtonStyle())
                }
            }
        }
    }
}

// MARK: - Simple flow layout for chips

private struct FlowLayout: Layout {
    var spacing: CGFloat

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxW = proposal.width ?? 300
        var x: CGFloat = 0, y: CGFloat = 0, rowH: CGFloat = 0
        for v in subviews {
            let s = v.sizeThatFits(.unspecified)
            if x + s.width > maxW && x > 0 { x = 0; y += rowH + spacing; rowH = 0 }
            rowH = max(rowH, s.height)
            x += s.width + spacing
        }
        return CGSize(width: maxW, height: y + rowH)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX, y = bounds.minY, rowH: CGFloat = 0
        for v in subviews {
            let s = v.sizeThatFits(.unspecified)
            if x + s.width > bounds.maxX && x > bounds.minX { x = bounds.minX; y += rowH + spacing; rowH = 0 }
            v.place(at: .init(x: x, y: y), proposal: .init(s))
            rowH = max(rowH, s.height)
            x += s.width + spacing
        }
    }
}

// MARK: - ViewModel

@Observable @MainActor
final class SEOGeneratorViewModel {
    var originalText = ""
    var targetAudience: [String] = []
    var tone: [String] = []
    var features: [String] = []
    var purpose: [String] = []

    private(set) var result: String?
    private(set) var isGenerating = false
    private(set) var errorMessage: String?

    private let api = APIClient.shared

    func generate() async {
        guard !originalText.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        isGenerating = true
        errorMessage = nil
        defer { isGenerating = false }

        do {
            let payload = SEOPayload(
                originalText: originalText,
                targetAudience: targetAudience.isEmpty ? nil : targetAudience,
                community: nil,
                features: features.isEmpty ? nil : features,
                purpose: purpose.isEmpty ? nil : purpose,
                tone: tone.isEmpty ? nil : tone
            )
            let response: SEOResponse = try await api.post("generate", body: payload)
            result = response.optimizedText
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

private struct SEOPayload: Encodable {
    let originalText: String
    let targetAudience: [String]?
    let community: [String]?
    let features: [String]?
    let purpose: [String]?
    let tone: [String]?
}

private struct SEOResponse: Decodable {
    let optimizedText: String
}
