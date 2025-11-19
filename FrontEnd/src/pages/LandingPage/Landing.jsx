import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar/Navbar";
import en from "./en";

function Landing() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [randomBirdImage, setRandomBirdImage] = useState("");
  
  const fileInputRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_BASE;

  // Fetch a random bird image when component mounts
  useEffect(() => {
    fetchRandomBirdImage();
  }, []);

  const fetchRandomBirdImage = () => {
    // Using a random bird image from Unsplash Source API (no auth required)
    // This generates a random bird image each time
    const birdImages = [
      "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583160247711-2191776b4b91?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583336663277-620dc1996580?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1549608276-5786777e6587?w=800&h=600&fit=crop",
    ];
    
    // Pick a random bird image
    const randomIndex = Math.floor(Math.random() * birdImages.length);
    setRandomBirdImage(birdImages[randomIndex]);
  };

  const onPick = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setResult(null);
    setError("");
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleTakePhoto = () => {
    // Trigger file input which will allow user to choose camera or file
    // On mobile devices, this will show options for camera or file picker
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!file) return setError("Please choose an image first.");
    setUploadLoading(true);
    setError("");
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${API_BASE}/api/analyze-bird`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Server ${res.status}: ${text || "upload failed"}`);
      }
      const data = await res.json().catch(() => ({}));
      setResult(data);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/delete-user/${user.email}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      console.log("Delete response:", { status: res.status, data });

      if (!res.ok || !data.ok) {
        throw new Error(data.msg || "Failed to delete user");
      }

      setUser(null);
      alert("Account deleted successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        {/* Random Bird Image in the center */}
        <div className="mb-8">
          {randomBirdImage ? (
            <img
              src={randomBirdImage}
              alt="Random bird"
              className="max-w-md w-full h-auto rounded-lg shadow-lg object-cover"
              style={{ maxHeight: "500px" }}
            />
          ) : (
            <div className="max-w-md w-full h-96 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center">
              <p className="text-gray-500">Loading bird image...</p>
            </div>
          )}
        </div>

        {/* Take a Photo Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={handleTakePhoto}
            className="px-8 py-3 text-lg font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            Take a photo
          </Button>

          {/* Hidden file input - supports both camera and file upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPick}
            className="hidden"
          />

          {/* Preview of selected image */}
          {preview && (
            <div className="mt-4 w-full max-w-md">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg shadow-md"
              />
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploadLoading || loading}
                  className="flex-1"
                >
                  {uploadLoading ? en.MESSAGE.UPLOADING : en.MESSAGE.PREDICT}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreview("");
                    setFile(null);
                    setResult(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
          
          {result && (
            <div className="mt-4 w-full max-w-md bg-white p-4 rounded-lg shadow-md">
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Delete Account Button - moved to bottom */}
        {user && (
          <div className="mt-8 pt-8 border-t border-gray-200 w-full max-w-md">
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Landing;
