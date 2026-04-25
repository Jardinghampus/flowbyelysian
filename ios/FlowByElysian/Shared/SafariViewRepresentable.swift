import SwiftUI
import SafariServices

struct SafariViewRepresentable: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        let config = SFSafariViewController.Configuration()
        config.entersReaderIfAvailable = false
        let vc = SFSafariViewController(url: url, configuration: config)
        vc.preferredControlTintColor = UIColor.systemIndigo
        return vc
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}
