// Grab HTML elements
const fileInput = document.getElementById('file-input');
const uploadPrompt = document.getElementById('upload-prompt');
const displayImage = document.getElementById('display-image');
const controls = document.getElementById('controls');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const counterText = document.getElementById('counter-text');
const labelDropdown = document.getElementById('label-dropdown');

// App State
let imagesArray = [];
let currentIndex = 0;

// Reset file input on page load to prevent browser caching bugs
fileInput.value = "";

// 1. Handle Image Uploads
fileInput.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files).slice(0, 5);
    if (files.length === 0) return;

    if (typeof window.runPythonImageProcessor !== "function") {
        alert("Python is still loading its libraries! Please wait a few seconds and try again.");
        return;
    }

    console.log("Sending array to Python...");
    
    // Python returns an array of ready-to-use Base64 image URL strings
    const processedUrlArray = await window.runPythonImageProcessor(files);
    
    console.log("Got processed images back from Python!");

    // Map the URL strings directly into your imagesArray
    imagesArray = processedUrlArray.map((dataUrl, index) => {
        return {
            name: files[index].name, // Keep original file name from JS
            url: dataUrl,            // Use the Base64 string from Python
            category: ""
        };
    });

    // Switch view and display the first image
    uploadPrompt.classList.add('hidden');
    displayImage.classList.remove('hidden');
    controls.classList.remove('hidden');

    currentIndex = 0;
    updateScreen();
});

// 2. Arrow Navigation (Previous)
prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateScreen();
    }
});

// 3. Arrow Navigation (Next)
nextBtn.addEventListener('click', () => {
    if (currentIndex < imagesArray.length - 1) {
        currentIndex++;
        updateScreen();
    }
});

// 4. Save Dropdown Changes
// When user picks an option, save it directly into the current image's array slot
labelDropdown.addEventListener('change', (event) => {
    imagesArray[currentIndex].category = event.target.value;
    console.log("Updated Array:", imagesArray); // See live updates in console!
});

// 5. Master Screen Update Function
function updateScreen() {
    const currentImgData = imagesArray[currentIndex];

    // Update image source
    displayImage.src = currentImgData.url;

    // Update counter text (e.g., "Image 2 of 5")
    counterText.innerText = `Image ${currentIndex + 1} of ${imagesArray.length}`;

    // Sync dropdown to display whatever category was previously saved for this image
    labelDropdown.value = currentImgData.category;

    // Disable arrows if we are at the very beginning or very end of the array
    prevBtn.disabled = (currentIndex === 0);
    nextBtn.disabled = (currentIndex === imagesArray.length - 1);
}