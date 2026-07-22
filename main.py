import io
import base64
from PIL import Image
from js import window, document
from pyodide.ffi import to_js
from collections import deque
import cv2
import numpy as np
from skimage.morphology import skeletonize
import pandas as pd
import numpy as np
from scipy.spatial import KDTree
# import IPython.display as display

def get_valid_neighbors(pt, skeleton_bool):
    """Finds all 8-connected neighboring pixels that belong to the skeleton."""
    y, x = pt
    height, width = skeleton_bool.shape
    neighbors = []

    for dy in [-1, 0, 1]:
        for dx in [-1, 0, 1]:
            if dy == 0 and dx == 0:
                continue

            ny, nx = y + dy, x + dx

            # 1. Bounds check: prevent negative index wrapping and out-of-bounds crashes
            if 0 <= ny < height and 0 <= nx < width:
                # 2. Direct O(1) boolean array lookup (10,000x faster than set recreation!)
                if skeleton_bool[ny, nx]:
                    neighbors.append((ny, nx))

    return neighbors

def find_longest_path_from(start_node, skeleton_bool):
    """Runs a BFS to find the farthest pixel and the exact path to it."""
    queue = deque([(start_node, [start_node])])
    visited = {start_node}

    farthest_node = start_node
    longest_path = [start_node]

    while queue:
        curr, path = queue.popleft()

        # If this path is longer than our current record, update it
        if len(path) > len(longest_path):
            longest_path = path
            farthest_node = curr

        for neighbor in get_valid_neighbors(curr, skeleton_bool):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))

    return farthest_node, longest_path

def counter(image):

    # _, binary = cv2.threshold(image, 10, 255, cv2.THRESH_BINARY)
    # binary = np.uint8(binary)
    # num_labels_worm, labels_worm, stats_worm, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    # largest_label = 1 + np.argmax(stats_worm[1:, cv2.CC_STAT_AREA])
    # worm_mask_bool = (labels_worm == largest_label)
    # skeleton_bool = skeletonize(worm_mask_bool)




    skip = False
    predictionA = 0
    predictionB = 0
    predictionC = 0

    _, binary_worm = cv2.threshold(image, 10, 255, cv2.THRESH_BINARY)
    binary_worm = np.uint8(binary_worm)
    num_labels_worm, labels_worm, stats_worm, centroids_worm = cv2.connectedComponentsWithStats(binary_worm, connectivity=8)

    if num_labels_worm <= 1:
        raise ValueError("No worm found")

    largest_label = 1 + np.argmax(stats_worm[1:, cv2.CC_STAT_AREA])
    worm_mask_bool = (labels_worm == largest_label)
    skeleton_bool = skeletonize(worm_mask_bool)

    skeleton_pts = [tuple(pt) for pt in np.argwhere(skeleton_bool)]
    pt_set = set(skeleton_pts)

    # (Assuming find_longest_path_from is defined in your notebook from before)
    if skeleton_pts:
        random_start = skeleton_pts[0]
        endpoint_A, _ = find_longest_path_from(random_start, skeleton_bool)
        endpoint_B, true_spine = find_longest_path_from(endpoint_A, skeleton_bool)

        # =========================================================
        # COMPONENT ANALYSIS (USING DYNAMIC 'min_color')
        # =========================================================
        # ---> Swapped '150' for 'min_color' here <---
        _, binary_bodies = cv2.threshold(image, 150, 255, cv2.THRESH_BINARY)
        binary_bodies = np.uint8(binary_bodies)
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary_bodies, connectivity=8)

        if num_labels > 1:
            largest_body_index = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
            cX, cY = centroids[largest_body_index]

            # Orientation Check
            start_pt = true_spine[0]
            end_pt = true_spine[-1]

            dist_to_start = (start_pt[1] - cX) ** 2 + (start_pt[0] - cY) ** 2
            dist_to_end = (end_pt[1] - cX) ** 2 + (end_pt[0] - cY) ** 2

            if dist_to_end < dist_to_start:
                true_spine = true_spine[::-1]

            # KD-Tree Distance Mapping
            spine_array = np.array(true_spine)
            total_spine_points = len(spine_array)
            spine_tree = KDTree(spine_array)

            exopher_indices = [i for i in range(1, num_labels)]
                            #  if i != largest_body_index


            if exopher_indices:
                raw_centroids = centroids[exopher_indices] # Shape: (M, 2) -> [X, Y]
                centroids_flipped = np.column_stack((raw_centroids[:, 1], raw_centroids[:, 0]))

                distances, closest_spine_indices = spine_tree.query(centroids_flipped)
                percentages = closest_spine_indices / (total_spine_points - 1)

                # --- NEW EXTRACTION BLOCK ---
                # Pull the raw areas for just these exophers
                exopher_areas = stats[exopher_indices, cv2.CC_STAT_AREA] # Shape: (M,)

                # --- NEW EXTRACTION BLOCK ---
                # Pull the raw areas for just these exophers
                exopher_areas = stats[exopher_indices, cv2.CC_STAT_AREA]

                # Calculate True Rotated Aspect Ratio (Handles Diagonals!)
                exopher_aspect_ratios = []

                for label_id in exopher_indices:
                    # Get all (Y, X) pixel coordinates for this specific body
                    pts_yx = np.column_stack(np.where(labels == label_id))

                    if len(pts_yx) >= 5: # Need at least a few points to make a rectangle safely
                        # Convert to (X, Y) and float32 format for cv2.minAreaRect
                        pts_xy = np.float32(pts_yx[:, ::-1])

                        # Get the shrink-wrapped rotated rectangle
                        # Returns: (center(x, y), (width, height), angle of rotation)
                        rect = cv2.minAreaRect(pts_xy)
                        w, h = rect[1]

                        # Prevent division by zero
                        min_dim = max(min(w, h), 1)
                        max_dim = max(w, h)
                        ratio = max_dim / min_dim
                    else:
                        ratio = 1.0 # Too small to measure accurately

                    exopher_aspect_ratios.append(ratio)

                exopher_aspect_ratios = np.array(exopher_aspect_ratios)

                # Stack everything together horizontally:
                # Columns: [Label ID, Area, Centroid_X, Centroid_Y, Distance_To_Spine, Spine_Percentage]
                exopher_data_matrix = np.column_stack((
                    exopher_indices,      # The original label ID
                    exopher_areas,        # Size of the body
                    raw_centroids[:, 0],  # X coordinate
                    raw_centroids[:, 1],  # Y coordinate
                    distances,            # Distance away from the spine in pixels
                    percentages,           # 0.0 to 1.0 location on the worm
                    exopher_aspect_ratios   # 6: Aspect Ratio (Length / Width) <--- NEW
                ))

        strict_filter = (
            (exopher_data_matrix[:, 1] >= 7) & (exopher_data_matrix[:, 1] <= 200) &  # Size: 10 to 200px
            (exopher_data_matrix[:, 5] >= 0.225) & (exopher_data_matrix[:, 5] <= 0.875) # Location: 20% to 85%
        )

        loose_filter = (
            (exopher_data_matrix[:, 1] >= 3) & (exopher_data_matrix[:, 1] <= 200) &  # Size: 10 to 200px
            (exopher_data_matrix[:, 5] >= 0.225) & (exopher_data_matrix[:, 5] <= 0.875) # Location: 20% to 85%
        )

        for index, exopher in enumerate(exopher_data_matrix):

            # Use standard 'and', and use Python's chained comparisons for clean code
            if (exopher[1] >=150) and (0.15 <= exopher[5] <= 0.9):
                skip=True

        # max_spine_percent = np.max(exopher_data_matrix[:, 5])
        # if max_spine_percent <=.875:
        #     skip=True


        valid_exophers = exopher_data_matrix[strict_filter]
        valider_exophers = exopher_data_matrix[loose_filter]


        # budding_extras = np.sum((valid_exophers[:, 6] >= test_location) & (valid_exophers[:, 1]>=test_lize))
        # budding_extras = np.sum((valid_exophers[:, 6]) >= test_location & (valid_exophers[:, 1]) >= test_lize)


        predicted_exophers = len(valid_exophers)-2 #+ budding_extras
        predicteder_exophers = len(valider_exophers)-2

        # if predicted_exophers != predicteder_exophers:
        #     skip = True
        # if len(valid_exophers) < 2:
        #     skip = True
        # if len(valider_exophers) < 2:
        #     skip = True

        predictionA = max(predicted_exophers,0)
        predictionB = max(predicteder_exophers, 0)
        predictionA = min(predictionA, 1)
        predictionB = min(predictionB,1)


    #looser mask

    _, binary_worm = cv2.threshold(image, 10, 255, cv2.THRESH_BINARY)
    binary_worm = np.uint8(binary_worm)
    num_labels_worm, labels_worm, stats_worm, centroids_worm = cv2.connectedComponentsWithStats(binary_worm, connectivity=8)

    if num_labels_worm <= 1:
        raise ValueError("No worm found")

    largest_label = 1 + np.argmax(stats_worm[1:, cv2.CC_STAT_AREA])
    worm_mask_bool = (labels_worm == largest_label)
    skeleton_bool = skeletonize(worm_mask_bool)

    skeleton_pts = [tuple(pt) for pt in np.argwhere(skeleton_bool)]
    pt_set = set(skeleton_pts)

    # (Assuming find_longest_path_from is defined in your notebook from before)
    if skeleton_pts:
        random_start = skeleton_pts[0]
        endpoint_A, _ = find_longest_path_from(random_start, skeleton_bool)
        endpoint_B, true_spine = find_longest_path_from(endpoint_A, skeleton_bool)
        # =========================================================
        # COMPONENT ANALYSIS (USING DYNAMIC 'min_color')
        # =========================================================
        # ---> Swapped '150' for 'min_color' here <---
        _, binary_bodies = cv2.threshold(image, 100, 255, cv2.THRESH_BINARY)
        binary_bodies = np.uint8(binary_bodies)
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary_bodies, connectivity=8)

        if num_labels > 1:
            largest_body_index = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
            cX, cY = centroids[largest_body_index]

            # Orientation Check
            start_pt = true_spine[0]
            end_pt = true_spine[-1]

            dist_to_start = (start_pt[1] - cX) ** 2 + (start_pt[0] - cY) ** 2
            dist_to_end = (end_pt[1] - cX) ** 2 + (end_pt[0] - cY) ** 2

            if dist_to_end < dist_to_start:
                true_spine = true_spine[::-1]

            # KD-Tree Distance Mapping
            spine_array = np.array(true_spine)
            total_spine_points = len(spine_array)
            spine_tree = KDTree(spine_array)

            exopher_indices = [i for i in range(1, num_labels)]
                            #  if i != largest_body_index


            if exopher_indices:
                raw_centroids = centroids[exopher_indices] # Shape: (M, 2) -> [X, Y]
                centroids_flipped = np.column_stack((raw_centroids[:, 1], raw_centroids[:, 0]))

                distances, closest_spine_indices = spine_tree.query(centroids_flipped)
                percentages = closest_spine_indices / (total_spine_points - 1)

                # --- NEW EXTRACTION BLOCK ---
                # Pull the raw areas for just these exophers
                exopher_areas = stats[exopher_indices, cv2.CC_STAT_AREA] # Shape: (M,)

                # --- NEW EXTRACTION BLOCK ---
                # Pull the raw areas for just these exophers
                exopher_areas = stats[exopher_indices, cv2.CC_STAT_AREA]

                # Calculate True Rotated Aspect Ratio (Handles Diagonals!)
                exopher_aspect_ratios = []

                for label_id in exopher_indices:
                    # Get all (Y, X) pixel coordinates for this specific body
                    pts_yx = np.column_stack(np.where(labels == label_id))

                    if len(pts_yx) >= 5: # Need at least a few points to make a rectangle safely
                        # Convert to (X, Y) and float32 format for cv2.minAreaRect
                        pts_xy = np.float32(pts_yx[:, ::-1])

                        # Get the shrink-wrapped rotated rectangle
                        # Returns: (center(x, y), (width, height), angle of rotation)
                        rect = cv2.minAreaRect(pts_xy)
                        w, h = rect[1]

                        # Prevent division by zero
                        min_dim = max(min(w, h), 1)
                        max_dim = max(w, h)
                        ratio = max_dim / min_dim
                    else:
                        ratio = 1.0 # Too small to measure accurately

                    exopher_aspect_ratios.append(ratio)

                exopher_aspect_ratios = np.array(exopher_aspect_ratios)

                # Stack everything together horizontally:
                # Columns: [Label ID, Area, Centroid_X, Centroid_Y, Distance_To_Spine, Spine_Percentage]
                exopher_data_matrix = np.column_stack((
                    exopher_indices,      # The original label ID
                    exopher_areas,        # Size of the body
                    raw_centroids[:, 0],  # X coordinate
                    raw_centroids[:, 1],  # Y coordinate
                    distances,            # Distance away from the spine in pixels
                    percentages,           # 0.0 to 1.0 location on the worm
                    exopher_aspect_ratios   # 6: Aspect Ratio (Length / Width) <--- NEW
                ))

        loosest_filter = (
            (exopher_data_matrix[:, 1] >= 2) & (exopher_data_matrix[:, 1] <= 200) &  # Size: 10 to 200px
            (exopher_data_matrix[:, 5] >= 0.225) & (exopher_data_matrix[:, 5] <= 0.875) # Location: 20% to 85%
        )


        # for index, exopher in enumerate(exopher_data_matrix):

        #     # Use standard 'and', and use Python's chained comparisons for clean code
        #     if (exopher[1] >=150) and (0.15 <= exopher[5] <= 0.9):
        #         skip=True




        valid_exophers = exopher_data_matrix[loosest_filter]


        budding_extras = np.sum((valid_exophers[:, 6] * valid_exophers[:, 1])>=175)
        # budding_extras = np.sum((valid_exophers[:, 6]) >= test_location & (valid_exophers[:, 1]) >= test_lize)


        predicted_exophers = len(valid_exophers)-2 #+ budding_extras

        # if predicted_exophers != predicteder_exophers:
        #     skip = True
        if len(valid_exophers) < 2:
            skip = True
        if len(valider_exophers) < 2:
            skip = True

        predictionC = max(predicted_exophers,0)
        predictionC = min(predictionC, 1)

    print(predictionA, predictionB, predictionC)
    if skip:
        return(-1)
    return(predictionB)    


async def process_image_batch(js_file_array):
    processed_data = []  # Changed name to reflect it holds dictionaries now
    
    for i in range(js_file_array.length):
        js_file = js_file_array[i]
        
        # 1. Read raw image bytes from JavaScript into Python
        array_buf = await js_file.arrayBuffer()
        python_bytes = array_buf.to_bytes()
        
        # 2. Process with Pillow
        image = Image.open(io.BytesIO(python_bytes))
        img_processed = image.convert("L") 
        
        image_np = np.array(image)
        image_cv = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
        
        # GET THE PREDICTION SCORE HERE:
        pred_score = counter(image_cv)

        # 3. Save the processed image into a temporary Python byte stream
        out_stream = io.BytesIO()
        img_processed.save(out_stream, format="PNG")
        
        # 4. Convert the bytes into a Base64 string
        b64_str = base64.b64encode(out_stream.getvalue()).decode("utf-8")
        data_url = f"data:image/png;base64,{b64_str}"
        
        # Append BOTH the image URL and the prediction to the list
        processed_data.append({
            "url": data_url,
            "prediction": pred_score
        })
        
    # Send back a JavaScript Array of Objects
    return to_js(processed_data)

# Attach to global window
window.runPythonImageProcessor = process_image_batch

# Unlock UI when Pillow is ready
document.getElementById("file-input").disabled = False
# document.getElementById("status-text").innerText = "Upload up to 5 Images"
print("Python engine and Pillow are fully loaded and ready!")