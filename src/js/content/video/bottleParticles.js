content.video.bottleParticles = (() => {
  const maxParticles = 1000

  const fragmentShader = `#version 300 es

precision highp float;

${content.gl.sl.defineIns()}
${content.gl.sl.commonFragment()}

in float alpha;

out vec4 color;

void main() {
  float d = circle(quadCoordinates, 1.0);

  if (d == 0.0) {
    discard;
  }

  color = vec4(
    1.0, 1.0, 1.0,
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

void main(void) {
  vec3 v = (mix(2.0, 1.0, life) * vertex) + offset;
  gl_Position = u_projection * vec4(v.xyz, 1.0);

  ${content.gl.sl.passUniforms()}
  alpha = pow(sin(PI * life), 1.5);
}
`

  let particles = [],
    program

  function generateParticle(bottle) {
    const velocity = engine.tool.vector3d.create({
      x: engine.fn.randomFloat(-1, 1),
      y: engine.fn.randomFloat(-1, 1),
      z: engine.fn.randomFloat(-1, 1),
    }).normalize()

    return {
      life: 1,
      vector: velocity.add(bottle),
      velocity,
    }
  }

  function generateParticles() {
    if (particles.length > maxParticles) {
      return
    }

    const bottle = content.bottles.vector()

    if (!bottle) {
      return
    }

    particles.push(
      generateParticle(bottle)
    )
  }

  function updateParticles() {
    const camera = content.camera.vector(),
      delta = engine.loop.delta(),
      lifeRate = 2 * delta,
      lifes = [],
      offsets = [],
      velocity = 10 * delta

    particles = particles.reduce((particles, particle) => {
      particle.life -= lifeRate

      if (particle.life <= 0) {
        return particles
      }

      particle.vector.x += particle.velocity.x * velocity
      particle.vector.y += particle.velocity.y * velocity
      particle.vector.z += particle.velocity.z * velocity

      lifes.push(particle.life)

      offsets.push(
        particle.vector.x - camera.x,
        particle.vector.y - camera.y,
        particle.vector.z - camera.z,
      )

      particles.push(particle)

      return particles
    }, [])

    return {
      lifes,
      offsets,
    }
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
        height: 1/12,
        quaternion: content.camera.quaternion(),
        width: 1/12,
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
