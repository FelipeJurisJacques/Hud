import * as THREE from './three/three.module.min.js'

const canvas = document.getElementById('canvas')
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
// document.body.appendChild(renderer.domElement)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -2, 0)
camera.lookAt(new THREE.Vector3(0, 0, 0))

class Hud {
  #delta
  #scene
  #points
  #intensity
  #cylinderGeometry

  constructor() {
    this.#delta = 0
    this.#intensity = 0
    this.#scene = new THREE.Scene()

    const gridHelper = new THREE.GridHelper(10, 10)
    this.#scene.add(gridHelper)

    const ambientLight = new THREE.AmbientLight(0xffffff, 5)
    this.#scene.add(ambientLight)

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 5)
    directionalLight1.position.set(1, 0, 1)
    this.#scene.add(directionalLight1)
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 5)
    directionalLight2.position.set(-1, 0, -1)
    this.#scene.add(directionalLight2)

    // Criação do cilindro fino
    // const cylinderMaterial = new THREE.MeshStandardMaterial({
    //   color: 0xffffff,
    //   roughness: 0.9, // Controla a rugosidade
    //   metalness: 0.7, // Controla o brilho metálico
    //   side: THREE.DoubleSide,
    //   depthWrite: false,
    //   opacity: 0.3,
    //   transparent: true,
    //   // specular: 0xffffff,
    // })
    // const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    // cylinderMesh.rotation.set(0.4, 0, 0.4)
    // scene.add(cylinderMesh)
    this.#cylinderGeometry = new THREE.CylinderGeometry(1, 0.85, 0.5, 512, 32, true)
    this.#points = new THREE.Points(this.#cylinderGeometry, new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.004,
      sizeAttenuation: true
    }))
    this.#scene.add(this.#points)
  }

  animate() {
    this.#animateWave()
    if (this.#intensity > this.#delta) {
      this.#delta += 1.0
    } else if (this.#delta > this.#intensity) {
      this.#delta -= 1.0
    }
    return this.#scene
  }

  speak(intensity) {
    this.#intensity = intensity
  }

  #animateWave() {
    let delta = 100000
    let time = performance.now()
    let wave = 20 / delta
    wave = 0.0002
    if (this.#delta > 0) {
      wave = 0.006
      delta = 10000
    }
    let delta1 = time * (51 / delta)
    let delta2 = time * (72 / delta)
    const position = this.#cylinderGeometry.attributes.position
    const vertex = new THREE.Vector3()
    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i)
      let angle = Math.atan2(vertex.y, vertex.x)
      const radius = 1.0 + wave * Math.sin(angle * 127 + delta1)
      vertex.set(
        vertex.x * radius,
        vertex.y * radius,
        vertex.z * (1.0 + wave * Math.cos(angle * 7 + delta2))
      )
      position.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }
    position.needsUpdate = true
    this.#points.rotation.y += 20 / delta
  }
}

const hud = new Hud()
hud.speak(10)

function animate() {
  requestAnimationFrame(animate)
  renderer.render(hud.animate(), camera)
}

window.hud = hud

animate()
