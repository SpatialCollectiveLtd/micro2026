const cron = require('node-cron')
const http = require('http')

const URL = process.env.CRON_ENDPOINT || 'http://localhost:3000/api/admin/cron/run-daily-jobs'
const SECRET = process.env.CRON_SECRET || ''

function callEndpoint() {
  return new Promise((resolve) => {
    const req = http.request(URL, { method: 'POST', headers: { 'x-cron-secret': SECRET } }, (res) => {
      res.on('data', () => {})
      res.on('end', resolve)
    })
    req.on('error', resolve)
    req.end()
  })
}

// 7 PM every day server local time
cron.schedule('0 19 * * *', async () => {
  await callEndpoint()
})

console.log('Cron runner started: will trigger nightly jobs at 19:00 daily')