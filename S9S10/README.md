# Malabares con pompas - Shaders

## Descripción general

Este proyecto consiste en un **shader de fragmentos GLSL** diseñado para ejecutarse en el editor de [*The Book of Shaders*](https://editor.thebookofshaders.com/).  
Se genera un fondo oscuro sobre el que se mueven varias “pompas” (burbujas) de colores diferentes, describiendo trayectorias cíclicas que recuerdan a bolas haciendo malabares.

Se incluye:
- Una [**versión completa / legible**](S9S10/pompas_malabares_colores.frag), con la que se desarrolló la práctica.
- Una **versión tiny** (<512 bytes), que implementa el mismo efecto de forma muy condensada, válida para el requisito de “tiny code”.
- Varias versiones que se tomaron como puntos de guardado, que sirvieron para tomar una decisión final

De cara a la entrega, el proyecto cumple con lo pedido, ya que:
- Todo el contenido (fondo y pompas) se genera procedimentalmente a partir de coordenadas de píxel (`gl_FragCoord`), resolución (`u_resolution`) y tiempo (`u_time`), sin texturas externas.
- El patrón es **animado y cíclico**: las pompas siguen trayectorias periódicas.
- Existe una versión clara/documentable y otra *code‑golf* (tiny).

## Entorno de ejecución y testeo

El shader está pensado para ejecutarse en:

- Editor online de [*The Book of Shaders*](https://editor.thebookofshaders.com/).
- Cualquier entorno WebGL/glslCanvas que pase al fragment shader los uniforms:

```
uniform vec2  u_resolution; // tamaño de la ventana
uniform float u_time;       // tiempo en segundos
```

El fragment shader se compila como único shader de fragmentos; el vértice asociado puede ser el mínimo estándar del editor (pantalla llena).

## Motivación y desarrollo

Al comienzo del desarrollo me encontraba bastante perdido. Aunque había asistido a todas las clases, no terminaba de entender qué era exactamente un shader: siempre que oía la palabra pensaba en los shaders de Minecraft, que modifican la visualización del juego haciendo los elementos más luminosos, con otras formas y contornos, y que además “pesan” mucho y requieren una buena GPU para poder ejecutarlos.  
Por eso tuve que detenerme a informarme bien y, cuando entendí que un shader no es más que una pieza de código que se ejecuta sobre un conjunto de píxeles de forma simultánea e independiente, normalmente aprovechando la GPU para hacer muchos cálculos en paralelo, me quedé más tranquilo. Su objetivo es manipular la imagen de salida antes de mostrarla en pantalla, aplicando efectos de renderizado como iluminación, sombreado, filtros o transformaciones visuales, y esa idea me terminó de aclarar el concepto.

Después pensé en otros sitios donde había visto shaders y me vino a la cabeza la nueva versión de iOS de mi iPhone, con su interfaz tipo *liquid glass*. Me pareció un buen punto de partida. Consulté a una IA para valorar la viabilidad y, tras algunas pruebas, me di cuenta de que no estaba entendiendo bien lo que hacía. Decidí entonces simplificar la idea: quería crear una pompa que modificara el fondo cuando pasara por delante, simulando el efecto de cristal líquido.

Busqué ejemplos parecidos en [Shadertoy](https://www.shadertoy.com/) y vi auténticas locuras, lo que me dio cierto respeto porque no sabía cómo llegar a resultados similares, pero aun así decidí intentarlo. Empecé creando un fondo colorido con un círculo centrado que hacía de contorno. Después intenté que la pompa no solo tuviera color, sino que también distorsionara el fondo, aunque al principio no tenía muy claro cómo conseguirlo. Así que me centré en la lógica de movimiento: al principio la pompa se movía en círculos, jugando únicamente con `u_time`. Con algo de ayuda de la IA y muchos intentos, acabé llegando al resultado que se puede ver en [pompas_hacia_arriba](S9S10/pompas_hacia_arriba.frag).

Podría haberme quedado ahí, pero no me sentía del todo satisfecho: ni siquiera entendía a la perfección por qué las pompas “volaban” hacia arriba, así que decidí volver sobre la idea base. Simplemente inspeccionando el código y probando con las distintas variables conseguí dos cosas:
1. Que cuando las pompas se solapasen, se notara mejor el contorno para distinguir cuál estaba por encima.
2. Que las pompas se movieran siguiendo siempre un patrón reconocible, lo que acabó derivando en la idea de simular malabares.

El fichero [pompas_malabares_original](S9S10/pompas_malabares_original.frag) puede considerarse mi shader “definitivo”, aunque después le hice algunos retoques de tamaño, movimiento y colores para que se pareciera más a bolas que a pompas. Esta ha sido, en resumen, mi hoja de ruta y el proceso de pensamiento durante el desarrollo de la práctica.

## Uso de IA
Para ayuda con la exploración de ideas y el desarrollo de estas para comprobar su viabilidad, se ha empleado **ChatGPT 5.1**. 