#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

// ---------- Utilidades ----------

// Hash simple para pseudo-aleatorio a partir de un float
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// Fondo: degradado azul vertical
vec3 background(vec2 uv){
    // uv en [0,1]
    vec3 top    = vec3(0.05, 0.15, 0.35);  // arriba, más oscuro
    vec3 bottom = vec3(0.02, 0.05, 0.10);  // abajo, casi negro
    float t = uv.y;
    return mix(bottom, top, t);
}

void main(){
    // Coordenadas normalizadas centradas, manteniendo proporción
    vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution.xy) / u_resolution.y;

    // uv01 en [0,1] para el fondo
    vec2 uv01 = gl_FragCoord.xy / u_resolution.xy;

    // 1) Fondo base
    vec3 col = background(uv01);

    // 2) Varias pompas
    const int N_BUBBLES = 12; // número de burbujas

    for(int i = 0; i < N_BUBBLES; i++){
        float id = float(i);

        // Velocidad vertical pseudo-aleatoria
        float speed = mix(0.15, 0.40, hash(id*1.37));

        // Tiempo local para esta burbuja
        float t = fract(u_time*speed + hash(id*5.73));

        // Posición vertical: de abajo (-1.2) a arriba (+1.2)
        float y = -1.2 + 2.4*t;

        // Posición horizontal base pseudo-aleatoria
        float baseX = mix(-0.8, 0.8, hash(id*3.11));

        // Balanceo horizontal senoidal
        float sway = 0.10 * sin(u_time*0.8 + id*1.5);
        float x = baseX + sway;

        // Centro de la burbuja en espacio uv
        vec2 center = vec2(x, y);

        // Radio pseudo-aleatorio
        float radius = mix(0.05, 0.18, hash(id*7.31));

        // Distancia a este centro
        float d = length(uv - center);

        // Máscara suave de la burbuja
        float edge = 0.008;
        float bubbleMask = 1.0 - smoothstep(radius, radius+edge, d);
        if(bubbleMask <= 0.0) continue; // este píxel no está en esta burbuja

        // 3) Efecto cristal: distorsión del fondo + cambio de color

        // Normal aproximada de esfera en 2D (para "refracción")
        float h = sqrt(max(0.0, radius*radius - d*d)) / radius; // altura relativa
        vec2 p = (uv - center) / radius;                       // posición local
        vec3 n = normalize(vec3(p, h));                        // "normal" local

        // Coordenadas refractadas: desplazamos ligeramente uv01
        vec2 uvRefract = uv01 + n.xy * 0.03;
        uvRefract = clamp(uvRefract, 0.0, 1.0);

        // Fondo visto a través de la burbuja
        vec3 bgRefract = background(uvRefract);

        // Rotamos canales para darle un tono diferente (efecto colorido)
        vec3 shifted = vec3(bgRefract.g, bgRefract.b, bgRefract.r);

        // Tinte adicional de cristal
        vec3 tint = vec3(0.7, 0.9, 1.0);

        // Mezcla de fondo refractado + color desplazado + tinte
        vec3 inside = mix(bgRefract, shifted, 0.5);
        inside = mix(inside, tint, 0.25);

        // 4) Borde brillante tipo Fresnel
        float rim = smoothstep(radius-0.01, radius, d);
        rim = pow(rim, 3.0);
        vec3 rimColor = vec3(1.0);
        inside = mix(inside, rimColor, rim*0.8);

        // 5) Combinamos esta burbuja con el color actual
        col = mix(col, inside, bubbleMask);
    }

    gl_FragColor = vec4(col, 1.0);
}
