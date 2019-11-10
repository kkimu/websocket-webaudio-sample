const ws = new WebSocket('ws://localhost:8888')
const ctx = new window.AudioContext()
const initial_delay_sec = 0

let scheduledTime = 0
const audioSrcList = []

function play() {
  audioSrcList.forEach(audioSrc => {
    const current_time = ctx.currentTime
    if (current_time < scheduledTime) {
      playChunk(audioSrc, scheduledTime)
      scheduledTime += audioSrc.buffer.duration
    } else {
      playChunk(audioSrc, current_time)
      scheduledTime = current_time + audioSrc.buffer.duration + initial_delay_sec
    }
  })
}

function playChunk(audioSrc, scheduledTime) {
  audioSrc.start(scheduledTime)
}

function stackAudioChunk(audioF32) {
  const audio_buf = ctx.createBuffer(1, audioF32.length, 44100)
  const audioSrc = ctx.createBufferSource()

  audio_buf.getChannelData(0).set(audioF32)

  audioSrc.buffer = audio_buf
  audioSrc.connect(ctx.destination)

  audioSrcList.push(audioSrc)
}


ws.binaryType = 'arraybuffer'

ws.onopen = function() {
  console.log('open')
}

ws.onerror = function(e) {
  console.log(String(e))
}

ws.onmessage = function(evt) {
  if (evt.data.constructor !== ArrayBuffer) throw 'expecting ArrayBuffer'

  stackAudioChunk(new Float32Array(evt.data))
}
