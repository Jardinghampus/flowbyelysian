export function generateUrlTemplate(): string {
  return [
    "property_url",
    "https://www.bayut.com/property/details-XXXXX.html",
    "https://www.propertyfinder.ae/en/plp/buy/...",
  ].join("\n")
}

export function generateOwnersTemplate(): string {
  return [
    "unit_number,building_name,property_size,zone",
    "A2201,SOBHA CREEK VISTAS TOWER A,83.01,Al Merkadh",
    "1804,MARINA GATE TOWER 2,120.5,Dubai Marina",
  ].join("\n")
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
