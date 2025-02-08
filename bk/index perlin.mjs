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
  #wave_matrix
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
    this.#wave_matrix = []
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
    const vertex = new THREE.Vector3()
    for (let index of indexes) {
      let noise = this.#wave_line[index]
      vertex.fromBufferAttribute(position, index)
      // let offset = this.#offsets[index]
      // offset -= 0.9
      // offset *= noise
      // offset += 0.9
      let offset = noise + 1.0
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
    this.#wave_line = []
    const length = this.#points_length
    const delta = Math.PI * 2.0
    if (this.#wave_line.length === 0) {
      for (let x = 0; x < this.#points_length; x++) {
        let waves = []
        for (let y = 0; y < this.#points_depth; y++) {
          let value = this.#perlinWave(x / this.#points_length, 1, 1, 6)
          value *= 0.2
          value += y / this.#points_depth
          value *= 0.1
          waves.push(value)
          this.#wave_line.push(value)
        }
        this.#wave_matrix.push(waves)
      }
    } else {
      // let waves = []
      // for (let y = 0; y < this.#points_depth; y++) {
      //   let value = this.#perlinNoise(this.#wave_matrix.length)
      //   this.#wave_line.shift()
      //   this.#wave_line.push(value)
      //   waves.push(value)
      // }
      // this.#wave_matrix.shift()
      // this.#wave_matrix.push(waves)
    }
    // console.log(this.#wave_matrix)
    // throw new Error('stop')
  }

  #perlinWave(t, freq = 1, amp = 1, octaves = 6) {
    let total = 0;
    for (let i = 0; i < octaves; i++) {
      let freqMult = Math.pow(2, i);
      let ampMult = Math.pow(amp, i);
      total += this.#interpolatedNoise(t * freqMult) * ampMult;
    }
    return total;
  }

  #interpolatedNoise(t) {
    let xi = Math.floor(t);
    let xf = t - xi;
    let u = this.#fade(xf);
    let noise = this.#lerp(this.#grad(xi, xf), this.#grad(xi + 1, xf - 1), u);
    return noise;
  }

  #grad(x, xf) {
    let hash = Math.floor((x + 57) % 4);
    let g = [0, 0, 0, 0];
    g[0] = xf;
    g[1] = xf - 1;
    g[2] = -xf;
    g[3] = -xf + 1;
    return g[hash];
  }

  #fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  #lerp(a, b, x) {
    return a + x * (b - a);
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
