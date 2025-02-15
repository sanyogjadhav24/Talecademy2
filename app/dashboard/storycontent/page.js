"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const StoryContent = ({ storyId }) => {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storyId) {
      const fetchStory = async () => {
        try {
          const docRef = doc(db, "stories", storyId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setStory(docSnap.data());
          } else {
            console.log("No such document with ID:", storyId);
          }
        } catch (error) {
          console.error("Error fetching story:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchStory();
    } else {
      setLoading(false);
    }
  }, [storyId]);

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (!story) {
    return <div className="text-center p-6 text-red-500">Story not found!</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
        {story.title}
      </h1>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-lg font-medium">
          <span className="text-gray-600">Author:</span>
          <span className="text-gray-800">{story.author}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-lg font-medium">
          <span className="text-gray-600">Genre:</span>
          <span className="text-gray-800">{story.genre}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-lg font-medium">
          <span className="text-gray-600">Description:</span>
          <span className="text-gray-800">{story.description}</span>
        </div>
      </div>

      <div className="mt-6 text-lg text-gray-700">
        <h2 className="text-xl font-semibold text-indigo-500 mb-3">Story:</h2>
        <p>{story.story}</p>
      </div>
    </div>
  );
};

export default StoryContent;
