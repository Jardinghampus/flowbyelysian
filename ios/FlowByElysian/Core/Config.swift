import Foundation

enum Config {
    // Byt till din produktions-URL när du deployar
    static let baseURL = URL(string: "https://flowbyelysian.vercel.app/api")!

    // Demo-auth matchar web-appens demo-läge
    static let demoUserID = "demo-user-001"
    static let demoEmail = "jardinghampus@gmail.com"

    enum Timeouts {
        static let request: TimeInterval = 30
        static let resource: TimeInterval = 60
    }
}
