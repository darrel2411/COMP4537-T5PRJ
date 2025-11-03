import { useState } from "react";
// import { useUser } from "../context/UserContext";
import en from "./en";

function Landing() {
  //   const { user, setUser } = useUser();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const MODEL_API_BASE = import.meta.env.VITE_MODEL_API_BASE;

  const onPick = (e) => {
    const f = e.target.files?.[0];
    console.log(e.target.files);
    setFile(f || null);
    setResult(null);
    setError("");
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return setError("Please choose an image first.");
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file); // <-- key must be "file" to match your Postman request

      const res = await fetch(`${MODEL_API_BASE}/predict`, {
        method: "POST",
        body: fd,
        // credentials: "include", // only if your server needs cookies
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={onPick}
          className="
            block text-sm text-gray-600
            file:mr-3 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:font-semibold
            file:bg-gray-900 file:text-white
            hover:file:bg-gray-700
        "
        />
        {preview && (
          <img src={preview} alt="preview" className="w-full rounded" />
        )}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {loading ? en.MESSAGE.UPLOADING : en.MESSAGE.PREDICT}
        </button>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {result && (
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default Landing;
