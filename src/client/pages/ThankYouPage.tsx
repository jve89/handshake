import React from "react";
import { Link } from "react-router-dom";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-700">Thank you!</h1>
        <p className="text-gray-700 mb-6">
          Your responses have been submitted successfully.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
