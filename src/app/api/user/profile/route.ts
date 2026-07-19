import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { getAgentProfileByUserId, updateAgentProfile } from "@/lib/user-profile"

export async function GET() {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const profile = await getAgentProfileByUserId(guard.context.userId)
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Failed to load profile:", error)
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const body = await request.json()
    const profile = await updateAgentProfile(guard.context.userId, {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      location: body.location,
      brn: body.brn,
      language: body.language,
      jobTitle: body.jobTitle,
      profileImageUrl: body.profileImageUrl,
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Failed to update profile:", error)
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
  }
}
