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
  #offset
  #offsets
  #direction
  #intensity
  #points_depth
  #points_length
  #points_geometry

  constructor() {
    this.#delta = 0.0
    this.#offset = 0.0
    this.#offsets = []
    this.#direction = 0.0
    this.#intensity = 0.0
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

  #left(index) {
    index -= this.#points_depth
    if (index < 0) {
      index += this.#offsets.length
    }
    const value = this.#offsets[index]
    if (value > 1.0) {
      return 1.0
    } else if (value < 0.8) {
      return 0.8
    }
    return value
  }

  #right(index) {
    index += this.#points_depth
    if (index >= this.#offsets.length) {
      index -= this.#offsets.length
    }
    const value = this.#offsets[index]
    if (value > 1.0) {
      return 1.0
    } else if (value < 0.8) {
      return 0.8
    }
    return value
  }

  #up(index) {
    index += 1
    if (index >= this.#offsets.length || index % this.#points_depth === 0) {
      return 1.0
    }
    const value = this.#offsets[index]
    return value > 1.0 ? 1.0 : value
  }

  #down(index) {
    if (index <= 0 || index % this.#points_depth === 0) {
      return 0.8
    }
    index -= 1
    const value = this.#offsets[index]
    return value < 0.8 ? 0.8 : value
  }

  #noise(position, index, angle) {
    const noise = Math.sin(this.#direction * angle * 10.0) * 0.001
    const vertex = new THREE.Vector3()
    vertex.fromBufferAttribute(position, index)
    const up = this.#up(index)
    const down = this.#down(index)
    const left = this.#left(index)
    const right = this.#right(index)
    let offset = this.#offsets[index]
    // console.log(
    //   index,
    //   index === 0 || index % this.#points_depth === 0,
    //   offset,
    //   down,
    //   up
    // )
    if (offset > up && offset > down && offset > left && offset > right) {
      offset -= 0.002
    } else if (offset < down && offset < up && offset < left && offset < right) {
      offset += 0.002
    } else {
      offset += noise
    }
    this.#offsets[index] = offset
    vertex.set(
      Math.cos(angle) * offset,
      vertex.y,
      Math.sin(angle) * offset,
    )
    position.setXYZ(index, vertex.x, vertex.y, vertex.z)
  }

  #animateWave() {
    if (this.#direction > 1.0) {
      this.#direction -= Math.random() * 0.3
    } else if (this.#direction < -1.0) {
      this.#direction += Math.random() * 0.3
    } else {
      this.#direction += Math.random() * 0.1 - 0.05
    }
    let angle = 0.0
    this.#offset += 0.05
    const delta = Math.PI * 2.0 / this.#points_length
    const position = this.#points_geometry.attributes.position
    const length = position.count
    for (let i = 0; i < length; i++) {
      if (i % this.#points_depth === 0) {
        angle += delta
      }
      this.#noise(position, i, angle)
      // if (i > this.#points_depth) {
      //   throw new Error('break')
      // }
    }
    position.needsUpdate = true
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
