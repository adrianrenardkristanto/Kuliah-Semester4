import argparse
import re
from typing import List, Optional, Union
import os

import cv2
import numpy as np
import pandas as pd

import torch
from paddleocr import PaddleOCR
from norfair import Detection, Tracker

# Used on recognize_plate_easyocr
OCR_TH = 0.2 

# Text parameters.
FONT_FACE = cv2.FONT_HERSHEY_SIMPLEX
FONT_SCALE = 0.8
THICKNESS = 1

# Colors. (Consider defining these where used or passing as params if they change)
BLACK = (0,0,0)
BLUE = (255,178,50)
YELLOW = (0,255,255)


def get_best_ocr(ocr_res, score, track_id, df):
    # This function's logic for determining "best" OCR can be complex.
    # It seems to prioritize shorter plates if the existing one is also short and confidence is higher,
    # or updates if the new result is longer, or if confidence is higher for same-length results.
    # Ensure this logic aligns with your desired outcome.
    # For simplicity and robustness, often a strategy is:
    # - If new_ocr is longer and high confidence, update.
    # - If new_ocr is same length but higher confidence, update.
    # - Consider a minimum length for a valid plate.

    # Current logic from your code:
    if track_id in df.index:
        current_plate = df.loc[track_id]['Number_Plate']
        current_conf = df.loc[track_id]['conf']

        # Prefer longer plates generally, or higher confidence for same length
        # This simplified logic might be more robust:
        if len(ocr_res) > len(current_plate):
            df.at[track_id, 'Number_Plate'] = ocr_res
            df.at[track_id, 'conf'] = score
            return ocr_res
        elif len(ocr_res) == len(current_plate) and score > current_conf:
            df.at[track_id, 'Number_Plate'] = ocr_res
            df.at[track_id, 'conf'] = score
            return ocr_res
        # Optional: Add a condition to update if the new score is significantly higher
        # even if the length is shorter, but be cautious with this.
        # Example: and len(ocr_res) >= SOME_MIN_VALID_LENGTH and score > current_conf + SOME_CONF_BONUS:
        
        # Fallback to original complex logic if the above simplified one is not preferred.
        # For now, I'll keep a version closer to your original intent but slightly simplified.
        if len(ocr_res) >= 6: # If new OCR is a "long" plate
            if score > current_conf: # And new score is better
                df.at[track_id, 'Number_Plate'] = ocr_res
                df.at[track_id, 'conf'] = score
                return ocr_res
            return current_plate # Otherwise keep current
        else: # If new OCR is a "short" plate
            if len(current_plate) < 6: # And current is also "short"
                if score > current_conf: # And new score is better
                    df.at[track_id, 'Number_Plate'] = ocr_res
                    df.at[track_id, 'conf'] = score
                    return ocr_res
                return current_plate # Otherwise keep current
            else: # Current is "long", new is "short" - prefer current long plate
                return current_plate
    else: # New track ID
        df.loc[track_id] = [ocr_res, score]
        return ocr_res

# detectx function seems unused. If it's for a different purpose or an old function,
# it can be removed or kept if you plan to use it.
# For this ANPR script, the YOLO class __call__ method is used for detection.
# def detectx (frame, model):
#     frame = [frame]
#     print(f"[INFO] Detecting. . . ")
#     results = model(frame)
#     labels, cordinates = results.xyxyn[0][:, -1], results.xyxyn[0][:, :-1]
#     return labels, cordinates

# Removed duplicate clean(img) function. Kept the one with the docstring.
def clean(img):
    """Preprocess image before OCR"""
    # Ensure img is not empty
    if img is None or img.size == 0:
        print("Warning: Empty image passed to clean function.")
        # Return a black image of a default small size or handle as an error
        return np.zeros((10, 10, 1), dtype=np.uint8) if len(img.shape) == 2 else np.zeros((10,10,3), dtype=np.uint8)


    try:
        img_resized = cv2.resize(img, None, fx=1.2, fy=1.2, interpolation=cv2.INTER_CUBIC)
        img_enhanced = cv2.detailEnhance(img_resized, sigma_s=10, sigma_r=0.15)
        
        # Convert to grayscale. If already grayscale, this won't harm.
        if len(img_enhanced.shape) == 3 and img_enhanced.shape[2] == 3: # Check if it's a BGR image
            img_gray = cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2GRAY)
        else: # Already grayscale or single channel
            img_gray = img_enhanced

        kernel = np.ones((1, 1), np.uint8) # This kernel has minimal effect
        img_dilated = cv2.dilate(img_gray, kernel, iterations=1)
        img_eroded = cv2.erode(img_dilated, kernel, iterations=1)
        return img_eroded
    except cv2.error as e:
        print(f"OpenCV error in clean function: {e}")
        # Fallback for error, return original grayscale or a black image
        if len(img.shape) == 3 and img.shape[2] == 3:
             return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        return img # if already grayscale or on error with original
    except Exception as e:
        print(f"Generic error in clean function: {e}")
        if len(img.shape) == 3 and img.shape[2] == 3:
             return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        return img


def draw_label(im, label, x, y):
    """Draw text onto image at location."""
    # Get text size.
    text_size = cv2.getTextSize(label, FONT_FACE, FONT_SCALE, THICKNESS)
    dim, baseline = text_size[0], text_size[1]
    # Use text size to create a BLACK rectangle.
    cv2.rectangle(im, (x,y - dim[1] - baseline), (x + dim[0], y + baseline//2), BLACK, cv2.FILLED) # Adjusted rectangle for better fit
    # Display text inside the rectangle.
    cv2.putText(im, label, (x, y - baseline//2), FONT_FACE, FONT_SCALE, YELLOW, THICKNESS, cv2.LINE_AA) # Changed color to YELLOW for visibility


def filter_text(region, ocr_result, region_threshold):
    # Ensure region is not empty for shape access
    if region is None or region.size == 0:
        print("Warning: Empty region passed to filter_text.")
        return '', 0.0
    rectangle_size = float(region.shape[0] * region.shape[1]) # Ensure float for division
    if rectangle_size == 0: # Avoid division by zero
        print("Warning: Region with zero area in filter_text.")
        return '', 0.0
        
    plate_parts, scores = [], []

    if ocr_result is None or not ocr_result or not ocr_result[0]:
        return '', 0.0

    for detection_result_group in ocr_result: # PaddleOCR v3+ format can have multiple groups for an image
        for line_result in detection_result_group:
            # line_result usually is [ [[box_points_list]], [text_string, confidence_score] ]
            # Check structure carefully based on your PaddleOCR version output
            if isinstance(line_result, list) and len(line_result) == 2:
                box_points = line_result[0] # This is a list of points [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
                text_info = line_result[1]  # This is [text_string, confidence_score]

                if isinstance(text_info, (list, tuple)) and len(text_info) == 2:
                    text_content = text_info[0]
                    confidence = text_info[1]

                    # Calculate area from bounding box points (assuming it's roughly rectangular)
                    # For simplicity, using min/max of box_points to get width/height
                    # A more accurate way is using cv2.contourArea(np.array(box_points, dtype=np.int32))
                    if isinstance(box_points, list) and len(box_points) == 4:
                        all_x = [p[0] for p in box_points]
                        all_y = [p[1] for p in box_points]
                        min_x, max_x = min(all_x), max(all_x)
                        min_y, max_y = min(all_y), max(all_y)
                        char_width = max_x - min_x
                        char_height = max_y - min_y

                        if (char_width * char_height) / rectangle_size > region_threshold:
                            plate_parts.append(str(text_content)) # Ensure text is string
                            scores.append(float(confidence))    # Ensure score is float
                else:
                    print(f"Unexpected text_info structure in OCR result: {text_info}")
            else:
                print(f"Unexpected line_result structure in OCR result: {line_result}")
    
    plate_text = ''.join(plate_parts)
    plate_text = re.sub(r'[^A-Z0-9]', '', plate_text.upper()) # Keep only uppercase alphanumeric

    if not scores:
        return plate_text, 0.0 # Return current plate_text (even if empty) with 0 score
    
    return plate_text, max(scores)


def recognize_plate_easyocr(img, coords, reader, region_threshold, frame_ct=None, track_id=None): # Added params
    """recognize license plate numbers using paddle OCR"""
    debug_image_path = "N/A" # Default value
    try:
        # separate coordinates from box
        # Ensure coords is a NumPy array or easily indexable list of lists/tuples
        if not (isinstance(coords, (list, np.ndarray)) and len(coords) == 2 and 
                isinstance(coords[0], (list, tuple, np.ndarray)) and len(coords[0]) == 2 and
                isinstance(coords[1], (list, tuple, np.ndarray)) and len(coords[1]) == 2):
            print(f"Warning: Unexpected coords format in recognize_plate_easyocr: {coords}")
            return '', 0.0

        xmin, ymin = int(coords[0][0]), int(coords[0][1])
        xmax, ymax = int(coords[1][0]), int(coords[1][1])

        # Ensure coordinates are valid and in order
        if xmin >= xmax or ymin >= ymax or xmin < 0 or ymin < 0: # Add more checks if needed (within img bounds)
            print(f"Warning: Invalid coordinates for cropping: xmin={xmin}, ymin={ymin}, xmax={xmax}, ymax={ymax}")
            return '', 0.0

        nplate = img[ymin:ymax, xmin:xmax]

        if nplate.size == 0:
            print(f"Warning: Cropped nplate is empty for coords {coords}. TrackID: {track_id}, Frame: {frame_ct}")
            return '', 0.0

        # --- START DIAGNOSTIC CODE for Step 2 ---
        debug_nplate_dir = "debug_nplates"
        if not os.path.exists(debug_nplate_dir):
            os.makedirs(debug_nplate_dir, exist_ok=True)

        filename_parts = ["nplate"]
        if frame_ct is not None: filename_parts.append(f"f{frame_ct}")
        if track_id is not None: filename_parts.append(f"id{track_id}")
        filename_parts.append(f"x{xmin}_y{ymin}.jpg")
        debug_image_path = os.path.join(debug_nplate_dir, "_".join(filename_parts))
        
        try:
            cv2.imwrite(debug_image_path, nplate)
        except Exception as e:
            print(f"Error saving debug_nplate to {debug_image_path}: {e}")
        # --- END DIAGNOSTIC CODE for Step 2 ---

        nplate_cleaned = clean(nplate)
        if nplate_cleaned.size == 0:
            print(f"Warning: nplate became empty after cleaning. TrackID: {track_id}, Frame: {frame_ct}")
            return '', 0.0

        ocr_result = reader.ocr(nplate_cleaned, cls=True) # Use cls=True for angle correction by PaddleOCR

        text, score = filter_text(region=nplate_cleaned, ocr_result=ocr_result, region_threshold=region_threshold)
        
        # Removed: if len(text) ==1: text = text[0].upper() -> filter_text now handles this
        if not text and score == 0.0: # Log if OCR failed or text filtered out
            print(f"Debug: No text from OCR for plate at {coords} (saved: {debug_image_path}). OCR_Result: {ocr_result}")

        return text, score # filter_text already converts to upper

    except Exception as e:
        print(f"Error in recognize_plate_easyocr for plate at {coords} (TrackID: {track_id}, Frame: {frame_ct}, Saved: {debug_image_path}): {e}")
        import traceback
        traceback.print_exc()
        return '', 0.0


class YOLO:
    def __init__(self, weights_path, device: Optional[str] = None): # Renamed 'weights' to 'weights_path' for clarity
        if device is not None and "cuda" in device and not torch.cuda.is_available():
            raise Exception(
                "Selected device='cuda', but cuda is not available to Pytorch."
            )
        elif device is None:
            device = "cuda:0" if torch.cuda.is_available() else "cpu"
        
        print(f"[INFO] YOLO: Loading model on device: {device}")
        self.device = device # Store device
        # load model
        # Ensure the './yolov5' directory is in your project root and contains hubconf.py etc.
        try:
            self.model = torch.hub.load(os.path.join(os.getcwd(), 'yolov5'), 'custom', source ='local', path=weights_path, force_reload=False) # force_reload=False is usually preferred after first load
            self.model.to(self.device) # Move model to selected device
            print(f"[INFO] YOLO: Model {weights_path} loaded successfully.")
        except Exception as e:
            print(f"Error loading YOLO model from path: {weights_path} and source './yolov5'")
            print(f"Make sure './yolov5' directory is in your project root and contains hubconf.py, and model path is correct.")
            raise e


    def __call__(
        self,
        img: Union[str, np.ndarray], # img should be RGB for standard YOLOv5 models
        conf_threshold: float = 0.25,
        iou_threshold: float = 0.45,
        image_size: int = 640, # Common YOLOv5 size, adjust if your model trained differently
        classes: Optional[List[int]] = None, # To filter by class ID if needed
    ) -> torch.tensor:

        self.model.conf = conf_threshold
        self.model.iou = iou_threshold
        if classes is not None:
            self.model.classes = classes
        
        # Model inference
        detections = self.model(img, size=image_size)
        return detections


def yolo_detections_to_norfair_detections(yolo_detections: torch.tensor, image_height=None, image_width=None):
    norfair_detections: List[Detection] = []
    
    # yolo_detections.xyxy is a list of tensors, one for each image in the batch.
    # We are processing one image at a time, so take the first one.
    if yolo_detections is None or not hasattr(yolo_detections, 'xyxy') or not yolo_detections.xyxy:
        return norfair_detections
        
    detections_as_xyxy = yolo_detections.xyxy[0].cpu().numpy() # [xmin, ymin, xmax, ymax, conf, class]

    for detection_as_xyxy_np in detections_as_xyxy:
        xmin, ymin, xmax, ymax, conf, cls_id = detection_as_xyxy_np
        
        # Ensure coordinates are within image bounds if dimensions are provided
        if image_width and image_height:
            xmin = np.clip(xmin, 0, image_width)
            ymin = np.clip(ymin, 0, image_height)
            xmax = np.clip(xmax, 0, image_width)
            ymax = np.clip(ymax, 0, image_height)

        bbox = np.array(
            [
                [xmin, ymin],
                [xmax, ymax],
            ]
        )
        # Norfair's Detection class expects 'scores' to be an array-like of confidence scores for each point.
        # For a bounding box, it's common to use the detection confidence for all points or just a single score.
        # Let's pass the single confidence score as an array as Norfair examples often show.
        scores = np.array([conf, conf]) # Or just np.array([conf]) - check Norfair docs for best practice
        
        norfair_detections.append(
            Detection(
                points=bbox, 
                scores=scores, 
                label=int(cls_id), # Use class ID as label
                data={'confidence': float(conf)} # Store original confidence if needed
            )
        )
    return norfair_detections


def running_anpr(in_video, out_video, df, yolo_model, tracker, ocr_reader): # Renamed for clarity
    df.drop(df.index, inplace=True) # Clear DataFrame
    cap = cv2.VideoCapture(in_video)
    if not cap.isOpened():
        print(f"Error: Could not open video file {in_video}")
        return

    codec = cv2.VideoWriter_fourcc(*'XVID') # XVID is common, mp4v also good
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0: # Handle case where FPS might not be read correctly
        print("Warning: Video FPS is 0, defaulting to 25.")
        fps = 25 
    else:
        fps = int(fps)


    out = cv2.VideoWriter(out_video, codec, fps, (width, height))
    ct = 0 # Frame counter

    while(cap.isOpened()):
        ret, img_bgr = cap.read() # Read frame, img_bgr is in BGR format
        if not ret:
            print("[INFO] End of video stream or error reading frame.")
            break

        print(f"[INFO] Frame Count : {ct+1}")

        # Prepare image for YOLO (convert BGR to RGB)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

        # --- START DIAGNOSTIC YOLO CALL (STEP 1) ---
        # Lower confidence for diagnosis to see more potential detections
        yolo_detections_diag = yolo_model(img_rgb, conf_threshold=0.1, image_size=640) 
        
        img_with_raw_detections = img_bgr.copy() # Draw on a BGR copy for display
        
        if hasattr(yolo_detections_diag, 'xyxy') and yolo_detections_diag.xyxy:
            raw_boxes = yolo_detections_diag.xyxy[0].cpu().numpy()
            for box in raw_boxes:
                x1, y1, x2, y2, conf, cls = box
                if conf > 0.05: # Display even very low confidence boxes
                    cv2.rectangle(img_with_raw_detections, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 1) # Red
                    label_text = f"Conf: {conf:.2f}"
                    # Access class names safely
                    if hasattr(yolo_model.model, 'names') and int(cls) < len(yolo_model.model.names):
                        label_text = f"{yolo_model.model.names[int(cls)]} {conf:.2f}"
                    elif hasattr(yolo_model, 'names') and int(cls) < len(yolo_model.names): # Fallback if names are on yolo_model itself
                        label_text = f"{yolo_model.names[int(cls)]} {conf:.2f}"

                    cv2.putText(img_with_raw_detections, label_text, (int(x1), int(y1)-10), FONT_FACE, 0.5, (0,0,255), 1)
        
        cv2.imshow("Raw YOLO Detections (Step 1)", img_with_raw_detections)
        key = cv2.waitKey(1) & 0xFF # Wait for 1ms, get key press
        if key == ord('q'):
            print("Quitting diagnostics and video processing...")
            break 
        # --- END DIAGNOSTIC YOLO CALL & DISPLAY ---

        # --- ACTUAL PROCESSING YOLO CALL ---
        # Use a higher confidence threshold for actual processing
        yolo_detections_process = yolo_model(img_rgb, conf_threshold=0.55, image_size=640) # Operational threshold
        
        # Convert YOLO detections to Norfair format
        # Pass image dimensions for potential clipping within norfair_detections function
        norfair_input_detections = yolo_detections_to_norfair_detections(yolo_detections_process, height, width)
        
        tracked_objects = tracker.update(detections=norfair_input_detections)

        # Process tracked objects for OCR
        for obj in tracked_objects:
            # obj.estimate contains the bounding box [[x1,y1],[x2,y2]]
            if obj.estimate.shape == (2, 2):
                points = obj.estimate.astype(int)
                top_left = tuple(points[0])
                bottom_right = tuple(points[1])
                
                # Draw green box for tracked plates on the original BGR image
                cv2.rectangle(img_bgr, top_left, bottom_right, (0,255,0), 2) 
                
                # Perform OCR (Step 2: saving nplate is inside recognize_plate_easyocr)
                # Pass original BGR img_bgr as recognize_plate_easyocr handles its own cropping from it
                ocr_res_text, ocr_score = recognize_plate_easyocr(img_bgr, points, ocr_reader, 0.2, frame_ct=ct, track_id=obj.id)
                
                # Update and get best OCR result using the DataFrame
                final_text_to_display = get_best_ocr(ocr_res_text, ocr_score, obj.id, df)
                
                # Draw the label
                draw_label(img_bgr, final_text_to_display, top_left[0], top_left[1])
            else:
                print(f"Warning: Tracked object (ID: {obj.id}) points have unexpected shape: {obj.estimate.shape}")

        out.write(img_bgr) # Write the BGR image (with annotations) to output video
        ct += 1
    
    # Release resources
    cap.release()
    out.release()
    cv2.destroyAllWindows() # Close all OpenCV windows
    print('[INFO] Video Stream Ended.')


def main(weights_path, input_video_path, output_video_path, output_csv_path): # Renamed for clarity
    # Initialize PaddleOCR
    # use_angle_cls=True for automatic text angle correction
    # show_log=False to reduce console spam from PaddleOCR, unless debugging PaddleOCR itself
    ocr_reader = PaddleOCR(use_angle_cls=True, lang='en', show_log=False) 
    print("[INFO] PaddleOCR initialized.")

    # Initialize DataFrame for storing results
    # Note: 'track_id' should be the index, but column names in DataFrame constructor are separate
    df = pd.DataFrame(columns = ['Number_Plate', 'conf']) 
    # df.index.name = 'track_id' # This would name the index if it already exists

    # Initialize YOLO model
    yolo_model = YOLO(weights_path) # Device is auto-selected in YOLO class

    # Initialize Norfair Tracker
    # For license plates, IOU distance is generally good.
    distance_function = "iou" # Norfair has 'iou', 'centroid', etc. 'iou_opt' might be from older norfair or custom.
                              # Standard 'iou' should work.
    DISTANCE_THRESHOLD_BBOX = 0.7 # This was a global, using it here
    
    tracker = Tracker(
        distance_function=distance_function,
        distance_threshold=DISTANCE_THRESHOLD_BBOX,
        hit_counter_max=15, # Number of frames to keep a track if it's not matched
        initialization_delay=3, # Number of detections to initialize a track
        pointwise_hit_counter_max=5 # Filter out points that are not detected for a few frames
    )
    print("[INFO] Norfair Tracker initialized.")

    # Run the main ANPR processing loop
    running_anpr(input_video_path, output_video_path, df, yolo_model, tracker, ocr_reader)

    # Post-processing: Filter DataFrame by confidence and save to CSV
    # Ensure 'conf' column exists and is numeric before filtering
    if 'conf' in df.columns:
        df_filtered = df[df['conf'] > OCR_TH] # OCR_TH = 0.2 (global)
        df_filtered.reset_index(inplace=True) # Make track_id a column before saving
        df_filtered.rename(columns={'index': 'track_id'}, inplace=True)
        try:
            df_filtered.to_csv(output_csv_path, index=False)
            print(f"[INFO] Results saved to {output_csv_path}")
        except Exception as e:
            print(f"Error saving CSV to {output_csv_path}: {e}")
    else:
        print("Warning: 'conf' column not found in DataFrame. Skipping CSV saving.")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description = 'Run ANPR system on video feed')
    parser.add_argument('--weight', type=str, required=True, help='Weights of the yolov5 model (e.g., best.pt)')
    parser.add_argument('--input', type=str, required=True, help='Path to the input video')
    parser.add_argument('--output', type=str, default='tracker_output.mp4', help='Path to the output video (default: tracker_output.mp4)')
    parser.add_argument('--csv', type=str, default='number_plates.csv', help='Path to the output CSV file (default: number_plates.csv)')
    args = parser.parse_args()

    # Add error handling for file paths
    if not os.path.exists(args.weight):
        print(f"Error: YOLO weights file not found at {args.weight}")
        exit()
    if not os.path.exists(args.input):
        print(f"Error: Input video file not found at {args.input}")
        exit()
    
    # Ensure the yolov5 directory is present for local loading
    yolov5_dir = os.path.join(os.getcwd(), 'yolov5')
    if not os.path.exists(yolov5_dir) or not os.path.isdir(yolov5_dir):
        print(f"Error: 'yolov5' directory not found in the current working directory ({os.getcwd()}). This is required for loading the local YOLOv5 model.")
        print("Please make sure you have the yolov5 folder (containing hubconf.py, models/, utils/, etc.) in your project root.")
        exit()

    main(args.weight, args.input, args.output, args.csv)