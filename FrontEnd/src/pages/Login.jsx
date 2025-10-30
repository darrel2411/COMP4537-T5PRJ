import { useState } from "react";

function Login() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    const API_BASE = import.meta.env.VITE_API_BASE;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/authenticateUser`, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password
                }),
                credentials: 'include' // for session cookies
            });

            const data = await res.json();

            if (data.ok){
                console.log(data.msg);
                window.location.href = '/';
            } else {
                setError(data.msg);
            }

        } catch (err) {
            setError(err); // Change to user friendly msg
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company" className="mx-auto h-10 w-auto" />
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">Sign in to your account</h2>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Username sections */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm/6 font-medium"
                        >
                            Email
                        </label>
                        <div className="mt-2">
                            <input 
                                className="block w-full rounded-md px-3 py-1.5 text-base outline-1"
                                id="email"
                                disabled={loading}
                                type="email"
                                name="email"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                value={email}
                            />
                        </div>
                    </div>

                    <div>
                        {/* Password sections */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium ">Password</label>
                            <div className="text-sm">
                                <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">Forgot password?</a>
                            </div>
                        </div>
                        <div className="mt-2">
                            <input 
                                autoComplete="current-password"
                                className="block w-full rounded-md px-3 py-1.5 text-base outline-1"
                                id="password"
                                disabled={loading}
                                name="password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                type="password"
                                value={password}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 font-semibold text-white hover:bg-indigo-400"
                        >
                            Sign in
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm/6 text-gray-400">
                    Not a member?
                    <a href="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300"> Sign up</a>
                </p>
            </div>
        </div>
    )
}

export default Login;