from fastapi import FastAPI, File, UploadFile
from BackEnd.resnet_model.model import predict_image
import tempfile
import shutil

app = FastAPI()

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    # Save uploaded image temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    result = predict_image(tmp_path)
    return {"prediction": result}
