const pcm = require('pcm')

const wss = new (require('ws').Server)({
  server: require('http')
    .createServer(function(req, res) {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(require('fs').readFileSync('index.html'))
    })
    .listen(8888),
})

let buf = new Float32Array(8192)
let idx = 0

wss.on('connection', function(ws) {
  console.log('connected')
  // モノラル、44.1kHz
  pcm.getPcmData(
    'media/test.mp3',
    { stereo: false, sampleRate: 44100 },
    (sample, channel) => {
      buf[idx++] = sample
      // 適当に8192サンプルずつで区切って送信する
      if (idx === buf.length) {
        ws.send(buf)
        buf = new Float32Array(8192)
        idx = 0
      }
    },
    () => {
      /* dummy end callback */
    }
  )

  ws.on('close', () => {
    console.log('close')
  })
})
