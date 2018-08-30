import 'dotenv/config'

const start = parseInt(process.env.START_INDEX)
const end = parseInt(process.env.END_INDEX)
const step = parseInt(process.env.STEP)
const key = process.env.GOOGLE_MAPS_API_KEY
for(let i = start; i < end; i += step){
  const first = i
  const last = Math.min(i + step, end)
  console.log(`env START_INDEX=${first} END_INDEX=${last} GOOGLE_MAPS_API_KEY=${key} yarn geo >log_${first}-${last}.log &`)
}