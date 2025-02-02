content.video.grain = (() => {
  const fragmentShader = `#version 300 es

precision highp float;

in float time;

out vec4 color;

${content.gl.sl.hsv2rgb()}
${content.gl.sl.rand()}

void main() {
  vec2 co0 = vec2(gl_FragCoord.xy * (time + 0.0));
  vec2 co1 = vec2(gl_FragCoord.yx * (time + 1.0));

  float value = round(rand(co0));
  float opacity = rand(co1) / 50.0;

  color = vec4(value, value, value, opacity);
}
`

  const vertexShader = `#version 300 es

precision highp float;

in vec3 vertex;

out float time;

uniform float u_time;

void main(void) {
  gl_Position = vec4(vertex, 1.0);
  time = u_time;
}
`

  let program

  return {
    draw: function () {
      const gl = content.gl.context()

      gl.useProgram(program.program)

      // Bind u_time
      gl.uniform1f(program.uniforms.u_time, engine.time() % 360)

      // Bind vertex
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        [-1, 3, -1], [-1, -1, -1], [3, -1, -1],
      ].flat()), gl.STATIC_DRAW)

      gl.enableVertexAttribArray(program.attributes.vertex)
      gl.vertexAttribPointer(program.attributes.vertex, 3, gl.FLOAT, false, 0, 0)

      gl.drawArrays(gl.TRIANGLES, 0, 3)

      return this
    },
    load: function () {
      const gl = content.gl.context()

      program = content.gl.createProgram({
        attributes: [
          'vertex',
        ],
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
          'u_time',
        ],
      })

      return this
    },
    unload: function () {
      program.destroy()
      program = undefined

      return this
    },
  }
})()
