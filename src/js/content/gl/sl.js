content.gl.sl = {}

content.gl.sl.common = () => `
${content.gl.sl.definePi()}
${content.gl.sl.circle()}
${content.gl.sl.hash()}
${content.gl.sl.hsv2rgb()}
${content.gl.sl.rand()}
${content.gl.sl.scale()}
${content.gl.sl.perlin2d()}
${content.gl.sl.perlin3d()}
${content.gl.sl.perlin4d()}
`

content.gl.sl.circle = (prefix = '') => `
// https://webgl2fundamentals.org/webgl/webgl-qna-the-fastest-way-to-draw-many-circles-example-5.html
float circle(vec2 st, float radius) {
  vec2 dist = st - vec2(0.5);

  return 1.0 - smoothstep(
     0.0,
     radius,
     dot(dist, dist) * 4.0
  );
}
`

content.gl.sl.definePi = () => `
#define PI 3.1415926535897932384626433832795
`

content.gl.sl.hash = () => `
float hash(float x) {
  int i = int(x);

  i += (i << 10);
  i ^= (i >> 6);
  i += (i << 3);
  i ^= (i >> 11);
  i += (i << 15);

  return float(i);
}

float hash (vec2 v) {
  return hash(float(int(v.x) ^ int(hash(v.y))));
}

float hash (vec3 v) {
  return hash(float(int(v.x) ^ int(hash(v.yz))));
}

float hash (vec4 v) {
  return hash(float(int(v.x) ^ int(hash(v.yzw))));
}
`

content.gl.sl.hsv2rgb = () => `
// Function from Iñigo Quiles
// https://www.shadertoy.com/view/MsS3Wc
vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(
    abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,
    0.0,
    1.0
  );
  rgb = rgb*rgb*(3.0-2.0*rgb);
  return c.z * mix(vec3(1.0), rgb, c.y);
}
`

content.gl.sl.perlin2d = () => `
float perlin2d(vec2 v, float seed) {
  float x0 = floor(v.x);
  float x1 = x0 + 1.0;
  float dx = smoothstep(0.0, 1.0, v.x - x0);

  float y0 = floor(v.y);
  float y1 = y0 + 1.0;
  float dy = smoothstep(0.0, 1.0, v.y - y0);

  return mix(
    mix(
      rand(vec2(hash(vec2(x0, y0)), seed)),
      rand(vec2(hash(vec2(x1, y0)), seed)),
      dx
    ),
    mix(
      rand(vec2(hash(vec2(x1, y0)), seed)),
      rand(vec2(hash(vec2(x1, y1)), seed)),
      dx
    ),
    dy
  );
}
`

content.gl.sl.perlin3d = () => `
float perlin3d(vec3 v, float seed) {
  float x0 = floor(v.x);
  float x1 = x0 + 1.0;
  float dx = v.x - x0;

  float y0 = floor(v.y);
  float y1 = y0 + 1.0;
  float dy = v.y - y0;

  float z0 = floor(v.z);
  float z1 = z0 + 1.0;
  float dz = v.z - z0;

  return mix(
    mix(
      mix(
        rand(vec2(hash(vec3(x0, y0, z0)), seed)),
        rand(vec2(hash(vec3(x1, y0, z0)), seed)),
        dx
      ),
      mix(
        rand(vec2(hash(vec3(x0, y1, z0)), seed)),
        rand(vec2(hash(vec3(x1, y1, z0)), seed)),
        dx
      ),
      dy
    ),
    mix(
      mix(
        rand(vec2(hash(vec3(x0, y0, z1)), seed)),
        rand(vec2(hash(vec3(x1, y0, z1)), seed)),
        dx
      ),
      mix(
        rand(vec2(hash(vec3(x0, y1, z1)), seed)),
        rand(vec2(hash(vec3(x1, y1, z1)), seed)),
        dx
      ),
      dy
    ),
    dz
  );
}
`

content.gl.sl.perlin4d = () => `
float perlin4d(vec4 v, float seed) {
  float x0 = floor(v.x);
  float x1 = x0 + 1.0;
  float dx = v.x - x0;

  float y0 = floor(v.y);
  float y1 = y0 + 1.0;
  float dy = v.y - y0;

  float z0 = floor(v.z);
  float z1 = z0 + 1.0;
  float dz = v.z - z0;

  float w0 = floor(v.w);
  float w1 = w0 + 1.0;
  float dw = v.w - w0;

  return mix(
    mix(
      mix(
        mix(
          rand(vec2(hash(vec4(x0, y0, z0, w0)), seed)),
          rand(vec2(hash(vec4(x1, y0, z0, w0)), seed)),
          dx
        ),
        mix(
          rand(vec2(hash(vec4(x0, y1, z0, w0)), seed)),
          rand(vec2(hash(vec4(x1, y1, z0, w0)), seed)),
          dx
        ),
        dy
      ),
      mix(
        mix(
          rand(vec2(hash(vec4(x0, y0, z1, w0)), seed)),
          rand(vec2(hash(vec4(x1, y0, z1, w0)), seed)),
          dx
        ),
        mix(
          rand(vec2(hash(vec4(x0, y1, z1, w0)), seed)),
          rand(vec2(hash(vec4(x1, y1, z1, w0)), seed)),
          dx
        ),
        dy
      ),
      dz
    ),
    mix(
      mix(
        mix(
          rand(vec2(hash(vec4(x0, y0, z0, w1)), seed)),
          rand(vec2(hash(vec4(x1, y0, z0, w1)), seed)),
          dx
        ),
        mix(
          rand(vec2(hash(vec4(x0, y1, z0, w1)), seed)),
          rand(vec2(hash(vec4(x1, y1, z0, w1)), seed)),
          dx
        ),
        dy
      ),
      mix(
        mix(
          rand(vec2(hash(vec4(x0, y0, z1, w1)), seed)),
          rand(vec2(hash(vec4(x1, y0, z1, w1)), seed)),
          dx
        ),
        mix(
          rand(vec2(hash(vec4(x0, y1, z1, w1)), seed)),
          rand(vec2(hash(vec4(x1, y1, z1, w1)), seed)),
          dx
        ),
        dy
      ),
      dz
    ),
    dw
  );
}
`

content.gl.sl.rand = () => `
float rand(vec2 co) {
  float a = 12.9898;
  float b = 78.233;
  float c = 43758.5453;
  float dt= dot(co.xy ,vec2(a,b));
  float sn= mod(dt,3.14);
  return fract(sin(sn) * c);
}
`

content.gl.sl.scale = () => `
float scale(float value, float min, float max, float a, float b) {
  return a + (((value - min) / (max - min)) * (b - a));
}
`
