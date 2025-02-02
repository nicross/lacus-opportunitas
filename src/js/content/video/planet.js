content.video.planet = (() => {
  const fragmentShader = `#version 300 es

precision highp float;

${content.gl.sl.defineIns()}
${content.gl.sl.commonFragment()}

out vec4 color;

void main() {
  float d = circle(quadCoordinates, 1.0);

  if (d == 0.0) {
    discard;
  }

  vec2 rotated = rotate(quadCoordinates - vec2(0.5), PI * -0.25) + vec2(0.5);

  color = vec4(hsv2rgb(vec3(
    80.0 / 360.0,
    1.0 - pow(2.0 * abs(rotated.x - 0.5), 2.0),
    1.0
  )), 1.0);

  color = mix(
    calculateSkyColor(),
    color,
    pow(rotated.y, 2.0)
  );

  color.a = rotated.y > 0.5
    ? mix(pow(d, 0.125), 1.0, scale(rotated.y, 0.5, 1.0, 1.0, 0.0))
    : color.a;
}
`

  const vertexShader = `#version 300 es

precision highp float;

${content.gl.sl.defineOuts()}
${content.gl.sl.defineUniforms()}
${content.gl.sl.commonVertex()}

in vec3 vertex;

void main(void) {
  gl_Position = u_projection * vec4(vertex + u_planet, 1.0);

  ${content.gl.sl.passUniforms()}
}
`

  let program

  return {
    draw: function () {
      const gl = content.gl.context()

      gl.useProgram(program.program)
      content.gl.sl.bindUniforms(gl, program)

      // Bind mesh
      const mesh = content.gl.createQuad({
        height: 66.6,
        quaternion: content.camera.quaternion(),
        width: 66.6,
      })

      const vertexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW)
      gl.enableVertexAttribArray(program.attributes.vertex)
      gl.vertexAttribPointer(program.attributes.vertex, 3, gl.FLOAT, false, 0, 0)

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      return this
    },
    load: function () {
      const gl = content.gl.context()

      program = content.gl.createProgram({
        attributes: [
          ...content.gl.sl.attributeNames(),
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
          ...content.gl.sl.uniformNames(),
        ],
      })

      return this
    },
    unload: function () {
      return this
    },
  }
})()
