import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { parseCif } from './cif-parser.js';

const canvas = document.getElementById('viewer');
const status = document.getElementById('status');
const fileInput = document.getElementById('file');
const slider = document.getElementById('size');
const reset = document.getElementById('reset');
const exportCsv = document.getElementById('export-csv');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#f8fafc');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
camera.position.set(0, 0, 100);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
scene.add(new THREE.AmbientLight(0xffffff, 1.8));
const light = new THREE.DirectionalLight(0xffffff, 2.5);
scene.add(light);
const geometry = new THREE.SphereGeometry(1, 16, 12);
const material = new THREE.MeshPhongMaterial({ shininess: 35 });
let mesh, connectors, residues = [], center = new THREE.Vector3(), radius = 1;
const dummy = new THREE.Object3D();

function createConnectors(chains) {
  const group = new THREE.Group();
  const connectorGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
  const connectorMaterials = chains.map((chain, i) => new THREE.MeshPhongMaterial({
    color: i === 1 ? '#dc2626' : '#2563eb',
    shininess: 25
  }));
  const axis = new THREE.Vector3(0, 1, 0);

  chains.forEach((chain, chainIndex) => {
    const chainResidues = residues.filter(residue => residue.chain === chain);
    for (let i = 1; i < chainResidues.length; i++) {
      const start = new THREE.Vector3(...chainResidues[i - 1].position).sub(center);
      const end = new THREE.Vector3(...chainResidues[i].position).sub(center);
      const direction = end.clone().sub(start);
      const connector = new THREE.Mesh(connectorGeometry, connectorMaterials[chainIndex]);
      connector.position.copy(start).add(end).multiplyScalar(0.5);
      connector.scale.y = direction.length();
      connector.quaternion.setFromUnitVectors(axis, direction.normalize());
      group.add(connector);
    }
  });
  return group;
}

function distance(a, b) {
  const dx = a.position[0] - b.position[0];
  const dy = a.position[1] - b.position[1];
  const dz = a.position[2] - b.position[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function calculateNearestDistances(chains) {
  const distances = residues.map(residue => {
    const other = residues.filter(candidate => candidate.chain !== residue.chain);
    if (!other.length) return null;
    const nearest = other.reduce((best, candidate) =>
      distance(residue, candidate) < distance(residue, best) ? candidate : best
    );
    residue.nearestNeighbor = nearest;
    return distance(residue, nearest);
  });
  const valid = distances.filter(Number.isFinite);
  if (!valid.length) {
    residues.forEach(residue => { residue.nearestDistance = null; residue.color = new THREE.Color('#64748b'); });
    return { distances, minimum: null, maximum: null };
  }
  const minimum = Math.min(...valid), maximum = Math.max(...valid)/2;
  const gradients = [
    [new THREE.Color('#93c5fd'), new THREE.Color('#00195e')],
    [new THREE.Color('#fed7aa'), new THREE.Color('#560000')]
  ];
  residues.forEach((residue, i) => {
    const amount = maximum === minimum ? 0 : (distances[i] - minimum) / (maximum - minimum);
    residue.nearestDistance = distances[i];
    const gradient = gradients[chains.indexOf(residue.chain)] || gradients[0];
    residue.color = gradient[0].clone().lerp(gradient[1], amount);
  });
  return { distances, minimum, maximum };
}

function csvValue(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function downloadNearestNeighborCsvs(chains) {
  chains.forEach(chain => {
    const rows = [['index', 'amino_acid', 'nearest_neighbor', 'distance_angstroms']];
    residues.filter(residue => residue.chain === chain).forEach(residue => {
      const neighbor = residue.nearestNeighbor;
      rows.push([
        residue.sequence,
        residue.name,
        neighbor ? `${neighbor.name} ${neighbor.sequence}${neighbor.insertion || ''}` : '',
        Number.isFinite(residue.nearestDistance) ? residue.nearestDistance.toFixed(3) : ''
      ]);
    });
    const blob = new Blob([rows.map(row => row.map(csvValue).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chain-${String(chain).replace(/[^a-z0-9_-]/gi, '_')}-nearest-neighbors.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
}

function renderNearestResults(chains) {
  const nearest = document.getElementById('nearest');
  nearest.replaceChildren();
  const title = document.createElement('h2');
  title.textContent = 'Nearest amino acids';
  nearest.append(title);
  const description = document.createElement('p');
  description.textContent = 'Distances are measured between alpha-carbon positions in ångströms (Å).';
  nearest.append(description);
  const grid = document.createElement('div');
  grid.className = 'nearest-grid';
  chains.forEach(chain => {
    const section = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = `Chain ${chain}`;
    section.append(heading);
    const list = document.createElement('ol');
    residues.filter(residue => residue.chain === chain)
      .filter(residue => Number.isFinite(residue.nearestDistance))
      .sort((a, b) => a.nearestDistance - b.nearestDistance)
      .slice(0, 5)
      .forEach(residue => {
        const item = document.createElement('li');
        const insertion = residue.insertion ? residue.insertion : '';
        item.textContent = `${residue.name} ${residue.sequence}${insertion} — ${residue.nearestDistance.toFixed(2)} Å`;
        list.append(item);
      });
    section.append(list);
    grid.append(section);
  });
  nearest.append(grid);
}

function updateSpheres() {
  document.getElementById('size-value').textContent = Number(slider.value).toFixed(1);
  if (!mesh) return;
  residues.forEach((residue, i) => {
    dummy.position.fromArray(residue.position).sub(center);
    dummy.scale.setScalar(Number(slider.value));
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}
function fitView() {
  const halfAngle = Math.min(THREE.MathUtils.degToRad(camera.fov / 2), Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
  const distance = (radius + 3) / Math.sin(halfAngle) * 1.15;
  controls.target.set(0, 0, 0);
  camera.position.set(0, 0, distance);
  camera.near = Math.max(0.01, distance / 10000);
  camera.far = distance * 20;
  camera.updateProjectionMatrix();
  controls.maxDistance = distance * 8;
  controls.update();
}
new ResizeObserver(() => {
  const width = canvas.clientWidth, height = canvas.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}).observe(canvas.parentElement);
renderer.setAnimationLoop(() => {
  controls.update();
  light.position.copy(camera.position);
  renderer.render(scene, camera);
});
slider.addEventListener('input', updateSpheres);
reset.addEventListener('click', fitView);
let loadedChains = [];
exportCsv.addEventListener('click', () => downloadNearestNeighborCsvs(loadedChains));
let loadId = 0;
fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;
  const id = ++loadId;
  status.textContent = `Reading ${file.name}…`;
  try {
    const text = await file.text();
    if (id !== loadId) return;
    const parsed = parseCif(text);
    residues = parsed.residues;
    const chains = [...new Set(residues.map(r => r.chain))];
    loadedChains = chains;
    const bounds = new THREE.Box3();
    residues.forEach(r => bounds.expandByPoint(new THREE.Vector3(...r.position)));
    center = bounds.getCenter(new THREE.Vector3());
    radius = bounds.getSize(new THREE.Vector3()).length() / 2;
    if (mesh) scene.remove(mesh);
    if (connectors) scene.remove(connectors);
    calculateNearestDistances(chains);
    mesh = new THREE.InstancedMesh(geometry, material, residues.length);
    residues.forEach((r, i) => mesh.setColorAt(i, r.color));
    mesh.instanceColor.needsUpdate = true;
    updateSpheres();
    scene.add(mesh);
    connectors = createConnectors(chains);
    scene.add(connectors);
    fitView();
    const legend = document.getElementById('legend');
    legend.replaceChildren();
    chains.forEach(chain => {
      const entry = document.createElement('div');
      entry.className = 'chain';
      const swatch = document.createElement('span');
      swatch.className = 'swatch';
      const chainIndex = chains.indexOf(chain);
      const legendColor = chainIndex === 1 ? '#ea580c' : '#2563eb';
      swatch.style.backgroundColor = legendColor;
      entry.append(swatch, document.createTextNode(`Chain ${chain} · ${residues.filter(r => r.chain === chain).length} amino acids`));
      legend.append(entry);
    });
    renderNearestResults(chains);
    status.textContent = `${file.name} — ${residues.length} amino acids · ${chains.length} protein chains · Model ${parsed.model}${chains.length !== 2 ? ' (this file does not contain exactly two protein chains)' : ''}`;
    reset.disabled = false;
    exportCsv.disabled = false;
  } catch (error) {
    status.textContent = `Unable to load ${file.name}: ${error.message}${mesh ? ' Previous structure is still displayed.' : ''}`;
  }
});
fileInput.disabled = false;
status.textContent = 'Choose a .cif or .mmcif file to view your protein complex.';
