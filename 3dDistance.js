document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const points = parse3DPoints(content);
            let dist = minPWDist(points);
            // alert (dist)
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
    minDist[1]=0
    minDist[2]=1
    for(let i = 0; i<points.length; i++){
        for(let j = i+1; j<points.length; j++){
            dist = distance(points[i],points[j])
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
            // alert (dist)
            document.getElementById('results').innerHTML="Points Detected: " + points.length + " <br> Minimum Pairwise Distance: " + dist[0]
            + " <br> Between points " + dist[1] + " and " +dist[2]

});
