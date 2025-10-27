import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer, activeCamera;
let cameraGeneral, cameraNave, cameraPlaneta;
let controlsGeneral, controlsPlaneta;
let info, sol, nave;
let Planetas = [];
let cometas = [];
let t0 = 0;
let vistaActual = "general";
let planetaSeleccionado = -1;

const CONFIG = {
  accglobal: 0.0005,
  nombres: [
    "Sol",
    "Mercurio",
    "Venus",
    "Tierra",
    "Marte",
    "Júpiter",
    "Saturno",
  ],
  planetasData: [
    {
      radio: 0.4,
      dist: 8,
      vel: 1.8,
      color: 0x8b7355,
      texture: "mercurymap.jpg",
    },
    {
      radio: 0.7,
      dist: 12,
      vel: 1.5,
      color: 0xffc649,
      texture: "venusmap.jpg",
    },
    {
      radio: 0.8,
      dist: 18,
      vel: 1.2,
      color: 0x4a90e2,
      texture: "earthmap1k.jpg",
    },
    {
      radio: 0.6,
      dist: 25,
      vel: 1.0,
      color: 0xe27b58,
      texture: "mars_1k_color.jpg",
    },
    {
      radio: 1.8,
      dist: 38,
      vel: 0.6,
      color: 0xc88b3a,
      texture: "jupiter2_2k.jpg",
    },
    {
      radio: 1.5,
      dist: 52,
      vel: 0.4,
      color: 0xfad5a5,
      texture: "saturnringcolor.jpg",
    },
  ],
  lunasData: [
    { planeta: 2, radio: 0.2, dist: 1.5, vel: 2.5, angle: 0 },
    { planeta: 3, radio: 0.15, dist: 1.2, vel: 3.0, angle: 0 },
    { planeta: 4, radio: 0.25, dist: 3.0, vel: 1.8, angle: Math.PI / 4 },
  ],
};

init();
animationLoop();

function init() {
  crearUI();
  crearEscena();
  crearCamaras();
  crearLuces();
  crearEstrellas();
  crearCuerposCelestes();
  crearNave();
  crearCometas();

  window.addEventListener("keydown", manejarTeclas);
  window.addEventListener("resize", () => {
    [cameraGeneral, cameraNave, cameraPlaneta].forEach((cam) => {
      cam.aspect = window.innerWidth / window.innerHeight;
      cam.updateProjectionMatrix();
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  t0 = Date.now();
}

function crearUI() {
  const estiloBase =
    "position:absolute;color:#fff;font-family:Monospace;z-index:1";

  info = document.createElement("div");
  info.style.cssText = `${estiloBase};top:30px;width:100%;text-align:center;font-weight:bold`;
  info.innerHTML = "Sistema Planetario - V: nave | 1-7: planetas";
  document.body.appendChild(info);

  const colores = [
    "#ffaa00",
    "#8b7355",
    "#ffc649",
    "#4a90e2",
    "#e27b58",
    "#c88b3a",
    "#fad5a5",
  ];
  const lineas = CONFIG.nombres.map(
    (n, i) => `<span style="color:${colores[i]}">${i + 1} - ${n}</span>`
  );
  lineas.push(
    '<span style="color:#aaa">V - Nave</span>',
    '<span style="color:#aaa">0 - Vista General</span>'
  );

  const leyenda = document.createElement("div");
  leyenda.id = "leyenda";
  leyenda.style.cssText = `${estiloBase};top:80px;left:20px;background:rgba(0,0,0,0.7);padding:15px;border-radius:5px;font-size:14px`;
  leyenda.innerHTML = `<strong>VISTAS:</strong><br><br>${lineas.join("<br>")}`;
  document.body.appendChild(leyenda);
}

function crearEscena() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000011);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function crearCamaras() {
  const aspect = window.innerWidth / window.innerHeight;

  cameraGeneral = new THREE.PerspectiveCamera(60, aspect, 0.1, 2000);
  cameraGeneral.position.set(0, 80, 80);

  cameraNave = new THREE.PerspectiveCamera(75, aspect, 0.1, 2000);
  cameraPlaneta = new THREE.PerspectiveCamera(60, aspect, 0.1, 2000);

  activeCamera = cameraGeneral;

  controlsGeneral = new OrbitControls(cameraGeneral, renderer.domElement);
  controlsPlaneta = new OrbitControls(cameraPlaneta, renderer.domElement);
  controlsPlaneta.enabled = false;
}

function crearLuces() {
  scene.add(new THREE.AmbientLight(0x222222));
  const luzSol = new THREE.PointLight(0xffffff, 2, 500);
  scene.add(luzSol);
}

function crearEstrellas() {
  const vertices = [];
  const sizes = [];

  for (let i = 0; i < 5000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    vertices.push(x, y, z);
    sizes.push(Math.random() * 2 + 0.5);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
  });

  const estrellas = new THREE.Points(geometry, material);
  scene.add(estrellas);
}

function crearCometas() {
  for (let i = 0; i < 3; i++) {
    const cometa = {
      grupo: new THREE.Group(),
      velocidad: Math.random() * 0.5 + 0.2,
      angulo: Math.random() * Math.PI * 2,
    };

    const nucleoGeom = new THREE.SphereGeometry(0.3, 8, 8);
    const nucleoMat = new THREE.MeshBasicMaterial({
      color: 0xaaddff,
      emissive: 0x4488ff,
      emissiveIntensity: 0.5,
    });
    const nucleo = new THREE.Mesh(nucleoGeom, nucleoMat);
    cometa.grupo.add(nucleo);

    const colaVertices = [];
    const colaColores = [];
    for (let j = 0; j < 50; j++) {
      const t = j / 50;
      colaVertices.push(-t * 8, 0, 0);
      const alpha = 1 - t;
      colaColores.push(0.6, 0.8, 1.0, alpha);
    }

    const colaGeom = new THREE.BufferGeometry();
    colaGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(colaVertices, 3)
    );
    colaGeom.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colaColores, 4)
    );

    const colaMat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const cola = new THREE.Points(colaGeom, colaMat);
    cometa.grupo.add(cola);

    const dist = 80 + Math.random() * 100;
    cometa.grupo.position.set(
      Math.cos(cometa.angulo) * dist,
      (Math.random() - 0.5) * 40,
      Math.sin(cometa.angulo) * dist
    );

    cometas.push(cometa);
    scene.add(cometa.grupo);
  }
}

function crearCuerposCelestes() {
  const loader = new THREE.TextureLoader();

  const matSol = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    emissive: 0xffaa00,
    emissiveIntensity: 1,
    map: loader.load("src/sunmap.jpg"),
  });
  sol = new THREE.Mesh(new THREE.SphereGeometry(3.5, 32, 32), matSol);
  scene.add(sol);

  CONFIG.planetasData.forEach((p, index) => {
    const mat = new THREE.MeshPhongMaterial({
      color: p.color,
      shininess: 20,
      map: loader.load(`src/${p.texture}`),
    });
    const planeta = new THREE.Mesh(
      new THREE.SphereGeometry(p.radio, 32, 32),
      mat
    );
    planeta.userData = { dist: p.dist, speed: p.vel, f1: 1.0, f2: 1.0 };
    Planetas.push(planeta);
    scene.add(planeta);

    if (index === 5) {
      const anilloGeom = new THREE.RingGeometry(
        p.radio * 1.5,
        p.radio * 2.5,
        64
      );
      const anilloMat = new THREE.MeshBasicMaterial({
        color: 0xccaa77,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const anillo = new THREE.Mesh(anilloGeom, anilloMat);
      anillo.rotation.x = Math.PI / 2;
      planeta.add(anillo);
    }

    const puntos = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      puntos.push(
        new THREE.Vector3(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist)
      );
    }
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(puntos),
        new THREE.LineBasicMaterial({
          color: 0x444444,
          transparent: true,
          opacity: 0.6,
        })
      )
    );
  });

  const texLuna = loader.load("src/moonbump2k.jpg");
  CONFIG.lunasData.forEach((l) => {
    const pivote = new THREE.Object3D();
    pivote.rotation.z = l.angle;
    Planetas[l.planeta].add(pivote);

    const luna = new THREE.Mesh(
      new THREE.SphereGeometry(l.radio, 16, 16),
      new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        shininess: 10,
        map: texLuna,
      })
    );
    luna.userData = { dist: l.dist, speed: l.vel };
    pivote.add(luna);
  });
}

function crearNave() {
  nave = new THREE.Group();

  const cuerpo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.3, 2.0, 8),
    new THREE.MeshPhongMaterial({
      color: 0xdddddd,
      shininess: 50,
      specular: 0x444444,
    })
  );
  cuerpo.rotation.x = Math.PI / 2;
  nave.add(cuerpo);

  const cabina = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhongMaterial({
      color: 0x2244ff,
      transparent: true,
      opacity: 0.6,
      shininess: 100,
    })
  );
  cabina.rotation.x = Math.PI / 2;
  cabina.position.z = 0.8;
  nave.add(cabina);

  const cono = new THREE.Mesh(
    new THREE.ConeGeometry(0.25, 1.0, 8),
    new THREE.MeshPhongMaterial({
      color: 0xff3333,
      emissive: 0xff0000,
      emissiveIntensity: 0.3,
    })
  );
  cono.rotation.x = Math.PI / 2;
  cono.position.z = 1.5;
  nave.add(cono);

  const alaGeom = new THREE.BoxGeometry(1.5, 0.05, 0.6);
  const alaMat = new THREE.MeshPhongMaterial({
    color: 0x888888,
    shininess: 30,
  });

  const alaDer = new THREE.Mesh(alaGeom, alaMat);
  alaDer.position.set(0.75, 0, -0.2);
  nave.add(alaDer);

  const alaIzq = new THREE.Mesh(alaGeom, alaMat);
  alaIzq.position.set(-0.75, 0, -0.2);
  nave.add(alaIzq);

  const reactorGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 8);
  const reactorMat = new THREE.MeshPhongMaterial({ color: 0x444444 });

  [-0.6, 0.6].forEach((x) => {
    const reactor = new THREE.Mesh(reactorGeom, reactorMat);
    reactor.position.set(x, 0, -0.8);
    reactor.rotation.x = Math.PI / 2;
    nave.add(reactor);

    const llama = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.5, 8),
      new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.7,
      })
    );
    llama.rotation.x = -Math.PI / 2;
    llama.position.set(x, 0, -1.2);
    nave.add(llama);
  });

  const luzDelantera = new THREE.PointLight(0xffffff, 0.5, 10);
  luzDelantera.position.set(0, 0, 1.5);
  nave.add(luzDelantera);

  nave.position.set(0, 0, 70);
  scene.add(nave);
}

function manejarTeclas(e) {
  if (e.key === "v" || e.key === "V") cambiarVista("nave", -2);
  else if (e.key === "0") cambiarVista("general", -1);
  else if (e.key >= "1" && e.key <= "7")
    cambiarVista("planeta", parseInt(e.key) - 1);
}

function cambiarVista(tipo, indice) {
  vistaActual = tipo;
  planetaSeleccionado = indice;
  controlsGeneral.enabled = tipo === "general";
  controlsPlaneta.enabled = tipo === "planeta";

  if (tipo === "general") {
    activeCamera = cameraGeneral;
    info.innerHTML = "Vista General - Números 1-7: planetas | V: nave";
  } else if (tipo === "nave") {
    activeCamera = cameraNave;
    info.innerHTML = "Vista Nave - 0: vista general";
  } else {
    activeCamera = cameraPlaneta;
    const nombre = CONFIG.nombres[indice];
    info.innerHTML = `Vista ${nombre} - Cámara viaja con el planeta`;

    if (indice === 0) {
      controlsPlaneta.target.set(0, 0, 0);
      cameraPlaneta.position.set(0, 10, 15);
    } else {
      const p = Planetas[indice - 1];
      const offset = p.geometry.parameters.radius * 4;
      controlsPlaneta.target.copy(p.position);
      cameraPlaneta.position
        .copy(p.position)
        .add(new THREE.Vector3(0, offset * 0.5, offset));
    }
    controlsPlaneta.update();
  }

  actualizarLeyenda(indice);
}

function actualizarLeyenda(sel) {
  const spans = document.querySelectorAll("#leyenda span");
  spans.forEach((span, i) => {
    const esSeleccionado = (sel >= 0 && i === sel) || (sel === -2 && i === 7);
    span.style.cssText = esSeleccionado
      ? "background:yellow;color:black;font-weight:bold;padding:2px 5px"
      : "";
  });
}

function animationLoop() {
  const timestamp = (Date.now() - t0) * CONFIG.accglobal;
  requestAnimationFrame(animationLoop);

  sol.rotation.y += 0.002;

  Planetas.forEach((p) => {
    p.position.x =
      Math.cos(timestamp * p.userData.speed) * p.userData.f1 * p.userData.dist;
    p.position.z =
      Math.sin(timestamp * p.userData.speed) * p.userData.f2 * p.userData.dist;
    p.rotation.y += 0.01;

    p.children.forEach((pivote) => {
      pivote.children.forEach((luna) => {
        luna.position.x =
          Math.cos(timestamp * luna.userData.speed) * luna.userData.dist;
        luna.position.z =
          Math.sin(timestamp * luna.userData.speed) * luna.userData.dist;
        luna.rotation.y += 0.02;
      });
    });
  });

  cometas.forEach((c) => {
    c.angulo += c.velocidad * 0.001;
    const dist = 80 + Math.sin(timestamp * 0.5) * 20;
    c.grupo.position.x = Math.cos(c.angulo) * dist;
    c.grupo.position.z = Math.sin(c.angulo) * dist;
    c.grupo.lookAt(0, c.grupo.position.y, 0);
  });

  nave.position.x = Math.cos(timestamp * 0.3) * 70;
  nave.position.z = Math.sin(timestamp * 0.3) * 70;
  nave.position.y = 5;
  nave.lookAt(0, 5, 0);

  if (vistaActual === "nave") {
    const offset = new THREE.Vector3(0, 2, -5).applyQuaternion(nave.quaternion);
    cameraNave.position.copy(nave.position).add(offset);
    const lookAt = new THREE.Vector3(0, 0, 10)
      .applyQuaternion(nave.quaternion)
      .add(nave.position);
    cameraNave.lookAt(lookAt);
  } else if (vistaActual === "planeta" && planetaSeleccionado > 0) {
    controlsPlaneta.target.copy(Planetas[planetaSeleccionado - 1].position);
    controlsPlaneta.update();
  }

  if (vistaActual === "general") controlsGeneral.update();

  renderer.render(scene, activeCamera);
}
