import SwiftUI

// MARK: - Floating label text field (Revolut-style)

struct FloatingLabelTextField: View {
    let label: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default
    var autocapitalization: TextInputAutocapitalization = .sentences
    var isSecure: Bool = false
    var icon: String? = nil

    @FocusState private var isFocused: Bool
    private var isActive: Bool { isFocused || !text.isEmpty }

    var body: some View {
        ZStack(alignment: .leading) {
            // Floating label
            Text(label)
                .font(isActive ? AppFont.label(11) : AppFont.body(15))
                .foregroundStyle(isFocused ? Color.zBlue : .secondary)
                .offset(y: isActive ? -18 : 0)
                .animation(DS.Anim.quick, value: isActive)

            HStack(spacing: DS.Spacing.sm) {
                if let icon {
                    Image(systemName: icon)
                        .font(.subheadline)
                        .foregroundStyle(isFocused ? Color.zBlue : .secondary)
                        .animation(DS.Anim.quick, value: isFocused)
                }

                Group {
                    if isSecure {
                        SecureField("", text: $text)
                    } else {
                        TextField("", text: $text)
                            .keyboardType(keyboardType)
                            .textInputAutocapitalization(autocapitalization)
                    }
                }
                .font(AppFont.body(16))
                .focused($isFocused)
                .offset(y: isActive ? 8 : 0)
                .animation(DS.Anim.quick, value: isActive)
            }
        }
        .padding(.horizontal, DS.Spacing.md)
        .padding(.top, isActive ? DS.Spacing.md + 4 : DS.Spacing.md)
        .padding(.bottom, DS.Spacing.sm + 2)
        .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
        .overlay {
            RoundedRectangle(cornerRadius: DS.Radius.md)
                .strokeBorder(
                    isFocused ? Color.zBlue : Color.zBorderSubtle,
                    lineWidth: isFocused ? 1.5 : 0.5
                )
                .animation(DS.Anim.quick, value: isFocused)
        }
        .contentShape(.rect)
        .onTapGesture { isFocused = true }
    }
}

// MARK: - Currency field

struct CurrencyTextField: View {
    let label: String
    @Binding var value: Double?
    var currency: String = "AED"

    @State private var text: String = ""
    @FocusState private var isFocused: Bool
    private var isActive: Bool { isFocused || !text.isEmpty }

    var body: some View {
        ZStack(alignment: .leading) {
            Text(label)
                .font(isActive ? AppFont.label(11) : AppFont.body(15))
                .foregroundStyle(isFocused ? Color.zBlue : .secondary)
                .offset(y: isActive ? -18 : 0)
                .animation(DS.Anim.quick, value: isActive)

            HStack(spacing: DS.Spacing.xs) {
                Text(currency)
                    .font(AppFont.body(13, weight: .semibold))
                    .foregroundStyle(isFocused ? Color.zBlue : .secondary)
                    .opacity(isActive ? 1 : 0)
                    .animation(DS.Anim.quick, value: isActive)

                TextField("", text: $text)
                    .keyboardType(.decimalPad)
                    .font(AppFont.body(16))
                    .focused($isFocused)
                    .offset(y: isActive ? 8 : 0)
                    .animation(DS.Anim.quick, value: isActive)
                    .onChange(of: text) { _, new in
                        value = Double(new.replacingOccurrences(of: ",", with: "."))
                    }
            }
        }
        .padding(.horizontal, DS.Spacing.md)
        .padding(.top, isActive ? DS.Spacing.md + 4 : DS.Spacing.md)
        .padding(.bottom, DS.Spacing.sm + 2)
        .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
        .overlay {
            RoundedRectangle(cornerRadius: DS.Radius.md)
                .strokeBorder(
                    isFocused ? Color.zBlue : Color.zBorderSubtle,
                    lineWidth: isFocused ? 1.5 : 0.5
                )
                .animation(DS.Anim.quick, value: isFocused)
        }
        .contentShape(.rect)
        .onTapGesture { isFocused = true }
        .onAppear {
            if let v = value { text = String(Int(v)) }
        }
    }
}

// MARK: - Tab stepper (segmented-style integer picker)

struct TabStepper: View {
    let label: String
    @Binding var value: Int
    let options: [Int]

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Spacing.xs) {
            Text(label)
                .font(AppFont.label(11))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)

            ScrollView(.horizontal) {
                HStack(spacing: DS.Spacing.xs) {
                    ForEach(options, id: \.self) { opt in
                        Button {
                            withAnimation(DS.Anim.quick) { value = opt }
                        } label: {
                            Text(opt == 0 ? "Any" : "\(opt)")
                                .font(AppFont.body(14, weight: value == opt ? .semibold : .regular))
                                .foregroundStyle(value == opt ? .white : .secondary)
                                .frame(minWidth: 40, minHeight: 36)
                                .background(
                                    value == opt ? AnyShapeStyle(Color.zBlue) : AnyShapeStyle(Color.zCard),
                                    in: .rect(cornerRadius: DS.Radius.sm)
                                )
                        }
                        .buttonStyle(LiquidButtonStyle())
                        .sensoryFeedback(.selection, trigger: value)
                    }
                }
            }
            .scrollIndicators(.hidden)
        }
    }
}
