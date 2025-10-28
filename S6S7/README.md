# Sistema Solar Interactivo con Three.js

## Autor

- Juan Carlos Rodríguez Ramírez

## Descripción

Este proyecto es una simulación interactiva del Sistema Solar desarrollada con **Three.js**, una biblioteca de JavaScript para crear gráficos 3D en el navegador. El sistema incluye el Sol, seis planetas principales (Mercurio, Venus, Tierra, Marte, Júpiter y Saturno), tres lunas orbitales, una nave espacial y efectos visuales espaciales como estrellas y cometas. 
**Disclaimer**: no se pretende representar el Sistema Solar tal cual es. Puede verse un vídeo demostración haciendo click [aquí](https://youtu.be/dPjmjqterL0).

## Características Principales

### Creación de Planetas y sus Lunas

El sistema implementa un enfoque modular para la creación de cuerpos celestes:

#### Planetas
- **Configuración centralizada**: Los datos de todos los planetas (radio, distancia orbital, velocidad, color y textura) están almacenados en el objeto `CONFIG.planetasData`
- **Geometría esférica**: Cada planeta utiliza `THREE.SphereGeometry` con 32 segmentos para suavidad visual (con más, afectaría al rendimiento)
- **Materiales realistas**: Se aplica `MeshPhongMaterial` para permitir interacción con la iluminación
- **Órbitas elípticas**: Las órbitas se dibujan con `LineBasicMaterial` y se calculan matemáticamente usando coseno y seno
- **Rotación propia**: Cada planeta rota sobre su eje Y para simular su día planetario
- **Características especiales**: 
  - **Saturno** incluye anillos creados con `RingGeometry` (radio interno 1.5x, externo 2.5x del planeta)
  - **Sol** usa `MeshBasicMaterial` con emisividad para simular luz propia

#### Lunas
- **Sistema de pivotes**: Cada luna se añade a un `Object3D` pivote que permite órbitas inclinadas
- **Órbitas independientes**: Las lunas tienen su propia velocidad y distancia orbital respecto a su planeta padre
- **Ángulos de inclinación**: Configurables mediante el parámetro `angle` en `CONFIG.lunasData`
- **Tres lunas implementadas**: Vinculadas a los planetas Tierra, Marte y Júpiter

### Sistema de Vistas Múltiples

El proyecto implementa tres tipos de cámara con controles únicos:

#### Vista General (Tecla 0)
- **Cámara**: `PerspectiveCamera` con FOV 60°
- **Controles**: `OrbitControls` habilitados para rotación libre, zoom y paneo
- **Posición inicial**: (0, 80, 80) - Vista diagonal elevada del sistema completo
- **Objetivo**: Centro del sistema solar (0, 0, 0)

#### Vista de Planetas (Teclas 1-7)
- **Cámara dinámica**: Se actualiza en cada frame para seguir al planeta seleccionado
- **Controles**: `OrbitControls` con target que se mueve con el planeta
- **Posicionamiento**: La cámara se sitúa a una distancia proporcional al radio del planeta (4x)
- **Offset**: Elevación de 0.5x la distancia para mejor perspectiva
- **Funcionalidad**: Permite hacer zoom y rotar alrededor del planeta mientras este orbita, dando la sensación de cámara con autoapuntado

#### Vista de Nave (Tecla V)
- **Cámara en tercera persona**: FOV 75° para mayor inmersión
- **Posición relativa**: Offset (0, 2, -5) respecto a la orientación de la nave
- **LookAt dinámico**: La cámara mira hacia adelante de la nave usando quaternions. Así, la cámara siempre mira en la dirección de la nave 
- **Sin controles manuales**: La vista sigue automáticamente a la nave

### Uso de Texturas

El proyecto utiliza texturas realistas para todos los cuerpos celestes:

#### Carga de Texturas
```javascript
const loader = new THREE.TextureLoader();
map: loader.load(`src/${p.texture}`)
```

#### Texturas Implementadas
- **Sol**: `sunmap.jpg` - Superficie solar con manchas solares
- **Mercurio**: `mercurymap.jpg` - Superficie craterizada
- **Venus**: `venusmap.jpg` - Atmósfera densa amarillenta
- **Tierra**: `earthmap1k.jpg` - Continentes y océanos
- **Marte**: `mars_1k_color.jpg` - Superficie rojiza propia de Marte
- **Júpiter**: `jupiter2_2k.jpg` - Vista de Cassini en 2k
- **Saturno**: `saturnringcolor.jpg` - Superficie con anillos en color específico
- **Lunas**: `moonmap1k.jpg` - Textura compartida para todas las lunas

#### Optimización
- **Carga única**: Las texturas se cargan una sola vez y se reutilizan cuando es posible (ej: todas las lunas usan la misma textura)
- **Resolución apropiada**: Texturas 1k-2k para balance entre calidad y rendimiento

### Decoración del Sistema

#### Campo de Estrellas
- **Cantidad**: 5000 partículas distribuidas aleatoriamente
- **Volumen**: Esfera de 2000 unidades de radio
- **Tamaños variables**: Entre 0.5 y 2.5 unidades para simular profundidad
- **Material**: `PointsMaterial` con opacidad 0.8 y color blanco
- **Implementación**: `BufferGeometry` con atributos personalizados de posición y tamaño

#### Cometas Animados
- **Cantidad**: 3 cometas con órbitas aleatorias
- **Núcleo**: Esfera pequeña (0.3 radio) con material emisivo azul-blanco
- **Cola de partículas**: 50 puntos con degradado de opacidad
- **Efecto visual**: `AdditiveBlending` para simular luminosidad
- **Animación**: Movimiento orbital con variación sinusoidal de distancia
- **Orientación**: Los cometas apuntan siempre hacia el centro del sistema

#### Nave Espacial Detallada
- **Cuerpo principal**: Cilindro de 2.0 unidades con material metálico brillante (shininess: 50)
- **Cabina transparente**: Semi-esfera azul con opacidad 0.6 y alto brillo
- **Punta cónica**: Cono rojo con emisividad para efecto de navegación
- **Alas laterales**: Dos cajas de 1.5x0.05x0.6 unidades en posición simétrica
- **Reactores**: Dos cilindros traseros con llamas animadas cyan
- **Iluminación**: `PointLight` frontal para simular luces de navegación
- **Órbita**: Circular a 70 unidades del Sol con altura constante

## Tecnologías Utilizadas

- **Three.js**: Biblioteca principal para renderizado 3D (WebGL)
- **JavaScript ES6+**: Sintaxis moderna con módulos
- **HTML5 Canvas**: Elemento de renderizado

## Estructura del Código

### Organización Modular

El código está estructurado en funciones especializadas para facilitar mantenimiento:

```javascript
init()                    // Inicialización general
├── crearUI()            // Interfaz HTML
├── crearEscena()        // Scene y Renderer
├── crearCamaras()       // Tres cámaras y controles
├── crearLuces()         // Iluminación
├── crearEstrellas()     // Campo de estrellas
├── crearCuerposCelestes() // Planetas, lunas y órbitas
├── crearNave()          // Nave espacial
└── crearCometas()       // Cometas animados

animationLoop()          // Bucle de renderizado
├── Animación planetas
├── Animación lunas
├── Animación cometas
├── Animación nave
├── Actualización cámaras
└── Render final
```

### Objeto CONFIG

Centraliza toda la configuración:

```javascript
const CONFIG = {
  accglobal: 0.0005,           // Velocidad temporal
  nombres: [...],               // Nombres de planetas
  planetasData: [...],          // Propiedades de planetas
  lunasData: [...]              // Propiedades de lunas
};
```

### Refactorización con Bucles

```javascript
// Antes: 490 líneas con código repetitivo
CrearPlaneta(0.4, 8, 1.8, 0x8b7355, 1.0, 1.0, txMercurio);
CrearPlaneta(0.7, 12, 1.5, 0xffc649, 1.0, 1.0, txVenus);
// ... repetido 6 veces

// Después: 250 líneas con bucles
CONFIG.planetasData.forEach(p => {
  // Creación dinámica de planetas
});
```

**Reducción**: ~50% menos líneas de código

## Controles

| Tecla | Acción |
|-------|--------|
| **0** | Vista General del sistema |
| **1** | Vista desde el Sol |
| **2** | Vista desde Mercurio |
| **3** | Vista desde Venus |
| **4** | Vista desde la Tierra |
| **5** | Vista desde Marte |
| **6** | Vista desde Júpiter |
| **7** | Vista desde Saturno |
| **V** | Vista desde la Nave |

**Controles de cámara (vistas 0-7)**:
- **Mouse izquierdo + arrastre**: Rotar
- **Rueda del mouse**: Zoom
- **Mouse derecho + arrastre**: Paneo (en mi opinión, de lo mejor del sistema)

## Referencias

### Texturas de Planetas
Las texturas utilizadas provienen de recursos de dominio público y educativos:

- **NASA Visible Earth**: Texturas de la Tierra
- **[Planetary Pixel Emporium](https://planetpixelemporium.com)**: Colección de texturas planetarias

### Documentación Técnica
- [Three.js Documentation](https://threejs.org/docs/) - Documentación oficial
- [Three.js Examples](https://threejs.org/examples/) - Ejemplos oficiales
- [Three.js Journey](https://threejs-journey.com/) - Curso completo de Three.js

### Repositorios Similares
- [gitfrandu4/solar-system-threejs](https://github.com/gitfrandu4/solar-system-threejs) - Sistema solar interactivo
- [sanderblue/solar-system-threejs](https://sanderblue.github.io/solar-system-threejs/) - Proyecto a escala real

## Uso de IA en el Desarrollo

Este proyecto ha sido optimizado mediante asistencia de IA para:

### Refactorización de Código
- **Consolidación de funciones repetitivas**: Conversión de múltiples llamadas similares a bucles `forEach`
- **Modularización**: Separación de responsabilidades en funciones específicas
- **Reducción de líneas**: De ~490 a ~250 líneas (-49%) (código principal, sin tener en cuenta decoraciones)

### Centralización de Configuración
- **Creación del objeto CONFIG**: Agrupa todos los parámetros en una estructura accesible
- **Escalabilidad mejorada**: Facilita añadir nuevos planetas/lunas sin modificar lógica

### Optimizaciones Implementadas
- **Código DRY**: Eliminación de duplicación mediante abstracciones

### Mejoras de Legibilidad
- **Comentarios estructurados**: Sin comentarios inline excesivos
- **Nombres descriptivos**: `crearEstrellas()`, `crearCometas()`, etc.
- **Estructura clara**: Separación visual entre secciones

***

**Nota**: Este README documenta las características principales del sistema solar interactivo. Para detalles técnicos específicos, consulta los comentarios en el código fuente.
Desarrollado como proyecto educativo de Three.js, con asistencia de IA (Perplexity AI) para optimización y refactorización de código. El código fue desarrollado en español por falta de tiempo y facilidad.


