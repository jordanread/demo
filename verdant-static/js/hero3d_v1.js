const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
1000
)

const renderer = new THREE.WebGLRenderer({
canvas: document.getElementById("robotCanvas"),
alpha: true
})

renderer.setSize(window.innerWidth, window.innerHeight)

camera.position.z = 6

const light = new THREE.PointLight(0xffffff,1)
light.position.set(5,5,5)
scene.add(light)

const geometry = new THREE.BoxGeometry(2,0.7,1)

const material = new THREE.MeshStandardMaterial({
color:0x4caf50
})

const rover = new THREE.Mesh(geometry,material)

scene.add(rover)

const wheelGeometry = new THREE.CylinderGeometry(0.3,0.3,0.4,32)

const wheelMaterial = new THREE.MeshStandardMaterial({
color:0x222222
})

function createWheel(x){
const wheel = new THREE.Mesh(wheelGeometry,wheelMaterial)
wheel.rotation.z = Math.PI/2
wheel.position.x = x
wheel.position.y = -0.4
scene.add(wheel)
return wheel
}

const w1 = createWheel(-0.8)
const w2 = createWheel(0.8)

function animate(){

requestAnimationFrame(animate)

rover.rotation.y += 0.003

w1.rotation.x += 0.1
w2.rotation.x += 0.1

renderer.render(scene,camera)

}

animate()