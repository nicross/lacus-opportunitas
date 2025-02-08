content.audio.buffer.whiteNoise = content.audio.buffer.base.extend({
  buffers: [
    engine.buffer.whiteNoise({
      channels: 2,
      duration: 10,
    }),
    engine.buffer.whiteNoise({
      channels: 2,
      duration: 10,
    }),
  ],
})
