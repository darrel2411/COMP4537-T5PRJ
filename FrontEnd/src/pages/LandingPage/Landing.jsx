import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { Button } from "@/components/ui/button";
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

  const API_BASE = import.meta.env.VITE_API_BASE;

  const onPick = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setResult(null);
    setError("");
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return setError("Please choose an image first.");
    setUploadLoading(true);
    setError("");
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("image", file); // <-- key must be "image" to match the model API

      const res = await fetch(`${API_BASE}/api/analyze-bird`, {
        method: "POST",
        body: fd,
        credentials: "include", // include cookies for session
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

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } finally {
      setUser(null); // clear context
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/delete-user/${user.email}`, {
        method: "DELETE",
        credentials: "include", // send session cookie so backend knows who to delete
      });

      const data = await res.json().catch(() => ({}));
      console.log("Delete response:", { status: res.status, data });

      if (!res.ok || !data.ok) {
        throw new Error(data.msg || "Failed to delete user");
      }

      setUser(null); // clear user from context
      alert("Account deleted successfully.");

      // Redirect to login page after successful deletion
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md mx-auto p-4 space-y-4">
        {user && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Hello, <span className="font-medium">{user.name}</span>
            </p>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm"
            >
              Logout
            </button>
          </div>
        )}
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
          disabled={!file || uploadLoading || loading}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {uploadLoading ? en.MESSAGE.UPLOADING : en.MESSAGE.PREDICT}
        </button>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {result && (
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}

        {user && (
          <div className="pt-4 border-t">
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
