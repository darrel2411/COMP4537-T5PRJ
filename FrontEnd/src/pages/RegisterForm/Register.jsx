import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import en from "./en";

function Register() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/createUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          name: name.trim(),
          password: password.trim(),
        }),
        credentials: "include", // for session cookies
      });

      const data = await res.json();

      if (data.ok) {
        console.log(data);
        setSuccess("User created successfully");
        navigate("/login");
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError(en.error.network);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          src="/logo.png"
          alt="Your Company"
          className="mx-auto h-28 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
          {en.labels.signUpHeader}
        </h2>
      </div>
      {/* ✅ success alert */}
      {success && (
        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
          <Alert>
            <CheckCircle2Icon className="h-4 w-4 text-green-500" />
            <AlertTitle>{en.success.success}</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username sections */}
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium">
              {en.labels.email}
            </label>
            <div className="mt-2">
              <input
                id="email"
                disabled={loading}
                type="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                required
                value={email}
                className="block w-full rounded-md px-3 py-1.5 text-base outline-1"
              />
            </div>
          </div>

          {/* name sections */}
          <div>
            <label htmlFor="name" className="block text-sm/6 font-medium">
              {en.labels.name}
            </label>
            <div className="mt-2">
              <input
                id="name"
                disabled={loading}
                type="text"
                name="email"
                onChange={(e) => setName(e.target.value)}
                placeholder="name"
                required
                value={name}
                className="block w-full rounded-md px-3 py-1.5 text-base outline-1"
              />
            </div>
          </div>
          <div>
            {/* Password sections */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium "
              >
                {en.labels.password}
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                disabled={loading}
                type="password"
                name="password"
                placeholder="password"
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="block w-full rounded-md px-3 py-1.5 text-base outline-1"
                value={password}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 font-semibold text-white hover:bg-indigo-400"
            >
              {en.labels.buttons.signUp}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-400">
          {en.labels.AlternativeOption}
          <a
            href="/login"
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            {" "}
            {en.labels.alternativeAction}
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
