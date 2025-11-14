# Visualización de avistamientos UAP en mapa 2D con Three.js

Este proyecto muestra una visualización interactiva de avistamientos de fenómenos aéreos no identificados (UAP/UFO) sobre un mapamundi en 2D utilizando Three.js. La aplicación permite explorar la distribución espacial y temporal de los avistamientos, filtrar por rangos de fechas y duración del evento, y alternar entre una visión nocturna y diurna del planeta.

## Descripción general

La aplicación renderiza un mapa del mundo proyectado en un plano 2D mediante una cámara ortográfica de Three.js. Sobre este plano se representan miles de puntos correspondientes a avistamientos UAP, posicionados a partir de sus coordenadas geográficas (latitud y longitud). Cada punto se dibuja como un marcador luminoso con un color asociado a la forma reportada del objeto (light, circle, sphere, etc.), empleando `Points` y `PointsMaterial` para gestionar grandes volúmenes de datos de forma eficiente.

El usuario puede interactuar con el mapa mediante zoom y desplazamiento, activar filtros por fecha o duración y ajustar el tamaño de los puntos mediante un control deslizante, lo que facilita el análisis visual de patrones en distintas escalas.

## Características principales

- Visualización 2D en Three.js con cámara ortográfica y controles de tipo mapa (`MapControls`).
- Carga de datos de avistamientos UAP desde un CSV masivo y representación como puntos luminosos.
- Colores diferenciados por forma del UAP (light, circle, sphere, disk, triangle, cylinder, fireball, formation, unknown).
- Filtros interactivos por:
  - Rango temporal: 1940–1979, 1980–1999, 2000+, o todos los años.
  - Duración del evento: corta (< 10 minutos), media (10–30 minutos), larga (> 30 minutos) o todas.
- Cambio de textura del mapa entre modo día y modo noche mediante un botón.
- Control deslizante para escalar en tiempo real el tamaño de los puntos.
- Contador dinámico del número de avistamientos actualmente visibles tras aplicar los filtros.
- Leyenda visual de colores en la parte inferior de la pantalla indicando la correspondencia color–forma.

## Uso de texturas

El mapa base se construye a partir de texturas del planeta en proyección equirectangular, cargadas con `THREE.TextureLoader`. En el código se utilizan dos texturas principales:

- Textura de día del planeta.
- Textura de noche del planeta.

El usuario puede alternar entre ambas con el botón “Switch Map”, reutilizando la misma geometría del plano y sustituyendo únicamente el `map` del material. Las texturas proceden de recursos de uso público orientados a visualización científica o educativa.

## Uso del CSV de avistamientos

Los datos de entrada provienen del dataset público de [https://www.kaggle.com/datasets/NUFORC/ufo-sightings](NUFORC) disponible en Kaggle.

En concreto, se utiliza el fichero `complete.csv`, que contiene, entre otros, los siguientes campos relevantes:

- `latitude`
- `longitude`
- `datetime`
- `shape`
- `duration (seconds)`

El flujo de tratamiento es:

1. Carga del CSV mediante `fetch` y lectura como texto.
2. Separación en líneas y extracción de índices de las columnas necesarias.
3. Parseo de cada fila:
   - Conversión de latitud y longitud a `float`.
   - Filtrado de valores no numéricos o fuera de rango geográfico razonable.
   - Parseo de la duración en segundos para aplicarla posteriormente en los filtros por duración.
   - Conservación de la fecha en formato texto y conversión a objeto `Date` solo cuando se aplica el filtro temporal.
4. Almacenamiento de todos los registros válidos en `allUfoData`.
5. Aplicación de filtros activos para generar `ufoData`, que es el subconjunto efectivamente dibujado.
6. Conversión de latitud/longitud a coordenadas del plano mediante una función de mapeo lineal, asumiendo la textura en proyección equirectangular:
   - Longitud: [-180, 180] → eje X.
   - Latitud: [-90, 90] → eje Z (invertido para que el norte quede arriba).

El dataset original incluye muchos años de observaciones y un número muy elevado de registros, por lo que el código aplica filtros en memoria para no saturar la visualización. En un futuro, se podrían añadir un pequeño pop-up con información del evento.

## Estructura del código

La estructura principal del código JavaScript [script.js](src/script.js) es la siguiente:

- Variables globales:
  - Escena, cámara, renderer, controles.
  - Objeto del mapa (`mapa`) y dimensiones `mapsx`, `mapsy`.
  - Arrays `allUfoData`, `ufoData` y `ufoPoints`.
  - Texturas de día y noche, bandera `isNightMap`.
  - Objeto `activeFilters` con filtros de fecha y duración.
  - Factor `pointSizeScale` controlado por el slider de tamaño.

- Función `init()`:
  - Crea la escena, la cámara ortográfica y el renderer.
  - Configura `MapControls` (zoom, desplazamiento, sin rotación).
  - Añade la luz ambiental.
  - Registra escuchadores de eventos de ventana (resize) y de la UI (`switchMapBtn`, botones de filtros, slider de tamaño).
  - Llama a `loadMapAndData()` y `animationLoop()`.

- Función `loadMapAndData()`:
  - Espera a que la textura inicial de día esté cargada.
  - Calcula el aspect ratio de la imagen para dimensionar el plano.
  - Crea la geometría `PlaneGeometry` y el material `MeshBasicMaterial` con la textura.
  - Inserta el mapa en la escena, ajusta la cámara mediante `fitCameraToMap()` y llama a `loadUFOData()`.

- Función `loadUFOData()`:
  - Carga el CSV con `fetch`, llama a `parseCSV()` y, una vez parseado, a `applyFilters()`.

- Función `parseCSV(csvText)`:
  - Localiza índices de columnas relevantes.
  - Recorre todas las líneas, parsea valores y construye objetos `{ latitude, longitude, date, shape, duration }` que se almacenan en `allUfoData`.

- Funciones de filtrado:
  - `filterByDate(range)` actualiza `activeFilters.dateRange`, marca el botón activo y llama a `applyFilters()`.
  - `filterByDuration(range)` hace lo mismo para la duración.
  - `applyFilters()` aplica ambos filtros sobre `allUfoData`, actualiza `ufoData`, llama a `updateEventCount()` y a `createUFOMarkers()`.

- Función `createUFOMarkers()`:
  - Elimina y libera los puntos anteriores (geometría y material).
  - Construye un `BufferGeometry` con los atributos:
    - `position`: coordenadas X, Y, Z de cada avistamiento.
    - `color`: color RGB según la forma (`shape`).
  - Genera una textura de glow en un `canvas` 2D con varios gradientes radiales.
  - Crea un `THREE.PointsMaterial` con:
    - `vertexColors: true` para usar los colores por vértice.
    - `map` con la textura de glow.
    - `transparent: true`, `depthWrite: false`, `blending: THREE.AdditiveBlending`.
  - Crea un objeto `THREE.Points` y lo añade a la escena.

- Función `getColorByShape(shape)`:
  - Devuelve un color distinto de `THREE.Color` para cada forma:
    - light, circle, sphere, disk, triangle, cylinder, fireball, formation, unknown.

- Funciones de soporte:
  - `map2Range(val, vmin, vmax, dmin, dmax)` para remapear latitudes y longitudes al rango del plano del mapa.
  - `fitCameraToMap()` para ajustar los límites de la cámara ortográfica al tamaño del mapa y al aspect ratio de la ventana.
  - `parseDate(dateStr)` para extraer el año desde el campo `datetime`.
  - `updateEventCount()` para actualizar el contador de avistamientos visibles en la interfaz.

- Función `animationLoop()`:
  - Bucle de renderizado con `requestAnimationFrame`.
  - Actualiza el tamaño de los puntos en función de `pointSizeScale` y `camera.zoom`:
    - `size = pointSizeScale * zoomLevel * factorDePulsación`.
  - Aplica una ligera animación de pulsación usando `Math.sin`.
  - Actualiza los controles y llama a `renderer.render(scene, camera)`.

El HTML [index.html](index.html) define la estructura de la interfaz (panel de controles, botones de filtros, slider de tamaño, leyenda). El CSS [styles.css](styles.css) aplica un estilo oscuro con efecto glassmorphism al panel y a la leyenda.

## Controles

- Navegación por el mapa:
  - Rueda del ratón: zoom.
  - Arrastrar con botón izquierdo: desplazamiento (pan).
- Botón “Switch Map”:
  - Alterna la textura del mapa entre modo día y modo noche.
- Filtros:
  - Sección “Filter by Date”:
    - “All”, “1940–1979”, “1980–1999”, “2000+”.
  - Sección “Filter by Duration”:
    - “All”, “< 10 min”, “10–30 min”, “> 30 min”.
- Slider “Point Size”:
  - Ajusta el factor `pointSizeScale` que escala el tamaño base de los puntos.
  - El valor actual se muestra como `Size: X.x x`.
- Indicador “Showing N sightings”:
  - Muestra el número de avistamientos representados tras aplicar los filtros.

## Uso de texturas y datos abiertos

Este proyecto se apoya en recursos de datos y texturas de acceso abierto:

- Texturas de la Tierra de alta resolución (día y noche) empleadas para el mapa base proceden de colecciones públicas de texturas planetarias.
- Los datos de avistamientos UAP provienen del dataset NUFORC en Kaggle, que recopila informes ciudadanos de fenómenos aéreos no identificados durante varias décadas.

El proyecto busca combinar datos abiertos georreferenciados con herramientas de visualización WebGL modernas para explorar patrones espaciales y temporales de forma interactiva.

## Conclusión

Se podría clasificar el proyecto como completo, teniendo en cuenta que cumple lo necesario, que era la visualización de datos. No obstante, sería interesante seguir desarrollando este, pues tiene cierto potencial y generaría cierta curiosidad a los usuarios. Aunque ya existen [proyecto similares](https://codepen.io/makabrys/project/full/XzNQVG) (utilizado como inspiración) mucho mejores que este actual, siempre se pueden proponer nuevas mejoras, como informar a los usuarios cuando existen neuvos eventos, filtrar por los más recientes o visualizar solo los de un área, entre otros. Por desgracia, no se dispone del tiempo suficiente para seguir trabajando en ello.

## Uso de IA

Para un correcto desarrollo de este proyecto, se ha empleado:
- **ChatGPT 5** para la estructuración de este README y ayuda con la interpretación de las ideas propuestas por mi persona.
- **Claude Sonnet 4.5** para la ayuda con generación y solución de código, especialmente con la animación de los puntos para detallar. 

## Referencias

- Las texturas planetarias fueron extraídas de:  
  [https://www.solarsystemscope.com/textures/](https://www.solarsystemscope.com/textures/)

- Ejemplo de visualización y estilos con Three.js:  
  [https://codepen.io/makabrys/project/full/XzNQVG](https://codepen.io/makabrys/project/full/XzNQVG)

- Librería Globe.GL para globos 3D interactivos:  
  [https://globe.gl/](https://globe.gl/)

- Dataset de avistamientos UAP/NUFORC:  
  [https://www.kaggle.com/datasets/NUFORC/ufo-sightings](https://www.kaggle.com/datasets/NUFORC/ufo-sightings)
