# Face-API.js Models

This directory should contain the face-api.js model files for face detection and recognition.

## Quick Setup (CDN - Recommended for Development)

The application will automatically fallback to CDN if local models are not found. No action needed!

## Manual Setup (Local Models)

If you want to use local models for better performance or offline support:

### Option 1: Download from GitHub

1. Clone or download the models repository:
   ```bash
   git clone https://github.com/justadudewhohacks/face-api.js-models.git
   ```

2. Copy the model files to this directory:
   ```bash
   # On Windows (PowerShell)
   Copy-Item -Path "face-api.js-models\weights\*" -Destination "client\public\models\" -Recurse
   
   # On Linux/Mac
   cp -r face-api.js-models/weights/* client/public/models/
   ```

### Option 2: Download Individual Files

Download these files from https://github.com/justadudewhohacks/face-api.js-models/tree/master/weights:

Required files:
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`
- `face_expression_model-weights_manifest.json`
- `face_expression_model-shard1`

Place all files directly in this `models/` directory.

## Verification

After placing the models, restart your dev server. The application will:
1. First try to load from `/models` (local)
2. If not found, automatically fallback to CDN
3. Show a console message indicating which source was used

## Note

- Local models provide better performance and work offline
- CDN models require internet connection but are easier to set up
- The application works with either option
