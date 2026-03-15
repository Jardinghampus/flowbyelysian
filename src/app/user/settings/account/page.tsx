import AccountForm from "./account-form"

// Force dynamic rendering to prevent prerendering issues with Clerk
export const dynamic = "force-dynamic"

export default function AccountSettingsPage() {
  return <AccountForm />
}
