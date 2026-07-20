import io
import base64
from PIL import Image
from js import window, document
from pyodide.ffi import to_js

async def process_image_batch(js_file_array):
    processed_urls = []
    
    for i in range(js_file_array.length):
        js_file = js_file_array[i]
        
        # 1. Read raw image bytes from JavaScript into Python
        array_buf = await js_file.arrayBuffer()
        python_bytes = array_buf.to_bytes()
        
        # 2. Process with Pillow (Converting to Grayscale as an example)
        img = Image.open(io.BytesIO(python_bytes))
        img_processed = img.convert("L") 
        
        # 3. Save the processed image into a temporary Python byte stream
        out_stream = io.BytesIO()
        img_processed.save(out_stream, format="PNG")
        
        # 4. Convert the bytes into a Base64 string (The Wasm-safe bridge!)
        b64_str = base64.b64encode(out_stream.getvalue()).decode("utf-8")
        data_url = f"data:image/png;base64,{b64_str}"
        
        processed_urls.append(data_url)
        
    # Send back a simple JavaScript Array of URL strings
    return to_js(processed_urls)

# Attach to global window
window.runPythonImageProcessor = process_image_batch

# Unlock UI when Pillow is ready
document.getElementById("file-input").disabled = False
document.getElementById("status-text").innerText = "Upload up to 5 Images"
print("Python engine and Pillow are fully loaded and ready!")