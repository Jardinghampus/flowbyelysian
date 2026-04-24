import SwiftUI

struct LoginView: View {
    @Environment(AuthManager.self) private var auth
    @State private var email = ""
    @State private var password = ""
    @State private var showPassword = false
    @FocusState private var focus: LoginField?
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        ZStack {
            backgroundGradient

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    LoginHeader()
                        .padding(.top, 72)
                        .padding(.horizontal, AppTheme.Spacing.md)

                    LoginFormCard(
                        email: $email,
                        password: $password,
                        showPassword: $showPassword,
                        focus: $focus
                    )
                    .padding(.top, AppTheme.Spacing.lg)

                    Text("Powered by Clerk · Flow by Elysian © 2026")
                        .font(.footnote)
                        .foregroundStyle(.tertiary)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.top, AppTheme.Spacing.xl)
                        .padding(.bottom, AppTheme.Spacing.xl)
                }
            }
            .scrollBounceBehavior(.basedOnSize)
        }
        .onTapGesture { focus = nil }
    }

    private var backgroundGradient: some View {
        LinearGradient(
            colors: scheme == .dark
                ? [Color(hue: 0.68, saturation: 0.25, brightness: 0.08),
                   Color(hue: 0.72, saturation: 0.30, brightness: 0.14)]
                : [Color(hue: 0.68, saturation: 0.08, brightness: 0.98),
                   Color(hue: 0.70, saturation: 0.12, brightness: 0.94)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }
}

private enum LoginField { case email, password }

// MARK: - Sub-views

private struct LoginHeader: View {
    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            HStack(spacing: AppTheme.Spacing.sm) {
                RoundedRectangle(cornerRadius: 12)
                    .fill(AppTheme.Color.brand.gradient)
                    .frame(width: 44, height: 44)
                    .overlay {
                        Image(systemName: "building.2.fill")
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundStyle(.white)
                    }

                Text("Flow by Elysian")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
            }

            Text("Välkommen tillbaka")
                .font(.title.bold())
                .padding(.top, AppTheme.Spacing.xl)

            Text("Logga in för att se dina listings, klienter och rapporter.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }
}

private struct LoginFormCard: View {
    @Environment(AuthManager.self) private var auth
    @Binding var email: String
    @Binding var password: String
    @Binding var showPassword: Bool
    var focus: FocusState<LoginField?>.Binding
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        VStack(spacing: AppTheme.Spacing.md) {
            EmailField(email: $email, focus: focus)
            PasswordField(password: $password, showPassword: $showPassword, focus: focus) {
                Task { await auth.signIn(email: email, password: password) }
            }

            if let err = auth.errorMessage {
                Label(err, systemImage: "exclamationmark.triangle.fill")
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .transition(.move(edge: .top).combined(with: .opacity))
            }

            SignInButton(email: email, password: password)

            DividerRow()

            AppleSignInButton()
        }
        .padding(AppTheme.Spacing.md)
        .glassCard()
        .padding(.horizontal, AppTheme.Spacing.md)
        .animation(.spring(response: 0.3), value: auth.errorMessage)
    }
}

private struct EmailField: View {
    @Binding var email: String
    var focus: FocusState<LoginField?>.Binding

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("E-post")
                .font(.footnote.bold())
                .foregroundStyle(.secondary)

            HStack(spacing: AppTheme.Spacing.sm) {
                Image(systemName: "envelope")
                    .foregroundStyle(AppTheme.Color.brand)
                    .frame(width: 20)
                TextField("namn@elysian.ae", text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)
                    .focused(focus, equals: .email)
                    .submitLabel(.next)
                    .onSubmit { focus.wrappedValue = .password }
            }
            .padding(AppTheme.Spacing.md)
            .background(.quinary, in: .rect(cornerRadius: AppTheme.Radius.sm))
            .overlay {
                RoundedRectangle(cornerRadius: AppTheme.Radius.sm)
                    .strokeBorder(
                        focus.wrappedValue == .email ? AppTheme.Color.brand : .clear,
                        lineWidth: 1.5
                    )
            }
        }
    }
}

private struct PasswordField: View {
    @Binding var password: String
    @Binding var showPassword: Bool
    var focus: FocusState<LoginField?>.Binding
    let onSubmit: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Lösenord")
                .font(.footnote.bold())
                .foregroundStyle(.secondary)

            HStack(spacing: AppTheme.Spacing.sm) {
                Image(systemName: "lock")
                    .foregroundStyle(AppTheme.Color.brand)
                    .frame(width: 20)

                Group {
                    if showPassword {
                        TextField("••••••••", text: $password)
                    } else {
                        SecureField("••••••••", text: $password)
                    }
                }
                .textContentType(.password)
                .focused(focus, equals: .password)
                .submitLabel(.go)
                .onSubmit(onSubmit)

                Button("", systemImage: showPassword ? "eye.slash" : "eye") {
                    showPassword.toggle()
                }
                .foregroundStyle(.secondary)
                .frame(minWidth: 44, minHeight: 44)
            }
            .padding(AppTheme.Spacing.md)
            .background(.quinary, in: .rect(cornerRadius: AppTheme.Radius.sm))
            .overlay {
                RoundedRectangle(cornerRadius: AppTheme.Radius.sm)
                    .strokeBorder(
                        focus.wrappedValue == .password ? AppTheme.Color.brand : .clear,
                        lineWidth: 1.5
                    )
            }
        }
    }
}

private struct SignInButton: View {
    @Environment(AuthManager.self) private var auth
    let email: String
    let password: String

    var body: some View {
        Button {
            Task { await auth.signIn(email: email, password: password) }
        } label: {
            Group {
                if auth.isLoading {
                    ProgressView().tint(.white)
                } else {
                    Text("Logga in")
                        .font(.body.bold())
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .foregroundStyle(.white)
        }
        .background(AppTheme.Color.brand.gradient, in: .rect(cornerRadius: AppTheme.Radius.sm))
        .shadow(color: AppTheme.Color.brand.opacity(0.4), radius: 10, y: 4)
        .disabled(auth.isLoading || email.isEmpty || password.isEmpty)
        .sensoryFeedback(.success, trigger: auth.state == .authenticated)
    }
}

private struct DividerRow: View {
    var body: some View {
        HStack {
            Rectangle().fill(.separator).frame(height: 0.5)
            Text("eller")
                .font(.footnote)
                .foregroundStyle(.tertiary)
            Rectangle().fill(.separator).frame(height: 0.5)
        }
    }
}

private struct AppleSignInButton: View {
    @Environment(AuthManager.self) private var auth
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        Button {
            // TODO: Replace with SignInWithAppleButton from AuthenticationServices
            Task { await auth.signIn(email: "apple@elysian.ae", password: "apple123") }
        } label: {
            HStack(spacing: AppTheme.Spacing.sm) {
                Image(systemName: "apple.logo")
                Text("Fortsätt med Apple")
                    .font(.body.bold())
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .foregroundStyle(scheme == .dark ? .black : .white)
        }
        .background(scheme == .dark ? .white : .black, in: .rect(cornerRadius: AppTheme.Radius.sm))
    }
}
