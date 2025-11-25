import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.ok) {
        setMessage(
          "If this email exists in our system, a reset link has been sent."
        );
        // Optional: go back to login after a few seconds
        setTimeout(() => navigate("/login"), 4000);
      } else {
        setError(data.msg || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-800 text-center">
          Forgot Password
        </h1>
        <p className="text-sm text-slate-500 text-center">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <Button type="submit" className="w-full" disabled={loading || !email}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <button
          type="button"
          className="w-full text-sm text-slate-500 hover:text-slate-700 mt-2"
          onClick={() => navigate("/login")}
        >
          Back to login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
