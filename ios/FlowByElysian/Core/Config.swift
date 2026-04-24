import Foundation

enum Config {
    // Production URL – set to your Vercel deployment
    static let baseURL = URL(string: "https://flowbyelysian.vercel.app/api")!

    // Clerk publishable key – get from Clerk dashboard → API Keys
    // Format: pk_live_XXXX (production) or pk_test_XXXX (development)
    static let clerkPublishableKey = "pk_test_REPLACE_ME"

    // Demo fallback (mirrors web app demo mode)
    static let demoUserID = "demo-user-001"

    enum Timeouts {
        static let request: TimeInterval = 30
        static let resource: TimeInterval = 60
    }
}
