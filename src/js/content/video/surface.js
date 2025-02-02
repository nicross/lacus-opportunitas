content.video.surface = (() => {
  const maxParticles = 20000

  const fragmentShader = `#version 300 es

precision highp float;

${content.gl.sl.defineIns()}
${content.gl.sl.commonFragment()}

in float alpha;
in vec4 color_out;

out vec4 color;

void main() {
  float d = circle(quadCoordinates, 1.0);

  if (d == 0.0) {
    discard;
  }

  color = vec4(
    color_out.rgb,
    alpha * pow(d, 0.0625)
  );
}
`

  const vertexShader = `#version 300 es

precision highp float;

${content.gl.sl.defineOuts()}
${content.gl.sl.defineUniforms()}
${content.gl.sl.commonVertex()}

in float life;
in vec3 offset;
in vec3 vertex;

out float alpha;
out vec4 color_out;

void main(void) {
  gl_Position = u_projection * vec4(vertex + offset, 1.0);

  ${content.gl.sl.passUniforms()}
  alpha = sin(life * PI);
  color_out = vec4(hsv2rgb(vec3(
    80.0 / 360.0,
    perlin3d(vec3(offset.xy * 0.25, u_time), 666.0),
    1.0
  )), 1.0);
}
`

  let particles = [],
    program

  function generateParticles() {
    const count = Math.min(
      maxParticles / engine.performance.fps(),
      Math.max(0, maxParticles - particles.length)
    )

    const drawDistance = content.gl.drawDistance(),
      position = engine.position.getVector(),
      time = content.time.value()

    for (let i = 0; i < count; i += 1) {
      const vector = position.add(
        engine.tool.vector2d.unitX()
          .scale(Math.random() * drawDistance)
          .rotate(Math.random() * 2 * engine.const.tau)
      )

      particles.push({
        life: 1,
        rate: 1 / engine.fn.randomFloat(1, 3),
        x: vector.x,
        y: vector.y,
        z: content.surface.value({
          time,
          x: vector.x,
          y: vector.y
        }),
      })
    }
  }

  function updateParticles() {
    const camera = content.camera.vector(),
      delta = engine.loop.delta(),
      drawDistance = content.gl.drawDistance(),
      lifes = [],
      offsets = [],
      time = content.time.value(),
      xMax = camera.x + drawDistance,
      xMin = camera.x - drawDistance,
      yMax = camera.y + drawDistance,
      yMin = camera.y - drawDistance

    particles = particles.reduce((particles, particle) => {
      particle.life -= delta * particle.rate

      if (particle.life < 0) {
        return particles
      }

      const oldX = particle.x,
        oldY = particle.y

      particle.x = wrap(particle.x, xMin, xMax)
      particle.y = wrap(particle.y, yMin, yMax)
      particle.z = content.surface.value({
        time,
        x: particle.x,
        y: particle.y
      })

      lifes.push(particle.life)

      offsets.push(
        particle.x - camera.x,
        particle.y - camera.y,
        particle.z - camera.z,
      )

      particles.push(particle)

      return particles
    }, [])

    return {
      lifes,
      offsets,
    }
  }

  function wrap(value, min, max) {
    if (value >= max) {
      return min + engine.const.zero
    }

    if (value <= min) {
      return max - engine.const.zero
    }

    return value
  }

  return {
    draw: function () {
      const gl = content.gl.context()

      gl.useProgram(program.program)
      content.gl.sl.bindUniforms(gl, program)

      // Update and analyze particles
      generateParticles()

      const {
        lifes,
        offsets,
      } = updateParticles()

      // Bind life
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lifes), gl.STATIC_DRAW)

      gl.enableVertexAttribArray(program.attributes.life)
      gl.vertexAttribPointer(program.attributes.life, 1, gl.FLOAT, false, 0, 0)
      gl.vertexAttribDivisor(program.attributes.life, 1)

      // Bind offset
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(offsets), gl.STATIC_DRAW)
      gl.enableVertexAttribArray(program.attributes.offset)
      gl.vertexAttribPointer(program.attributes.offset, 3, gl.FLOAT, false, 0, 0)
      gl.vertexAttribDivisor(program.attributes.offset, 1)

      // Bind mesh
      const mesh = content.gl.createQuad({
        height: 1/16,
        quaternion: content.camera.quaternion(),
        width: 1/16,
      })

      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW)
      gl.enableVertexAttribArray(program.attributes.vertex)
      gl.vertexAttribPointer(program.attributes.vertex, 3, gl.FLOAT, false, 0, 0)

      // Draw instances
      gl.drawArraysInstanced(gl.TRIANGLES, 0, mesh.length / 3, particles.length)

      // Reset divisors
      gl.vertexAttribDivisor(program.attributes.life, 0)
      gl.vertexAttribDivisor(program.attributes.offset, 0)

      return this
    },
    load: function () {
      const gl = content.gl.context()

      program = content.gl.createProgram({
        attributes: [
          ...content.gl.sl.attributeNames(),
          'life',
          'offset',
          'vertex',
        ],
        context: gl,
        shaders: [
          {
            source: fragmentShader,
            type: gl.FRAGMENT_SHADER,
          },
          {
            source: vertexShader,
            type: gl.VERTEX_SHADER,
          },
        ],
        uniforms: [
          ...content.gl.sl.uniformNames(),
        ],
      })

      return this
    },
    unload: function () {
      particles.length = 0

      return this
    },
  }
})()
