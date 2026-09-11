// Grab HTML elements
const fileInput = document.getElementById('file-input');
const uploadPrompt = document.getElementById('upload-prompt');
const displayImage = document.getElementById('display-image');
const controls = document.getElementById('controls');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const skipBtn = document.getElementById('remove-btn');
const posBtn = document.getElementById('present-btn');
const negBtn = document.getElementById('missing-btn');
const indexDropdown = document.getElementById('index-dropdown');
// const counterText = document.getElementById('counter-text');
const labelDropdown = document.getElementById('label-dropdown');
const predictionDisplay = document.getElementById('prediction-display'); // <-- NEW
const accDisplay = document.getElementById('percentage-display')

// App State
let imagesArray = [];
let currentIndex = 0;

// Reset file input on page load to prevent browser caching bugs
fileInput.value = "";

// 1. Handle Image Uploads
const pythonStatus = document.getElementById('python-status');

// 0. Wait for Python to load before enabling uploads
const checkPythonReady = setInterval(() => {
    // Check if your python function exists yet
    if (typeof window.runPythonImageProcessor === "function") {
        clearInterval(checkPythonReady); // Stop checking
        
        // Enable the file input
        fileInput.disabled = false;
        
        // Update the text to show it's ready
        pythonStatus.innerText = "✅ Python Ready! You can now upload images.";
        pythonStatus.style.color = "#00ff00"; 
        
        // Optional: Fade out or hide the text after 3 seconds so it's out of the way
        setTimeout(() => {
            pythonStatus.style.display = "none";
        }, 3000);
    }
}, 500); // Checks every 500 milliseconds


fileInput.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files).slice(0, 100);
    if (files.length === 0) return;



    console.log("Sending array to Python...");
    
    // Python returns an array of ready-to-use Base64 image URL strings
    const processedDataArray = await window.runPythonImageProcessor(files);
    
    console.log("Got processed images back from Python!");

    // Map the URL strings directly into your imagesArray
    // Change your mapping function to use .get() to read from the Pyodide Map:
    imagesArray = processedDataArray.map((dataObj, index) => {
        return {
            name: files[index].name,         // Keep original file name from JS
            url: dataObj.get("url"),         // <-- CHANGE THIS: use .get("url")
            prediction: dataObj.get("prediction"), // <-- CHANGE THIS: use .get("prediction")
            category: ""
        };
    });

    // Switch view and display the first image
    uploadPrompt.classList.add('hidden');
    displayImage.classList.remove('hidden');
    predictionDisplay.classList.remove('hidden'); // <-- Show the text element!
    controls.classList.remove('hidden');    currentIndex = 0;
    populateIndexDropdown()
    updateScreen(1);
    

});

function populateIndexDropdown() {
    indexDropdown.innerHTML = ''; // Clear out any old options
    
    imagesArray.forEach((img, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = `Image ${index + 1}`;
        indexDropdown.appendChild(option);
    });
}

// Listen for when the user selects a different image from the dropdown
indexDropdown.addEventListener('change', (e) => {
    // e.target.value is a string, so we convert it to a number
    currentIndex = parseInt(e.target.value, 10);
    updateScreen(0);
});

// 2. Arrow Navigation (Previous)
prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateScreen(0);
    }
});

// 3. Arrow Navigation (Next)
nextBtn.addEventListener('click', () => {
    if (currentIndex < imagesArray.length - 1) {
        currentIndex++;
        updateScreen(0);
    }
});

skipBtn.addEventListener('click', () => {
    updatePrediction('Skipped')
})

posBtn.addEventListener('click', () => {
    updatePrediction(1)
})

negBtn.addEventListener('click', () => {
    updatePrediction(0)
})





// 5. Master Screen Update Function
// 5. Master Screen Update Function
function updateScreen(bonus) {

    const currentImgData = imagesArray[currentIndex];

    // Update image source
    displayImage.src = currentImgData.url;
    
    // Update Prediction Display underneath the image
    predictionDisplay.innerText = `Predicted Exopher Count: ${currentImgData.prediction}`;

    switch (currentImgData.prediction){
        case 0: 
            controls.style.backgroundColor = "#220000" 
            break;
        case 1:
            controls.style.backgroundColor = "#002200"
            break;
        default:
            controls.style.backgroundColor = "#222000"
    }
    
    // Update counter text (e.g., "Image 2 of 5")
    // counterText.innerText = `Image ${currentIndex + 1} of ${imagesArray.length}`;

    // Sync dropdown to display whatever category was previously saved for this image
    indexDropdown.value = currentIndex;

    // Disable arrows if we are at the very beginning or very end of the array
    prevBtn.disabled = (currentIndex === 0);
    nextBtn.disabled = (currentIndex === imagesArray.length - 1);

    accDisplay.innerText = accuracyCheck(imagesArray, bonus).percent.toFixed(2) + '% have exophers present'
}

function accuracyCheck(imagesArray, bonus){
    let total = 0
    let present = 0
    let missing = 0
    let skipped = 0
    for(let i = 0; i<imagesArray.length; i++){
        const storedGuess = imagesArray[i].prediction;    
        const intGuess = Number(storedGuess)

        if (Number.isNaN(intGuess)){continue;}

        total++
        present+=intGuess
        
    }
    let AmtWithExophers = []
    AmtWithExophers.absent = total-present
    AmtWithExophers.present = present
    AmtWithExophers.percent = present/total * 100
    AmtWithExophers.counted = total
    AmtWithExophers.skipped = imagesArray.length - total
    AmtWithExophers.imagecount = imagesArray.length
    
    if(bonus==1){
        let infoMessage = "Skipped: " + AmtWithExophers.skipped + '\n' +
            "Present: " + AmtWithExophers.present + '\n' +
            "Absent: " + AmtWithExophers.absent
        alert(infoMessage)
    }
    return AmtWithExophers

}

function updatePrediction(value){
    imagesArray[currentIndex].prediction = value;
    updateScreen(0)
}