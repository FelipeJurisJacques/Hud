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
  #angle
  #delta
  #scene
  #offset
  #offsets
  #direction
  #intensity
  #wave_line
  #points_depth
  #points_length
  #points_geometry

  constructor() {
    this.#angle = 0.0
    this.#delta = 0.0
    this.#offset = 0.0
    this.#offsets = []
    this.#direction = 0.0
    this.#intensity = 0.0
    this.#wave_line = []
    this.#points_depth = 16
    this.#points_length = 512
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

    const geometry = new THREE.BufferGeometry()
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.004,
      sizeAttenuation: true
    })
    const vertices = []
    let angle = 0.0
    let depth = 0.0
    const delta = Math.PI * 2.0 / this.#points_length
    for (let i = 0; i < this.#points_length; i++) {
      depth = 0.0
      angle += delta
      for (let j = 0; j < this.#points_depth; j++) {
        depth += Math.PI / 2.0 / this.#points_depth
        let offset = 0.8 + Math.sin(depth) / 5.0
        this.#offsets.push(offset)
        vertices.push(
          Math.cos(angle) * offset,
          0.0,
          Math.sin(angle) * offset,
        )
      }
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    const points = new THREE.Points(geometry, material)
    this.#scene.add(points)
    this.#points_geometry = geometry
  }

  animate() {
    this.#animateWave()
    this.#delta += (this.#intensity - this.#delta) * 0.1
    return this.#scene
  }

  speak(intensity) {
    if (intensity < 0.0) {
      this.#intensity = 0.0
    } else if (intensity > 1.0) {
      this.#intensity = 1.0
    } else {
      this.#intensity = intensity
    }
  }

  #vertical(position, indexes, angle) {
    const offset = this.#wave_line[parseInt(indexes[0] / this.#points_depth)]
    const vertex = new THREE.Vector3()
    for (let index of indexes) {
      vertex.fromBufferAttribute(position, index)
      vertex.set(
        Math.cos(angle) * offset,
        vertex.y,
        Math.sin(angle) * offset,
      )
      position.setXYZ(index, vertex.x, vertex.y, vertex.z)
    }
  }

  #animateWave() {
    this.#wave()
    let angle = 0.0
    let indexes = []
    this.#offset += 0.05
    const delta = Math.PI * 2.0 / this.#points_length
    const position = this.#points_geometry.attributes.position
    const length = position.count
    for (let i = 0; i < length; i++) {
      if (i % this.#points_depth === 0) {
        this.#vertical(position, indexes, angle)
        angle += delta
        indexes = []
      }
      indexes.push(i)
    }
    position.needsUpdate = true
  }

  #wave() {
    // const length = parseInt(this.#points_length / 2)
    const length = this.#points_length
    const delta = Math.PI * 2.0 / length
    if (this.#wave_line.length === 0) {
      for (let i = 0; i < length; i++) {
        this.#wave_line.push(this.#waveFun(this.#angle))
        this.#angle += delta * 20
      }
    } else {
      // this.#wave_line.shift()
      // let value = 0
      // for (let n = 1; n <= 10; n++) {
      //   value += Math.sin(n * this.#angle) / n
      // }
      // this.#wave_line.push(value)
      // this.#angle += delta
    }
  }

  #waveFun(a) {
    let value = 0
    for (let n = 1; n <= 10; n++) {
      value += Math.sin(n * a) / n
    }
    return value * 0.01 + 1.0
  }
}

const hud = new Hud()
// hud.speak(10)

function animate() {
  renderer.render(hud.animate(), camera)
  requestAnimationFrame(animate)
}

window.hud = hud

animate()
