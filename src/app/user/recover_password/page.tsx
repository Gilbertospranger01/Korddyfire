"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import supabase from "@/utils/supabase";

export default function Recover_password() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [errorStatus, setErrorStatus] = useState(false);

  const handleSendRecovery = async () => {
    if (!email) {
      setStatus("Please enter your email.");
      setErrorStatus(true);
      return;
    }

    setStatus("Sending...");
    setErrorStatus(false);

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setStatus(`Error: ${error.message}`);
      setErrorStatus(true);
    } else {
      setStatus("Recovery email sent! Check your inbox.");
      setErrorStatus(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-gray-100 overflow-hidden">
      <div className="w-1/2 h-full flex relative">
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "0%", opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute left-0 w-full h-full flex flex-col justify-center items-center bg-gray-950 p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Recover Password</h2>
          {status && (
            <p className={`text-sm ${errorStatus ? "text-red-500" : "text-green-400"}`}>
              {status}
            </p>
          )}
          <form className="w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleSendRecovery}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 w-full rounded focus:outline-none focus:shadow-outline cursor-pointer"
            >
              {email.trim() === "" ? "Send Reset Link" : "Submit"}
            </button>
          </form>
          <Link href="/signin" className="text-blue-500 hover:text-blue-800 text-sm mt-4">
            Back to Signin
          </Link>
        </motion.div>
      </div>

      <div
        className="w-1/2 h-full flex flex-col justify-center items-center bg-gray-900 text-white p-8 bg-cover bg-center"
        style={{ backgroundImage: "url('https://i.pinimg.com/736x/46/9a/f7/469af73674363bdd1c5431f02254ab39.jpg')" }}
      >
        <h1 className="text-4xl font-bold mb-4">Welcome to Korddyfire</h1>
      </div>
    </div>
  );
}
