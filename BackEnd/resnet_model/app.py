from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from BackEnd.resnet_model.model import predict_image
import tempfile
import shutil

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # add your prod domain later
    allow_credentials=False,                   # True only if you use cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    # Save uploaded image temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    result = predict_image(tmp_path)
    return {"prediction": result}
