import 'dotenv/config'

const start = 40000
const step = 2000
const end = 80000
const key = process.env.GOOGLE_MAPS_API_KEY
for(let i = start; i < end; i += step){
  const first = i
  const last = Math.min(i + step, end)
  console.log(`env START_INDEX=${first} END_INDEX=${last} GOOGLE_MAPS_API_KEY=${key} yarn geo >log_${first}-${last}.log &`)
}