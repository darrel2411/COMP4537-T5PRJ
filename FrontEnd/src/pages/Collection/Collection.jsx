import React from "react";
import Navbar from "@/components/Navbar/Navbar";

export default function Collection() {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">My Collection</h1>
        <p>Your bird collection will appear here.</p>
      </div>
    </div>
  );
}

