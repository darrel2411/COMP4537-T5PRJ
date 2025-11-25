import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }

    // if (password.length < 6) {
    //   setError("Password must be at least 6 charachters");
    // }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (data.ok) {
        setMessage("Password has been updated.");
        setPassword("");
        setPassword2("");
        setTimeout(() => {
          navigate("/login");
        }, 3000); // after 3 seconds
      } else {
        setError(data.msg || "Reset link expired");
      }
    } catch (error) {
      console.error("Reset password error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-red-600 font-medium">
            Invalid reset link. No token provided.
          </p>
          <button
            className="mt-3 text-sm text-blue-600 hover:underline"
            onClick={() => navigate("/login")}
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-800 text-center">
          Reset Password
        </h1>
        <p className="text-sm text-slate-500 text-center">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              New password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <Input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-md p-2">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-green-600 bg-green-50 rounded-md p-2">
              {message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !password || !password2}
          >
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
