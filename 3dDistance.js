import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';



document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const points = parse3DPoints(content);
            let dist = minPWDist(points);
            displayPoints(points, dist);
            print('hi')
            alert (dist)
             document.getElementById('results').innerHTML="Points Detected: " + points.length + " <br> Minimum Pairwise Distance: " + dist[0]
            + " <br> Between points " + dist[1] + " and " +dist[2]
                        
            console.log('Parsed points:', points);
            console.log(`Found ${points.length} points`);
            
            // Display results
            // document.getElementById('output').innerHTML = `
            //     <p>Successfully parsed ${points.length} points</p>
            //     <pre>${JSON.stringify(points, null, 2)}</pre>
            // `;
            
        } catch (error) {
            console.error('Error parsing file:', error);
            document.getElementById('output').innerHTML = 
                `<p style="color: red;">Error: ${error.message}</p>`;
        }
    };
    
    reader.onerror = function() {
        console.error('Error reading file');
    };
    
    reader.readAsText(file);
});

function parse3DPoints(content) {
    const lines = content.split('\n');
    const points = [];
    let lineNumber = 0;
    
    for (const line of lines) {
        lineNumber++;
        const trimmedLine = line.trim();
        
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        
        // Split by tab (or multiple tabs/spaces)
        // Split by any whitespace (tabs, spaces, multiple spaces)
        const coords = trimmedLine.split(/\s+/).filter(coord => coord !== '');
        
        if (coords.length < 3) {
                continue;
        }
        
        // Convert to numbers
        const x = parseFloat(coords[coords.length-3]);
        const y = parseFloat(coords[coords.length-2]);
        const z = parseFloat(coords[coords.length-1]);
        
        if (isNaN(x) || isNaN(y) || isNaN(z)) {
            continue;
        }
        else {
            points.push([x, y, z]);
        }
        
    }
    
    if (points.length === 0) {
        throw new Error('No valid points found in file');
    }
    
    return points;
}

function minPWDist(points) {
    let minDist = []
    minDist[0]=distance(points[0],points[1]);
    minDist[1]=1
    minDist[2]=2
    for(let i = 0; i<points.length; i++){
        for(let j = i+1; j<points.length; j++){
            let dist = distance(points[i],points[j])
            if(dist<minDist[0]){
                minDist[0]=dist
                minDist[1]=i+1
                minDist[2]=j+1
            };
        }
    }
    return minDist;
}

function distance(pointA, pointB){
    let distX = (pointA[0]-pointB[0])**2
    let distY = (pointA[1]-pointB[1])**2
    let distZ = (pointA[2]-pointB[2])**2
    let dist = Math.sqrt(distX+distY+distZ);
    return dist;
}


document.getElementById("textInputButton").addEventListener("click", function() {
            const content = document.getElementById('textInput').value
            const points = parse3DPoints(content);
            let dist = minPWDist(points);
            displayPoints(points, dist);
            // alert (dist)
            document.getElementById('results').innerHTML="Points Detected: " + points.length + " <br> Minimum Pairwise Distance: " + dist[0]
            + " <br> Between points " + dist[1] + " and " +dist[2]

});







const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const canvas = document.querySelector('#bg');
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias: true 
});

renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.5,
    1000
);

// OrbitControls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

camera.position.set(0, 5, 0);
controls.update();


        var ambientLight = new THREE.AmbientLight(0xaaaaaa, 1)
        scene.add(ambientLight)

        var pointLight = new THREE.PointLight(0xFFD700, 8, 100, 1)
        scene.add(pointLight)


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    pointLight.position.copy(camera.position);
    renderer.render(scene, camera);
}
animate();




window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
});

let currentDisplay = []

function displayPoints(points, minDist){

    for(let i = 0; i<currentDisplay.length; i++){
        scene.remove(currentDisplay[i])
    }
    currentDisplay = []

    console.log(minDist)
    let pointGeo = new THREE.SphereGeometry(minDist[0]/2, 32)
    let pointMesh = new THREE.MeshPhongMaterial({ color: 0xffff00 }); // yellow
    let minDistMesh = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Red
    let OGsphere = new THREE.Mesh(pointGeo, pointMesh)
    let specialSphere = new THREE.Mesh(pointGeo, minDistMesh)
    for(let i = 0; i<points.length; i++){

        let sphere
        if(i==minDist[1]-1||i==minDist[2]-1){
            sphere = specialSphere.clone() 
            console.log(i)
        }
        else{
  
            sphere = OGsphere.clone()
        }
        sphere.position.set(points[i][0],points[i][1],points[i][2])
        scene.add(sphere)
        currentDisplay.push(sphere)
    }
}