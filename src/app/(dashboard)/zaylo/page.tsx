import { getZayloState } from "@/lib/zaylo/control"
import { ZayloControlCenter } from "./components/zaylo-control-center"

export default async function ZayloPage() {
  const state = await getZayloState()

  return (
    <div className="px-4 lg:px-6">
      <ZayloControlCenter initialState={state} />
    </div>
  )
}
