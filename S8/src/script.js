import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls";

let scene, renderer, camera, controls;
let mapa, mapsx, mapsy;
let ufoPoints = [];
let ufoData = [];
let allUfoData = [];

let pointSizeScale = 0.8;

const dayMapTexture = new THREE.TextureLoader().load(
  "src/8081_earthmap10k.jpg"
);
const nightMapTexture = new THREE.TextureLoader().load(
  "src/8k_earth_nightmap.jpg"
);
let isNightMap = false;

let activeFilters = {
  dateRange: "all",
  duration: "all",
};

init();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);

  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera(
    -aspect * 10,
    aspect * 10,
    10,
    -10,
    0.1,
    100
  );
  camera.position.set(0, 15, 0);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, -1);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  controls = new MapControls(camera, renderer.domElement);
  controls.enableRotate = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;
  controls.minZoom = 0.3;
  controls.maxZoom = 50;
  controls.zoomSpeed = 1.5;

  const sizeSlider = document.getElementById("sizeSlider");
  const sizeValue = document.getElementById("sizeValue");

  if (sizeSlider && sizeValue) {
    sizeSlider.addEventListener("input", () => {
      pointSizeScale = parseFloat(sizeSlider.value);
      sizeValue.textContent = `Size: ${pointSizeScale.toFixed(1)}x`;
    });
  }

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  window.addEventListener("resize", onWindowResize);

  const switchButton = document.getElementById("switchMapBtn");
  switchButton.addEventListener("click", switchMap);

  document
    .getElementById("filterAll")
    .addEventListener("click", () => filterByDate("all"));
  document
    .getElementById("filterEarly")
    .addEventListener("click", () => filterByDate("early"));
  document
    .getElementById("filterMid")
    .addEventListener("click", () => filterByDate("mid"));
  document
    .getElementById("filterRecent")
    .addEventListener("click", () => filterByDate("recent"));

  document
    .getElementById("durationAll")
    .addEventListener("click", () => filterByDuration("all"));
  document
    .getElementById("durationShort")
    .addEventListener("click", () => filterByDuration("short"));
  document
    .getElementById("durationMedium")
    .addEventListener("click", () => filterByDuration("medium"));
  document
    .getElementById("durationLong")
    .addEventListener("click", () => filterByDuration("long"));

  loadMapAndData();
  animationLoop();
}

function switchMap() {
  isNightMap = !isNightMap;
  if (isNightMap) mapa.material.map = nightMapTexture;
  else mapa.material.map = dayMapTexture;

  mapa.material.needsUpdate = true;
}

function loadMapAndData() {
  const initialTexture = dayMapTexture;
  const checkTextureLoaded = setInterval(() => {
    if (initialTexture.image) {
      clearInterval(checkTextureLoaded);
      const img = initialTexture.image;
      const aspectRatio = img.width / img.height;
      mapsx = 20 * aspectRatio;
      mapsy = 20;

      const geometry = new THREE.PlaneGeometry(mapsx, mapsy);
      const material = new THREE.MeshBasicMaterial({
        map: initialTexture,
        side: THREE.DoubleSide,
      });
      mapa = new THREE.Mesh(geometry, material);
      mapa.rotation.x = -Math.PI / 2;
      scene.add(mapa);

      fitCameraToMap();
      loadUFOData();
    }
  }, 100);
}

function loadUFOData() {
  fetch("/src/complete.csv")
    .then((response) => response.text())
    .then((csvText) => {
      parseCSV(csvText);
      applyFilters();
    });
}

function parseCSV(csvText) {
  const lines = csvText.split("\n");
  const headers = lines[0].split(",");

  const latIndex = headers.findIndex((h) => h.includes("latitude"));
  const lonIndex = headers.findIndex((h) => h.includes("longitude"));
  const dateIndex = headers.findIndex((h) => h.includes("datetime"));
  const shapeIndex = headers.findIndex((h) => h.includes("shape"));
  const durationIndex = headers.findIndex((h) =>
    h.includes("duration (seconds)")
  );

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");

    if (values.length > Math.max(latIndex, lonIndex)) {
      const lat = parseFloat(values[latIndex]);
      const lon = parseFloat(values[lonIndex]);
      const duration = parseFloat(values[durationIndex]) || 0;

      if (
        !isNaN(lat) &&
        !isNaN(lon) &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180
      ) {
        allUfoData.push({
          latitude: lat,
          longitude: lon,
          date: values[dateIndex] || "",
          shape: values[shapeIndex] || "unknown",
          duration: duration,
        });
      }
    }
  }
}

function filterByDate(range) {
  activeFilters.dateRange = range;
  updateActiveButton("date", range);
  applyFilters();
}

function filterByDuration(range) {
  activeFilters.duration = range;
  updateActiveButton("duration", range);
  applyFilters();
}

function updateActiveButton(type, value) {
  const prefix = type === "date" ? "filter" : "duration";
  const buttons = document.querySelectorAll(`.filter-group.${type} button`);

  buttons.forEach((btn) => {
    btn.classList.remove("active");
  });

  const activeBtn = document.getElementById(
    `${prefix}${value.charAt(0).toUpperCase() + value.slice(1)}`
  );
  if (activeBtn) activeBtn.classList.add("active");
}

function applyFilters() {
  let filtered = allUfoData;

  if (activeFilters.dateRange !== "all") {
    filtered = filtered.filter((ufo) => {
      const date = parseDate(ufo.date);
      if (!date) return false;

      const year = date.getFullYear();

      switch (activeFilters.dateRange) {
        case "early":
          return year >= 1940 && year < 1980;
        case "mid":
          return year >= 1980 && year < 2000;
        case "recent":
          return year >= 2000;
        default:
          return true;
      }
    });
  }

  if (activeFilters.duration !== "all") {
    filtered = filtered.filter((ufo) => {
      const duration = ufo.duration;

      switch (activeFilters.duration) {
        case "short":
          return duration > 0 && duration < 600; // Menos de 10 min
        case "medium":
          return duration >= 600 && duration <= 1800; // 10-30 min
        case "long":
          return duration > 1800; // Más de 30 min
        default:
          return true;
      }
    });
  }

  ufoData = filtered;

  updateEventCount();
  createUFOMarkers();
}

function parseDate(dateStr) {
  if (!dateStr) return null;

  // Formato: "10/10/1949 20:30"
  const parts = dateStr.split(" ")[0].split("/");
  if (parts.length === 3) {
    const month = parseInt(parts[0]) - 1;
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    return new Date(year, month, day);
  }
  return null;
}

function updateEventCount() {
  const countElement = document.getElementById("eventCount");
  if (countElement) {
    countElement.textContent = `Mostrando ${ufoData.length.toLocaleString()} avistamientos`;
  }
}

function createUFOMarkers() {
  ufoPoints.forEach((pointsObj) => {
    scene.remove(pointsObj);
    pointsObj.geometry.dispose();
    pointsObj.material.dispose();
  });
  ufoPoints = [];

  if (ufoData.length === 0) return;

  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  ufoData.forEach((ufo) => {
    const x = map2Range(ufo.longitude, -180, 180, -mapsx / 2, mapsx / 2);
    const z = map2Range(ufo.latitude, -90, 90, mapsy / 2, -mapsy / 2);
    positions.push(x, 0.3, z);

    const color = getColorByShape(ufo.shape);
    colors.push(color.r, color.g, color.b);
  });

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  const gradient1 = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient1.addColorStop(0, "rgba(255, 255, 255, 0.9)");
  gradient1.addColorStop(0.4, "rgba(255, 255, 255, 0.4)");
  gradient1.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gradient1;
  ctx.fillRect(0, 0, 256, 256);

  const gradient2 = ctx.createRadialGradient(128, 128, 0, 128, 128, 50);
  gradient2.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient2.addColorStop(1, "rgba(255, 255, 255, 0.9)");
  ctx.fillStyle = gradient2;
  ctx.beginPath();
  ctx.arc(128, 128, 50, 0, Math.PI * 2);
  ctx.fill();

  const gradient3 = ctx.createRadialGradient(128, 128, 0, 128, 128, 20);
  gradient3.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient3.addColorStop(1, "rgba(255, 255, 255, 1)");
  ctx.fillStyle = gradient3;
  ctx.beginPath();
  ctx.arc(128, 128, 20, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    map: texture,
    transparent: true,
    opacity: 1,
    sizeAttenuation: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.name = "ufoPoints";
  scene.add(points);
  ufoPoints.push(points);
}

function getColorByShape(shape) {
  const colors = {
    light: new THREE.Color(0xfff20f),
    circle: new THREE.Color(0x2221ff),
    sphere: new THREE.Color(0x97fffa),
    disk: new THREE.Color(0x9700b3),
    triangle: new THREE.Color(0x0aff0b),
    cylinder: new THREE.Color(0xee1000),
    fireball: new THREE.Color(0xff8219),
    formation: new THREE.Color(0xff6ec9),
    unknown: new THREE.Color(0x222233),
  };
  return colors[shape.toLowerCase()] || colors["unknown"];
}

function map2Range(val, vmin, vmax, dmin, dmax) {
  let t = (val - vmin) / (vmax - vmin);
  return dmin + t * (dmax - dmin);
}

function fitCameraToMap() {
  if (!mapa) return;

  const windowAspect = window.innerWidth / window.innerHeight;
  const mapAspect = mapsx / mapsy;

  if (windowAspect > mapAspect) {
    camera.top = mapsy / 2;
    camera.bottom = -mapsy / 2;
    camera.left = (-mapsy / 2) * windowAspect;
    camera.right = (mapsy / 2) * windowAspect;
  } else {
    camera.left = -mapsx / 2;
    camera.right = mapsx / 2;
    camera.top = mapsx / 2 / windowAspect;
    camera.bottom = -mapsx / 2 / windowAspect;
  }

  camera.updateProjectionMatrix();
  controls.target.set(0, 0, 0);
  controls.update();
}

function onWindowResize() {
  fitCameraToMap();
  renderer.setSize(window.innerWidth, window.innerHeight);
  controls.update();
}

function animationLoop() {
  requestAnimationFrame(animationLoop);

  if (ufoPoints.length > 0) {
    const time = Date.now() * 0.001;
    const zoomLevel = camera.zoom;

    ufoPoints.forEach((pointsObj) => {
      const baseSize = pointSizeScale * zoomLevel;
      const scale = 1 + Math.sin(time * 4) * 0.2;
      pointsObj.material.size = baseSize * scale;
      pointsObj.material.opacity = 0.85 + Math.sin(time * 4) * 0.15;
    });
  }

  controls.update();
  renderer.render(scene, camera);
}
