content.video.portParticles = (() => {
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
  vec3 v = vertex + offset;
  gl_Position = u_projection * vec4(v.xyz, 1.0);

  ${content.gl.sl.passUniforms()}
  alpha = sqrt(sin(PI * life));
}
`

  let particles = [],
    program

  function generateParticle(port) {
    const velocity = engine.tool.vector3d.create({
      x: engine.fn.randomFloat(-1, 1),
      y: engine.fn.randomFloat(-1, 1),
      z: engine.fn.randomFloat(-1, 1),
    }).normalize()

    return {
      life: 1,
      port,
      vector: velocity.clone(),
      velocity,
    }
  }

  function generateParticles() {
    if (particles.length > maxParticles) {
      return
    }

    const drawDistance = content.gl.drawDistance(),
      position = engine.position.getVector(),
      target = content.ports.target.get(),
      time = content.time.value()

    for (const port of content.ports.all()) {
      const dot = port.getDot(),
        isTarget = port === target

      if (!isTarget && dot < 0.85) {
        continue
      }

      const chance = isTarget
        ? 1
        : engine.fn.scale(dot, 0.85, 1, 0, 1) ** 12

      if (Math.random() > chance) {
        continue
      }

      const count = isTarget ? 2 : 1

      for (let i = 0; i < count; i+= 1) {
        particles.push(
          generateParticle(port)
        )
      }

      if (particles.length > maxParticles) {
        break
      }
    }
  }

  function updateParticles() {
    const camera = content.camera.vector(),
      delta = engine.loop.delta(),
      lifeRate = 2 * delta,
      lifes = [],
      offsets = [],
      position = engine.position.getVector(),
      quaternion = engine.position.getQuaternion(),
      target = content.ports.target.get(),
      velocity = 5 * delta

    const origins = new Map()

    for (const port of content.ports.all()) {
      const relative = engine.tool.vector3d.create(port)
        .subtract(camera)
        .zeroZ()

      origins.set(port,
        relative.subtractRadius(
          Math.max(0, relative.distance() - content.dock.radius())
        ).add({z: 24})
      )
    }

    particles = particles.reduce((particles, particle) => {
      const isTarget = particle.port === target,
        origin = origins.get(particle.port)

      particle.life -= lifeRate * (isTarget ? 0.5 : 1)

      if (particle.life <= 0) {
        return particles
      }

      particle.vector.x += particle.velocity.x * velocity * (isTarget ? 2 : 1)
      particle.vector.y += particle.velocity.y * velocity * (isTarget ? 2 : 1)
      particle.vector.z += particle.velocity.z * velocity * (isTarget ? 2 : 1)

      lifes.push(particle.life)

      offsets.push(
        origin.x + particle.vector.x,
        origin.y + particle.vector.y,
        origin.z + particle.vector.z,
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
