import torch
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import json
import os

current_dir = os.path.dirname(__file__)

# Load pretrained ResNet-18
model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
model.eval()

# Transform pipeline for preprocessing images
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# Load label names
with open(os.path.join(current_dir, "imagenet_classes.json")) as f:
    labels = json.load(f)

def predict_image(image_path: str):
    image = Image.open(image_path).convert("RGB")
    input_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.nn.functional.softmax(outputs[0], dim=0)
        top_prob, top_class = probs.topk(1)

    return {
        "label": labels[top_class.item()],
        "confidence": float(top_prob.item())
    }
