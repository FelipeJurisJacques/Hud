import * as THREE from './three/three.module.min.js'

const canvas = document.getElementById('canvas')
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})

// const scene = new THREE.Scene()
// const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000)
// camera.position.set(0, -4, 0)
// camera.lookAt(new THREE.Vector3(0, 0, 0))
// scene.add(camera)

// // const light = new THREE.PointLight(0xffffff, 100, 100)
// // light.position.set(5, 5, 5)
// // scene.add(light)

// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
// scene.add(ambientLight)

// const directionalLight = new THREE.DirectionalLight(0x111111, 100)
// directionalLight.position.set(5, 0, 5)
// scene.add(directionalLight)



// const geometry = new THREE.SphereGeometry(2, 64, 64)
// const material = new THREE.MeshPhongMaterial({
//   // color: 0x0077ff,
//   wireframe: false,
//   roughness: 0.5,
//   metalness: 0.6,
//   color: 0x007bff,
//   // shininess: 100,
//   // reflectivity: 0.5,
//   specular: 0xffffff
// })
// const sphere = new THREE.Mesh(geometry, material)
// sphere.position.set(0, 0, 0)
// sphere.scale.set(1, 1, 1)
// sphere.rotation.set(0, 0, 0)
// scene.add(sphere)

// const normalMap = new THREE.TextureLoader().load('normal_map.png')
// material.normalMap = normalMap

// function animate() {
//   requestAnimationFrame(animate)
//   const time = performance.now() * 0.001
//   const position = geometry.attributes.position
//   const vertex = new THREE.Vector3()
//   for (let i = 0; i < position.count; i++) {
//     vertex.fromBufferAttribute(position, i)
//     const wave = 0.1 * Math.sin(vertex.x * 3 + time) + 0.1 * Math.cos(vertex.y * 3 + time)
//     vertex.z = wave
//     position.setXYZ(i, vertex.x, vertex.y, vertex.z)
//   }
//   position.needsUpdate = true
//   renderer.render(scene, camera)

//   // for (let i = 0; i < position.count; i++) {
//   //   // Obtém as coordenadas originais do vértice
//   //   vertex.fromBufferAttribute(position, i);

//   //   // Calcula o comprimento do vetor para preservar a distância original ao centro (raio da esfera)
//   //   const length = vertex.length();

//   //   // Aplica o deslocamento com base em ondas, preservando o formato esférico
//   //   const wave = 0.1 * Math.sin(vertex.x * 5 + time) + 0.1 * Math.cos(vertex.y * 5 + time);
//   //   vertex.normalize().multiplyScalar(length + wave); // Normaliza o vetor e ajusta o comprimento

//   //   // Define os novos valores no atributo de posição
//   //   position.setXYZ(i, vertex.x, vertex.y, vertex.z);
//   // }
// }
// animate()

// Configurações básicas
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -2, 0)
camera.lookAt(new THREE.Vector3(0, 0, 0))

// const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.debug = true
renderer.debug = true
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);


const ambientLight = new THREE.AmbientLight(0xffffff, 5)
scene.add(ambientLight)

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 5)
directionalLight1.position.set(1, 0, 1)
scene.add(directionalLight1)
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 5)
directionalLight2.position.set(-1, 0, -1)
scene.add(directionalLight2)
// const ambientLight = new THREE.AmbientLight(0xffffff, 1)
// scene.add(ambientLight)

// // const directionalLight = new THREE.DirectionalLight(0x111111, 100)
// // directionalLight.position.set(10, -5, 50)
// // scene.add(directionalLight)

// const pointLight = new THREE.PointLight(0xffffff, 5.5, 10)
// pointLight.position.set(0, 0, 4)
// scene.add(pointLight)

// Criação do cilindro fino
const geometry = new THREE.CylinderGeometry(1, 1, 0.5, 128, 3, true); // Cilindro aberto
// const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.9, // Controla a rugosidade
  metalness: 0.7, // Controla o brilho metálico
  side: THREE.DoubleSide,
  depthWrite: false,
  opacity: 0.3,
  transparent: true,
  // specular: 0xffffff,
})
// const material = new THREE.MeshPhongMaterial({
//   // color: 0x0077ff,
//   wireframe: false,
//   roughness: 0.5,
//   metalness: 0.6,
//   color: 0x007bff,
//   // shininess: 100,
//   // reflectivity: 0.5,
//   specular: 0xffffff,
//   side: THREE.DoubleSide,
// })
// const normalMap = new THREE.TextureLoader().load('normal_map.png')
// material.normalMap = normalMap
const cylinder = new THREE.Mesh(geometry, material);
// cylinder.rotation.set(0.4, 0, 0.4)
scene.add(cylinder);



const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16)
const sphereMaterial = new THREE.MeshPhongMaterial({
  // color: 0x0077ff,
  wireframe: true,
  roughness: 0.5,
  metalness: 0.6,
  color: 0x007bff,
  // shininess: 100,
  // reflectivity: 0.5,
  specular: 0xffffff
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.position.set(0, 0, 0)
sphere.scale.set(1, 1, 1)
sphere.rotation.set(0.5, 0, 0.5)
scene.add(sphere)


// Função para animar o cilindro
function animateWave() {
  const time = performance.now() * 0.0005 // Tempo para animação
  const position = geometry.attributes.position; // Atributo de posição
  const vertex = new THREE.Vector3(); // Vetor temporário

  for (let i = 0; i < position.count; i++) {
    // Obtém a posição do vértice
    vertex.fromBufferAttribute(position, i);

    // Calcula o ângulo e a distância radial
    const angle = Math.atan2(vertex.y, vertex.x); // Ângulo ao redor do eixo central
    const wave = 0.0001 * Math.sin(angle * 128 + time); // Onda radial

    // Ajusta o raio, mantendo a altura constante
    const radius = 1 + wave; // Raio baseado na onda
    vertex.set(vertex.x * radius, vertex.y * radius, vertex.z);

    // Atualiza os valores no atributo de posição
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  position.needsUpdate = true; // Marca a geometria como atualizada
}

// Loop de animação
function animate() {
  requestAnimationFrame(animate);

  animateWave(); // Atualiza o cilindro com a animação
  cylinder.rotation.y += 0.001 // Rotação para visualização

  renderer.render(scene, camera);
}

animate();
