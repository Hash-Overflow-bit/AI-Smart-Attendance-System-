import cv2
import mediapipe as mp
import numpy as np
import base64

class MLService:
    def __init__(self):
        self.mp_face_detection = mp.solutions.face_detection
        self.face_detection = self.mp_face_detection.FaceDetection(
            model_selection=0, min_detection_confidence=0.5
        )
        # In-memory storage for embeddings (would be a DB in production)
        self.student_embeddings = {}

    def is_blurry(self, image, threshold=100):
        """
        Check if an image is blurry using the Laplacian variance method.
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        return variance < threshold

    def enroll_student(self, student_id: str, images_base64: list):
        """
        Process multiple images for a student, generate embeddings, and store them.
        """
        processed_embeddings = []
        errors = []

        for i, b64 in enumerate(images_base64):
            try:
                img_data = base64.b64decode(b64.split(',')[1] if ',' in b64 else b64)
                nparr = np.frombuffer(img_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if img is None:
                    errors.append(f"Image {i+1} could not be decoded")
                    continue

                # 1. Blur Check
                if self.is_blurry(img):
                    errors.append(f"Image {i+1} is too blurry")
                    continue

                # 2. Face Validation: Ensure exactly one face is detected
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                results = self.face_detection.process(rgb_img)
                
                if not results.detections:
                    errors.append(f"Image {i+1}: No face detected")
                    continue
                
                if len(results.detections) > 1:
                    errors.append(f"Image {i+1}: Multiple faces detected. Please ensure only the student is in frame.")
                    continue

                # 3. Preprocess: Resize to standard size (e.g., 160x160 for FaceNet)
                face_img = cv2.resize(img, (160, 160))
                
                # 3. Normalize
                face_img = face_img.astype('float32')
                mean, std = face_img.mean(), face_img.std()
                face_img = (face_img - mean) / std

                # 4. Generate Embedding (Mocking FaceNet/dlib output)
                # In a real scenario: embedding = model.predict(np.expand_dims(face_img, axis=0))
                mock_embedding = np.random.rand(128).tolist() # 128-d vector
                processed_embeddings.append(mock_embedding)

            except Exception as e:
                errors.append(f"Error processing image {i+1}: {str(e)}")

        if len(processed_embeddings) < 10:
            return {
                "status": "error",
                "message": f"Only {len(processed_embeddings)} high-quality images captured. Min 10 required.",
                "errors": errors
            }

        # Store in DB (Mocked as in-memory dict)
        self.student_embeddings[student_id] = np.mean(processed_embeddings, axis=0).tolist()
        
        return {
            "status": "success",
            "message": f"Successfully enrolled {student_id} with {len(processed_embeddings)} samples",
            "student_id": student_id
        }

    def process_frame(self, base64_image: str):
        """
        Process a base64 encoded image frame, detect faces, and return bounding boxes.
        """
        try:
            # Decode base64 image
            img_data = base64.b64decode(base64_image.split(',')[1] if ',' in base64_image else base64_image)
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return []

            # Convert the BGR image to RGB
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Process the image and find faces
            results = self.face_detection.process(rgb_img)
            
            faces = []
            if results.detections:
                h, w, _ = img.shape
                for detection in results.detections:
                    bboxC = detection.location_data.relative_bounding_box
                    # Convert relative coordinates to absolute pixel values (or percentages)
                    # We return percentages for the frontend to render dynamically
                    faces.append({
                        "x": bboxC.xmin * 100,
                        "y": bboxC.ymin * 100,
                        "width": bboxC.width * 100,
                        "height": bboxC.height * 100,
                        "confidence": detection.score[0],
                        # Mocking recognition logic for now: Random chance to be a known student
                        "status": "Present" if np.random.rand() > 0.3 else "Unknown",
                        "studentId": "STU-" + str(np.random.randint(1000, 9999)) if np.random.rand() > 0.3 else None
                    })
            
            return faces
        except Exception as e:
            print(f"Error processing frame: {e}")
            return []

ml_service = MLService()
