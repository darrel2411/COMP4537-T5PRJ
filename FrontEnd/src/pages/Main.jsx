import { useState } from "react";

function Main() {
  const [msg, setMsg] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE;

  const fetchQuote = async () => {
    const res = await fetch(`${API_BASE}`);
    const data = await res.json();
    setMsg(data.msg);
  }

  console.log(msg);

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">

        <h1 className="text-3xl font-bold mb-6 text-gray-800">Hello, Click button to get message from server</h1>
        
        <button onClick={fetchQuote}>Get Message</button>

        <h1 className="underline">
          {msg}
        </h1>

      </div>
    </>
  )
}

export default Main;