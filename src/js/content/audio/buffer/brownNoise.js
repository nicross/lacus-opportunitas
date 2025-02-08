content.audio.buffer.brownNoise = content.audio.buffer.base.extend({
  buffers: [
    engine.buffer.brownNoise({
      channels: 2,
      duration: 10,
    }),
    engine.buffer.brownNoise({
      channels: 2,
      duration: 10,
    }),
    engine.buffer.brownNoise({
      channels: 2,
      duration: 10,
    }),
  ],
})
