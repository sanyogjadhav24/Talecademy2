"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../firebase/firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.js"; // Firestore
import { motion } from "framer-motion"; // Import framer-motion

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // New state for name
  const [bio, setBio] = useState(""); // New state for bio
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false); // New state for handling "forgot password"
  const router = useRouter();

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        // Sign up user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store name and bio in Firestore after sign-up
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          bio: bio,
          email: email,
          likedStories: [] ,
        });

        alert("Account created successfully!");
        router.push("/profile");  // Redirect to dashboard after sign-up
      } else {
        // Sign-in user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Retrieve user data (name and bio) from Firestore on login
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          alert(`Welcome back, ${userData.name}!`);
        }

        router.push("/profile");  // Redirect to dashboard after login
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Please check your inbox.");
      setIsForgotPassword(false); // Hide forgot password form
    } catch (error) {
      alert("Error sending password reset email: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-300 via-blue-300 to-purple-300">
      <motion.div
        className="w-96 p-8 bg-white shadow-lg rounded-xl"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
          {isSignUp ? "Join the Storytellers" : "Welcome Back to Your Story"}
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-4 mb-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <textarea
                placeholder="Tell us about yourself"
                className="w-full p-4 mb-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-4 mb-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          {/* Show password field only in sign-up and login modes */}
          {!isForgotPassword && (
            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 mb-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </motion.div>

        {!isForgotPassword ? (
          <>
            <motion.button
              onClick={handleAuth}
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {isSignUp ? "Create Account" : "Log In"}
            </motion.button>

            <motion.p
              className="text-center text-blue-400 hover:underline cursor-pointer"
              onClick={() => setIsSignUp(!isSignUp)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {isSignUp
                ? "Already have an account? Log In"
                : "Don't have an account? Sign Up"}
            </motion.p>

            <motion.p
              className="text-center text-red-400 hover:underline cursor-pointer mt-2"
              onClick={() => setIsForgotPassword(true)}
            >
              Forgot your password?
            </motion.p>
          </>
        ) : (
          <>
            <motion.input
              type="email"
              placeholder="Enter your email"
              className="w-full p-4 mb-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <motion.button
              onClick={handleForgotPassword}
              className="w-full py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-300 mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              Send Reset Link
            </motion.button>

            <motion.p
              className="text-center text-blue-400 hover:underline cursor-pointer"
              onClick={() => setIsForgotPassword(false)}
            >
              Back to Login
            </motion.p>
          </>
        )}
      </motion.div>
    </div>
  );
}
