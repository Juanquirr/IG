#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 resolution = u_resolution;
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution) / resolution.y;

    vec3 backgroundColor = vec3(0.05, 0.1, 0.2);
    vec3 bubbleColor = vec3(1.0, 0.80, 0.99);
    vec3 color = backgroundColor;

    float radius = 0.15;

    for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float a = u_time * -0.5 + fi * 2.0;
        float b = u_time * -1.2 + fi * 2.0;

        vec2 center = 0.25 * vec2(sin(a), cos(b));
        vec2 p = uv - center;

        float d = length(p);
        float mask = 1.0 - smoothstep(radius, radius + 0.01, d);
        float rim = pow(smoothstep(radius, radius, d), 3.0);

        vec3 thisColor;
        if (i == 0)      thisColor = vec3(1.000,0.480,0.480);
        else if (i == 1) thisColor = vec3(0.283,0.900,0.584);
        else             thisColor = vec3(0.486,0.682,1.000);

        vec3 glass = mix(thisColor, vec3(1.0), rim);
        color = mix(color, glass, mask);
    }


    gl_FragColor = vec4(color, 1.0);
}
