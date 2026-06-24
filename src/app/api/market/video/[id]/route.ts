import { exec } from "child_process"
import { promisify } from "util"
import { mkdir as mkdirAsync, access as accessAsync, stat as statAsync, readFile } from "fs/promises"
import { tmpdir } from "os"
import path from "path"
import { NextRequest, NextResponse } from "next/server"

const execAsync = promisify(exec)

const FFMPEG = "C:\\Users\\jardi\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-full_build\\bin\\ffmpeg.exe"

interface Community {
  id: string
  community: string
  subCommunity: string
  propertyType: string
  transactionType: string
}

// ponytail: inline — this data is static and tiny, no DB round-trip needed
const communities: Community[] = [
  {"id":"ar1-saheel-villa-sale","community":"Arabian Ranches 1","subCommunity":"Saheel","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar1-saheel-townhouse-rent","community":"Arabian Ranches 1","subCommunity":"Saheel","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"ar1-mirador-villa-sale","community":"Arabian Ranches 1","subCommunity":"Mirador","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar1-mirador-villa-rent","community":"Arabian Ranches 1","subCommunity":"Mirador","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar1-al-reem-townhouse-sale","community":"Arabian Ranches 1","subCommunity":"Al Reem","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"ar1-al-reem-townhouse-rent","community":"Arabian Ranches 1","subCommunity":"Al Reem","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"ar1-palmera-townhouse-sale","community":"Arabian Ranches 1","subCommunity":"Palmera","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"ar1-palmera-townhouse-rent","community":"Arabian Ranches 1","subCommunity":"Palmera","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"ar1-alvorada-villa-sale","community":"Arabian Ranches 1","subCommunity":"Alvorada","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar1-alvorada-villa-rent","community":"Arabian Ranches 1","subCommunity":"Alvorada","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar1-aseel-villa-sale","community":"Arabian Ranches 1","subCommunity":"Aseel","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar1-aseel-villa-rent","community":"Arabian Ranches 1","subCommunity":"Aseel","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar1-al-mahra-villa-sale","community":"Arabian Ranches 1","subCommunity":"Al Mahra","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar1-al-mahra-villa-rent","community":"Arabian Ranches 1","subCommunity":"Al Mahra","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar2-casa-villa-sale","community":"Arabian Ranches 2","subCommunity":"Casa","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar2-casa-villa-rent","community":"Arabian Ranches 2","subCommunity":"Casa","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar2-lila-villa-sale","community":"Arabian Ranches 2","subCommunity":"Lila","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar2-lila-villa-rent","community":"Arabian Ranches 2","subCommunity":"Lila","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar2-palma-villa-sale","community":"Arabian Ranches 2","subCommunity":"Palma","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar2-palma-villa-rent","community":"Arabian Ranches 2","subCommunity":"Palma","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar2-rasha-villa-sale","community":"Arabian Ranches 2","subCommunity":"Rasha","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar2-rasha-villa-rent","community":"Arabian Ranches 2","subCommunity":"Rasha","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar2-rosa-villa-sale","community":"Arabian Ranches 2","subCommunity":"Rosa","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar2-rosa-villa-rent","community":"Arabian Ranches 2","subCommunity":"Rosa","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar2-yasmin-villa-sale","community":"Arabian Ranches 2","subCommunity":"Yasmin","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar2-yasmin-villa-rent","community":"Arabian Ranches 2","subCommunity":"Yasmin","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar2-samara-villa-sale","community":"Arabian Ranches 2","subCommunity":"Samara","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar2-samara-villa-rent","community":"Arabian Ranches 2","subCommunity":"Samara","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar2-azalea-villa-sale","community":"Arabian Ranches 2","subCommunity":"Azalea","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar2-azalea-villa-rent","community":"Arabian Ranches 2","subCommunity":"Azalea","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar2-reem-townhouse-sale","community":"Arabian Ranches 2","subCommunity":"Reem","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"ar2-reem-townhouse-rent","community":"Arabian Ranches 2","subCommunity":"Reem","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"ar2-camelia-townhouse-sale","community":"Arabian Ranches 2","subCommunity":"Camelia","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"ar2-camelia-townhouse-rent","community":"Arabian Ranches 2","subCommunity":"Camelia","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"ar3-caya-villa-sale","community":"Arabian Ranches 3","subCommunity":"Caya","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar3-caya-villa-rent","community":"Arabian Ranches 3","subCommunity":"Caya","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar3-bliss-villa-sale","community":"Arabian Ranches 3","subCommunity":"Bliss","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar3-bliss-villa-rent","community":"Arabian Ranches 3","subCommunity":"Bliss","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar3-june-villa-sale","community":"Arabian Ranches 3","subCommunity":"June","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar3-june-villa-rent","community":"Arabian Ranches 3","subCommunity":"June","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar3-anya-villa-sale","community":"Arabian Ranches 3","subCommunity":"Anya","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar3-anya-villa-rent","community":"Arabian Ranches 3","subCommunity":"Anya","propertyType":"Villa","transactionType":"Rent"},
  {"id":"ar3-sun-villa-sale","community":"Arabian Ranches 3","subCommunity":"Sun","propertyType":"Villa","transactionType":"Sale"},
  {"id":"ar3-sun-villa-rent","community":"Arabian Ranches 3","subCommunity":"Sun","propertyType":"Villa","transactionType":"Rent"},
  {"id":"mudon-arabella-townhouse-sale","community":"Mudon","subCommunity":"Arabella","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"mudon-arabella-townhouse-rent","community":"Mudon","subCommunity":"Arabella","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"mudon-arabella-villa-sale","community":"Mudon","subCommunity":"Arabella","propertyType":"Villa","transactionType":"Sale"},
  {"id":"mudon-arabella-villa-rent","community":"Mudon","subCommunity":"Arabella","propertyType":"Villa","transactionType":"Rent"},
  {"id":"mudon-al-ranim-townhouse-sale","community":"Mudon","subCommunity":"Al Ranim","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"mudon-al-ranim-townhouse-rent","community":"Mudon","subCommunity":"Al Ranim","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"mudon-rahat-villa-sale","community":"Mudon","subCommunity":"Rahat","propertyType":"Villa","transactionType":"Sale"},
  {"id":"mudon-rahat-villa-rent","community":"Mudon","subCommunity":"Rahat","propertyType":"Villa","transactionType":"Rent"},
  {"id":"mudon-al-naseem-villa-sale","community":"Mudon","subCommunity":"Al Naseem","propertyType":"Villa","transactionType":"Sale"},
  {"id":"mudon-al-naseem-villa-rent","community":"Mudon","subCommunity":"Al Naseem","propertyType":"Villa","transactionType":"Rent"},
  {"id":"dh-topanga-villa-sale","community":"Damac Hills","subCommunity":"Topanga","propertyType":"Villa","transactionType":"Sale"},
  {"id":"dh-topanga-villa-rent","community":"Damac Hills","subCommunity":"Topanga","propertyType":"Villa","transactionType":"Rent"},
  {"id":"dh-pelham-villa-sale","community":"Damac Hills","subCommunity":"Pelham","propertyType":"Villa","transactionType":"Sale"},
  {"id":"dh-pelham-villa-rent","community":"Damac Hills","subCommunity":"Pelham","propertyType":"Villa","transactionType":"Rent"},
  {"id":"dh-the-field-townhouse-sale","community":"Damac Hills","subCommunity":"The Field","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"dh-the-field-townhouse-rent","community":"Damac Hills","subCommunity":"The Field","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"dh-silver-springs-villa-sale","community":"Damac Hills","subCommunity":"Silver Springs","propertyType":"Villa","transactionType":"Sale"},
  {"id":"dh-silver-springs-villa-rent","community":"Damac Hills","subCommunity":"Silver Springs","propertyType":"Villa","transactionType":"Rent"},
  {"id":"dh-whitefield-townhouse-sale","community":"Damac Hills","subCommunity":"Whitefield","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"dh-whitefield-townhouse-rent","community":"Damac Hills","subCommunity":"Whitefield","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"ts-hayat-townhouse-sale","community":"Town Square","subCommunity":"Hayat","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"ts-hayat-townhouse-rent","community":"Town Square","subCommunity":"Hayat","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"ts-noor-townhouse-sale","community":"Town Square","subCommunity":"Noor","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"ts-noor-townhouse-rent","community":"Town Square","subCommunity":"Noor","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"ts-naseem-townhouse-sale","community":"Town Square","subCommunity":"Naseem","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"ts-naseem-townhouse-rent","community":"Town Square","subCommunity":"Naseem","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"ts-reem-townhouse-sale","community":"Town Square","subCommunity":"Reem","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"ts-reem-townhouse-rent","community":"Town Square","subCommunity":"Reem","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"ts-safi-townhouse-sale","community":"Town Square","subCommunity":"Safi","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"ts-safi-townhouse-rent","community":"Town Square","subCommunity":"Safi","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"dhe-maple-townhouse-sale","community":"Dubai Hills Estate","subCommunity":"Maple","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"dhe-maple-townhouse-rent","community":"Dubai Hills Estate","subCommunity":"Maple","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"dhe-sidra-villa-sale","community":"Dubai Hills Estate","subCommunity":"Sidra Villas","propertyType":"Villa","transactionType":"Sale"},
  {"id":"dhe-sidra-villa-rent","community":"Dubai Hills Estate","subCommunity":"Sidra Villas","propertyType":"Villa","transactionType":"Rent"},
  {"id":"dhe-golf-place-villa-sale","community":"Dubai Hills Estate","subCommunity":"Golf Place","propertyType":"Villa","transactionType":"Sale"},
  {"id":"dhe-golf-place-villa-rent","community":"Dubai Hills Estate","subCommunity":"Golf Place","propertyType":"Villa","transactionType":"Rent"},
  {"id":"dhe-fairway-villa-sale","community":"Dubai Hills Estate","subCommunity":"Fairway Vistas","propertyType":"Villa","transactionType":"Sale"},
  {"id":"dhe-fairway-villa-rent","community":"Dubai Hills Estate","subCommunity":"Fairway Vistas","propertyType":"Villa","transactionType":"Rent"},
  {"id":"vn-amaranta-townhouse-sale","community":"Villa Nova","subCommunity":"Amaranta","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"vn-amaranta-townhouse-rent","community":"Villa Nova","subCommunity":"Amaranta","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"vn-la-rosa-townhouse-sale","community":"Villa Nova","subCommunity":"La Rosa","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"vn-la-rosa-townhouse-rent","community":"Villa Nova","subCommunity":"La Rosa","propertyType":"Townhouse","transactionType":"Rent"},
  {"id":"vn-la-quinta-villa-sale","community":"Villa Nova","subCommunity":"La Quinta","propertyType":"Villa","transactionType":"Sale"},
  {"id":"vn-la-quinta-villa-rent","community":"Villa Nova","subCommunity":"La Quinta","propertyType":"Villa","transactionType":"Rent"},
  {"id":"vn-la-violeta-townhouse-sale","community":"Villa Nova","subCommunity":"La Violeta","propertyType":"Townhouse","transactionType":"Sale"},
  {"id":"vn-la-violeta-townhouse-rent","community":"Villa Nova","subCommunity":"La Violeta","propertyType":"Townhouse","transactionType":"Rent"},
]

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/:/g, "\\:").replace(/\[/g, "\\[").replace(/\]/g, "\\]")
}

async function generateVideo(entry: Community, outPath: string): Promise<void> {
  const txLabel = entry.transactionType === "Sale" ? "FOR SALE" : "FOR RENT"
  const txColor = entry.transactionType === "Sale" ? "0x2563EB" : "0x16A34A"
  const dateStr = new Date().toLocaleDateString("en-AE", { month: "short", year: "numeric" })

  const drawtext = [
    `drawtext=text='ZAYLO':fontsize=36:fontcolor=0x999999:x=(w-text_w)/2:y=140:font=Arial:fontweight=bold:enable='gte(t,0.3)'`,
    `drawbox=x=400:y=200:w=280:h=3:color=0xE5E7EB:t=fill:enable='gte(t,0.4)'`,
    `drawtext=text='${esc(txLabel)}':fontsize=28:fontcolor=white:x=(w-text_w)/2:y=260:font=Arial:fontweight=bold:box=1:boxcolor=${txColor}:boxborderw=18:enable='gte(t,0.5)'`,
    `drawtext=text='${esc(entry.subCommunity)}':fontsize=108:fontcolor=0x111111:x=(w-text_w)/2:y=380:font=Arial:fontweight=bold:enable='gte(t,0.7)'`,
    `drawtext=text='${esc(entry.community)}':fontsize=48:fontcolor=0x555555:x=(w-text_w)/2:y=520:font=Arial:enable='gte(t,0.9)'`,
    `drawtext=text='${esc(entry.propertyType)}':fontsize=36:fontcolor=0x888888:x=(w-text_w)/2:y=600:font=Arial:enable='gte(t,1.0)'`,
    `drawbox=x=340:y=680:w=400:h=2:color=0xE5E7EB:t=fill:enable='gte(t,1.1)'`,
    `drawtext=text='Market Analysis':fontsize=32:fontcolor=0xAAAAAA:x=(w-text_w)/2:y=710:font=Arial:enable='gte(t,1.2)'`,
    `drawtext=text='${esc(dateStr)}':fontsize=28:fontcolor=0xBBBBBB:x=(w-text_w)/2:y=760:font=Arial:enable='gte(t,1.3)'`,
    `drawtext=text='Data sourced from Bayut':fontsize=26:fontcolor=0xCCCCCC:x=(w-text_w)/2:y=1800:font=Arial:enable='gte(t,2.0)'`,
  ].join(",")

  const cmd = `"${FFMPEG}" -y -f lavfi -i color=c=white:size=1080x1920:rate=30 -vf "${drawtext}" -t 13 -c:v libx264 -preset fast -pix_fmt yuv420p "${outPath}"`
  await execAsync(cmd, { shell: "cmd.exe", timeout: 60000 })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const entry = communities.find((c) => c.id === id)
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const videosDir = path.join(tmpdir(), "zaylo-videos")
  await mkdirAsync(videosDir, { recursive: true })
  const outPath = path.join(videosDir, `${id}.mp4`)

  // Generate if not cached
  let exists = false
  try { await accessAsync(outPath); exists = true } catch {}
  if (!exists) {
    try {
      await generateVideo(entry, outPath)
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 })
    }
  }

  const fileStat = await statAsync(outPath)
  const fileBuffer = await readFile(outPath)

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${id}.mp4"`,
      "Content-Length": String(fileStat.size),
    },
  })
}
