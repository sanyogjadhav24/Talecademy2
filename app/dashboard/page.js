"use client";
import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {arrayRemove, arrayUnion, collection, getDoc, query, where, doc, updateDoc,getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";


import Link from "next/link";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Add heart icons from react-icons

export default function Dashboard() {
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState(null);
  const [likedStories, setLikedStories] = useState([]); // Track liked stories
  const [externalLinks, setExternalLinks] = useState([]);
  const [trendingStories, setTrendingStories] = useState([]); // For trending stories
  
  // Fetch the current user's ID
  const fetchUserId = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
    }
  };
  

  // Fetch all stories from Firestore
  const fetchStories = async () => {
    const storiesCollection = collection(db, "stories");
    const storiesSnapshot = await getDocs(storiesCollection);
    const storiesList = storiesSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setStories(storiesList);
  };

  // Fetch "My Stories" from Firestore
  const fetchMyStories = async () => {
    if (!userId) return;
    const storiesCollection = collection(db, "stories");
    const q = query(storiesCollection, where("creatorId", "==", userId));
    const storiesSnapshot = await getDocs(q);
    const myStoriesList = storiesSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setMyStories(myStoriesList);
  };

  const fetchLikedStories = async () => {
    if (!userId) return;
  
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
  
    if (userSnap.exists()) {
      const userData = userSnap.data();
      setLikedStories(userData.likedStories || []);
    }
  };
  
  const handleLikeToggle = async (storyId, currentLikes) => {
    const auth = getAuth();
    const userId = auth.currentUser.uid; // Get the authenticated user's ID
    const storyRef = doc(db, "stories", storyId);
    const userRef = doc(db, "users", userId); // Reference to the user document
  
    // Fetch the story document and user document
    const storySnap = await getDoc(storyRef);
    const userSnap = await getDoc(userRef);
  
    if (!storySnap.exists() || !userSnap.exists()) return;
  
    const storyData = storySnap.data();
    const userData = userSnap.data();
  
    const likedBy = storyData.likedBy || [];
    const userLikedStories = userData.likedStories || [];
  
    if (likedBy.includes(userId)) {
      // Dislike: Remove user from likedBy and decrement likes
      const updatedLikes = currentLikes - 1;
  
      // Remove user from likedBy and user from likedStories
      await updateDoc(storyRef, {
        likes: updatedLikes,
        likedBy: arrayRemove(userId)
      });
      await updateDoc(userRef, {
        likedStories: arrayRemove(storyId)
      });
  
      setLikedStories(prev => prev.filter(id => id !== storyId));
      setStories(prevStories =>
        prevStories.map(story =>
          story.id === storyId ? { ...story, likes: updatedLikes } : story
        )
      );
    } else {
      // Like: Add user to likedBy and increment likes
      const updatedLikes = currentLikes + 1;
  
      // Add user to likedBy and user to likedStories
      await updateDoc(storyRef, {
        likes: updatedLikes,
        likedBy: arrayUnion(userId)
      });
      await updateDoc(userRef, {
        likedStories: arrayUnion(storyId)
      });
  
      setLikedStories(prev => [...prev, storyId]);
      setStories(prevStories =>
        prevStories.map(story =>
          story.id === storyId ? { ...story, likes: updatedLikes } : story
        )
      );
    }
  };
  

  // Fetch external links based on the search term
  const fetchExternalLinks = async () => {
    if (searchTerm === "") {
      setExternalLinks([]); // Clear external links if no search term is provided
      return;
    }
    

    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${searchTerm}&format=json&pretty=1`
      );
      const data = await response.json();
      setExternalLinks(data.RelatedTopics); // Set the external links for display
    } catch (error) {
      console.error("Error fetching external links:", error);
      setExternalLinks([]);
    }
  };

  useEffect(() => {
    fetchUserId(); // Get the current user's ID on page load
  }, []);

  useEffect(() => {
    fetchStories(); // Fetch all stories on page load
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMyStories();
      fetchLikedStories();  // Fetch "My Stories" only when the user is logged in
    }
  }, [userId]);

  // Fetch external links when the search term changes
  useEffect(() => {
    fetchExternalLinks();
  }, [searchTerm]);

  // Sort stories by likes for trending stories
  const sortedStories = [...stories].sort((a, b) => b.likes - a.likes);
  
  // Show only top 5 trending stories
  const topTrendingStories = sortedStories.slice(0, 5);

  const filteredStories = stories.filter((story) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      story.title?.toLowerCase().includes(searchValue) ||
      story.author?.toLowerCase().includes(searchValue) ||
      story.description?.toLowerCase().includes(searchValue) ||
      story.genre?.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      {/* Search Bar Section */}
      <div className="w-full max-w-lg bg-black p-6 rounded-xl shadow-xl flex flex-col items-center mb-8">
  <h1 className="text-4xl font-bold text-white-800 mb-4 text-center">Search Stories</h1>
  <p className="text-gray-1000 text-center mb-6">Find the best stories or start creating your own!</p>
  <input
    type="text"
    placeholder="Search for a story or topic..."
    className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:border-blue-500 text-black"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  
  {/* External Links Section */}
  {externalLinks.length > 0 && (
    <div className="mt-6 w-full">
      <h3 className="text-xl font-semibold text-white mb-4">Related Links</h3>
      <ul className="list-disc pl-6">
        {externalLinks.map((link, index) => (
          <li key={index}>
            <a
              href={link.FirstURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-grey-500 hover:underline"
            >
              {link.Text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )}
</div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-6xl">

        <Link href="/api/">
          <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Create Your Story</h2>
            <p className="text-gray-600 text-center mb-6">Unleash your creativity. Start your journey today!</p>
            <button className="bg-green-600 text-white py-2 px-6 rounded-full text-lg font-semibold hover:bg-green-700 transition-all duration-300">
              Start Creating
            </button>
          </div>
        </Link>

        <Link href="/dashboard/my-stories">
          <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">My Stories</h2>
            <p className="text-gray-600 text-center mb-6">Manage and view all your stories in one place.</p>
            <button className="bg-purple-600 text-white py-2 px-6 rounded-full text-lg font-semibold hover:bg-purple-700 transition-all duration-300">
              View My Stories
            </button>
          </div>
        </Link>
      </div>

      {/* Trending Stories */}
     {/* Trending Stories */}
<div className="w-full max-w-6xl mt-12 bg-white p-8 rounded-xl shadow-xl">
  <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Trending Stories</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {topTrendingStories.length > 0 ? (
      topTrendingStories.map((story) => (
        <div key={story.id} className="flex flex-col items-center bg-gray-100 p-6 rounded-xl shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{story.title}</h3>
          <p className="text-gray-600 text-center mb-2"><strong>Author:</strong> {story.author}</p>
          <p className="text-gray-600 text-center mb-4"><strong>Genre:</strong> {story.genre}</p>
          <p className="text-gray-600 text-center mb-4">{story.description}</p>
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-gray-600">{story.likes || 0} Likes</span>
          </div>
          <Link href={{ pathname: "../dashboard/story/", query: { id: story.id } }}>
            <button className="bg-blue-600 text-white py-2 px-6 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all duration-300">
              Read More
            </button>
          </Link>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-600">No trending stories available at the moment.</p>
    )}
  </div>
</div>


      {/* Dynamic Story Feed Section */}
      <div className="w-full max-w-6xl mt-12 bg-white p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Story Feed</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStories.length > 0 ? (
            filteredStories.map((story) => (
              <div key={story.id} className="flex flex-col items-center bg-gray-100 p-6 rounded-xl shadow-xl relative">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{story.title}</h3>
                <p className="text-gray-600 text-center mb-2"><strong>Author:</strong> {story.author}</p>
                <p className="text-gray-600 text-center mb-4"><strong>Genre:</strong> {story.genre}</p>
                <p className="text-gray-600 text-center mb-4">{story.description}</p>
                <div className="flex items-center justify-between w-full mb-4">
                  <span className="text-gray-600">{story.likes || 0} Likes</span>
                  {/* Heart Icon for Like/Dislike */}
                  <div 
                    onClick={() => handleLikeToggle(story.id, story.likes || 0)} 
                    className="absolute top-4 right-4 cursor-pointer"
                  >
                    {likedStories.includes(story.id ) ? (
                      <FaHeart className="text-red-500 text-2xl" />
                    ) : (
                      <FaRegHeart className="text-gray-600 text-2xl" />
                    )}
                  </div>
                </div>
                <Link href={{ pathname: "../dashboard/story/", query: { id: story.id } }}>
                  <button className="bg-blue-600 text-white py-2 px-6 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all duration-300">
                    Read More
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No stories available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}
