// ------------------
// RENDERER
// ------------------
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ------------------
// ESCENA
// ------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color("#0c0f1a");

// ------------------
// CÁMARA
// ------------------
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 3, 6);
camera.lookAt(0, 0, 0);

// ------------------
// LUCES
// ------------------
const luzAmbiental = new THREE.AmbientLight(0xffffff, 0);
scene.add(luzAmbiental);
let luzAmbientalOn = false;

const luzDireccional = new THREE.DirectionalLight(0xffffff, 0);
luzDireccional.position.set(5, 5, 5);
scene.add(luzDireccional);
let luzDireccionalOn = false;

const luzPuntual = new THREE.PointLight(0xffffff, 0, 20);
luzPuntual.position.set(0, 3, 3);
scene.add(luzPuntual);
let luzPuntualOn = false;

// ------------------
// VARIABLES
// ------------------
let wireframeActivo = false;
let rotacionActiva = true;
const objetos = [];

// ------------------
// BORRAR OBJETO ANTERIOR
// ------------------
function borrarAnterior() {
    if (objetos.length > 0) {
        const ultimo = objetos.pop();
        scene.remove(ultimo);
    }
}

// ------------------
// AGREGAR FIGURAS
// ------------------
function agregarCubo() {
    borrarAnterior();
    const obj = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0x2196f3 })
    );
    obj.position.set(0, 0, 0);
    scene.add(obj);
    objetos.push(obj);
}

function agregarEsfera() {
    borrarAnterior();
    const obj = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xff9800 })
    );
    obj.position.set(0, 0, 0);
    scene.add(obj);
    objetos.push(obj);
}

function agregarCilindro() {
    borrarAnterior();
    const obj = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 1.5, 32),
        new THREE.MeshStandardMaterial({ color: 0x4caf50 })
    );
    obj.position.set(0, 0, 0);
    scene.add(obj);
    objetos.push(obj);
}

// ------------------
// BOTONES OBJETOS
// ------------------
document.getElementById("btnCubo").onclick = agregarCubo;
document.getElementById("btnEsfera").onclick = agregarEsfera;
document.getElementById("btnCilindro").onclick = agregarCilindro;

// ------------------
// EFECTOS
// ------------------
document.getElementById("btnWireframe").onclick = () => {
    wireframeActivo = !wireframeActivo;
    if (objetos.length > 0) objetos[0].material.wireframe = wireframeActivo;
};

document.getElementById("btnRotacion").onclick = () => {
    rotacionActiva = !rotacionActiva;
};

// ------------------
// LUCES
// ------------------
document.getElementById("btnAmbiente").onclick = () => {
    luzAmbientalOn = !luzAmbientalOn;
    luzAmbiental.intensity = luzAmbientalOn ? 0.5 : 0;
};

document.getElementById("btnDireccional").onclick = () => {
    luzDireccionalOn = !luzDireccionalOn;
    luzDireccional.intensity = luzDireccionalOn ? 1 : 0;
};

document.getElementById("dirY").oninput = e => {
    luzDireccional.position.y = parseFloat(e.target.value);
};

document.getElementById("btnPuntual").onclick = () => {
    luzPuntualOn = !luzPuntualOn;
    luzPuntual.intensity = luzPuntualOn ? 1 : 0;
};

document.getElementById("pX").oninput = e => luzPuntual.position.x = parseFloat(e.target.value);
document.getElementById("pY").oninput = e => luzPuntual.position.y = parseFloat(e.target.value);
document.getElementById("pZ").oninput = e => luzPuntual.position.z = parseFloat(e.target.value);

// ------------------
// COLOR HOMOGÉNEO
// ------------------
document.getElementById("btnColor").onclick = () => {
    if (objetos.length === 0) return;
    const color = document.getElementById("selectColor").value;
    objetos[0].material = new THREE.MeshStandardMaterial({
        color,
        wireframe: wireframeActivo
    });
};

// ------------------
// COLOR DEGRADADO
// ------------------
document.getElementById("btnDegradado").onclick = () => {
    if (objetos.length === 0) return;
    const obj = objetos[0];
    const geo = obj.geometry;
    const pos = geo.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const y = pos.getY(i);
        const t = (y + 0.75) / 1.5;
        colors[i * 3] = t;
        colors[i * 3 + 1] = 0.2;
        colors[i * 3 + 2] = 1 - t;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    obj.material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        wireframe: wireframeActivo
    });
};

// ------------------
// TEXTURAS
// ------------------
document.querySelectorAll(".btnTexture").forEach(btn => {
    btn.onclick = () => {
        if (objetos.length === 0) return;
        new THREE.TextureLoader().load(btn.dataset.t, textura => {
            objetos[0].material = new THREE.MeshStandardMaterial({ map: textura });
        });
    };
});

// ------------------
// TÉCNICAS DE SOMBREADO
// ------------------
document.querySelectorAll(".btnShading").forEach(btn => {
    btn.onclick = () => {
        if (objetos.length === 0) return;
        const obj = objetos[0];
        const tipo = btn.dataset.s;

        switch(tipo) {
            case "constante":
                obj.material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframeActivo });
                break;
            case "flat":
                obj.material = new THREE.MeshStandardMaterial({ color: 0x00ff00, flatShading: true, wireframe: wireframeActivo });
                obj.geometry.computeVertexNormals();
                break;
            case "interpolado":
                obj.material = new THREE.MeshStandardMaterial({ color: 0x0000ff, flatShading: false, wireframe: wireframeActivo });
                obj.geometry.computeVertexNormals();
                break;
            case "gouraud":
                obj.material = new THREE.MeshLambertMaterial({ color: 0xffff00, wireframe: wireframeActivo });
                break;
            case "phong":
                obj.material = new THREE.MeshPhongMaterial({ color: 0xff00ff, shininess: 100, specular: 0xffffff, wireframe: wireframeActivo });
                break;
            case "fractales":
                const geo = obj.geometry.clone();
                const pos = geo.attributes.position;
                for (let i = 0; i < pos.count; i++) {
                    pos.setXYZ(i,
                        pos.getX(i) + (Math.random() - 0.5) * 0.3,
                        pos.getY(i) + (Math.random() - 0.5) * 0.3,
                        pos.getZ(i) + (Math.random() - 0.5) * 0.3
                    );
                }
                geo.computeVertexNormals();
                obj.geometry = geo;
                obj.material = new THREE.MeshStandardMaterial({ color: 0x00ffff, wireframe: wireframeActivo });
                break;
        }
    };
});

// ------------------
// TRANSFORMACIONES
// ------------------
function actualizarTransformaciones() {
    if (objetos.length === 0) return;
    const obj = objetos[0];
    obj.rotation.x = parseFloat(document.getElementById("rotX").value);
    obj.rotation.y = parseFloat(document.getElementById("rotY").value);
    obj.rotation.z = parseFloat(document.getElementById("rotZ").value);

    obj.position.x = parseFloat(document.getElementById("transX").value);
    obj.position.y = parseFloat(document.getElementById("transY").value);
    obj.position.z = parseFloat(document.getElementById("transZ").value);

    obj.scale.x = parseFloat(document.getElementById("scaleX").value);
    obj.scale.y = parseFloat(document.getElementById("scaleY").value);
    obj.scale.z = parseFloat(document.getElementById("scaleZ").value);
}

["rotX","rotY","rotZ","transX","transY","transZ","scaleX","scaleY","scaleZ"].forEach(id => {
    document.getElementById(id).oninput = actualizarTransformaciones;
});

// ------------------
// ANIMACIÓN
// ------------------
function animar() {
    requestAnimationFrame(animar);
    if (rotacionActiva && objetos.length > 0) {
        objetos[0].rotation.x += 0.01;
        objetos[0].rotation.y += 0.01;
    }
    renderer.render(scene, camera);
}
animar();

// ------------------
// RESPONSIVE
// ------------------
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});