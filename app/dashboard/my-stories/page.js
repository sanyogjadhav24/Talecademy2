"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function MyStories() {
  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);

  // Fetch "My Stories" from Firestore
  const fetchMyStories = async () => {
    setLoading(true); // Start loading before fetching
    setError(null); // Reset any previous errors
    try {
      const storiesCollection = collection(db, "stories");
      const q = query(storiesCollection, where("creatorId", "==", userId));
      const storiesSnapshot = await getDocs(q);
      const myStoriesList = storiesSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setMyStories(myStoriesList);
    } catch (err) {
      console.error("Error fetching stories:", err);
      setError("Failed to fetch your stories. Please try again later.");
    } finally {
      setLoading(false); // End loading
    }
  };

  // Delete Story from Firestore
  const deleteStory = async () => {
    if (storyToDelete) {
      try {
        const storyRef = doc(db, "stories", storyToDelete);
        await deleteDoc(storyRef);
        setMyStories(myStories.filter((story) => story.id !== storyToDelete));
        setShowModal(false);
      } catch (err) {
        console.error("Error deleting story:", err);
        setError("Failed to delete the story. Please try again.");
      }
    }
  };

  // Monitor authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setLoading(false); // Stop loading if no user is logged in
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  // Fetch stories when userId is set
  useEffect(() => {
    if (userId) {
      fetchMyStories();
    }
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <span className="loader"></span> {/* Replace with a spinner or loading message */}
        </div>
      ) : error ? (
        <div className="w-full max-w-6xl bg-red-100 p-4 rounded-xl shadow-xl mb-8">
          <p className="text-red-800 text-center">{error}</p>
        </div>
      ) : (
        <>
          <div className="w-full max-w-6xl bg-white p-8 rounded-xl shadow-xl mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">My Stories</h1>
            <p className="text-gray-600 text-center mb-6">View and manage the stories you’ve created.</p>
          </div>

          <div className="w-full max-w-6xl bg-white p-8 rounded-xl shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {myStories.length > 0 ? (
                myStories.map((story) => (
                  <div
                    key={story.id}
                    className="flex flex-col items-center bg-gray-100 p-6 rounded-xl shadow-xl relative"
                  >
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                      {story.title}
                    </h3>
                    <p className="text-gray-600 text-center mb-2">
                      <strong>Author:</strong> {story.author}
                    </p>
                    <p className="text-gray-600 text-center mb-4">
                      <strong>Genre:</strong> {story.genre}
                    </p>
                    <p className="text-gray-600 text-center mb-4">
                      {story.description}
                    </p>
                    <Link
                      href={{
                        pathname: "/dashboard/story/",
                        query: { id: story.id },
                      }}
                    >
                      <button className="bg-blue-600 text-white py-2 px-6 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all duration-300">
                        Read More
                      </button>
                    </Link>
                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        setStoryToDelete(story.id);
                        setShowModal(true);
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white py-1 px-3 rounded-full hover:bg-red-700 transition-all duration-300"
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600">
                  You have not created any stories yet.{" "}
                  <Link href="/api" className="text-blue-600 underline">
                    Start creating now!
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Modal for Confirmation */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">Are you sure?</h3>
                <p className="text-center text-gray-600 mb-6">
                  Are you sure you want to delete this story? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={deleteStory}
                    className="bg-red-600 text-white py-2 px-6 rounded-full hover:bg-red-700 transition-all duration-300"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 text-gray-800 py-2 px-6 rounded-full hover:bg-gray-400 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
