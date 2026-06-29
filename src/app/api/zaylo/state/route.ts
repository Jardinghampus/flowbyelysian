import { NextResponse } from "next/server"
import { getZayloState } from "@/lib/zaylo/control"

export async function GET() {
  try {
    return NextResponse.json(await getZayloState())
  } catch (error) {
    console.error("Failed to read Zaylo state", error)
    return NextResponse.json({ error: "Failed to read Zaylo state" }, { status: 500 })
  }
}
