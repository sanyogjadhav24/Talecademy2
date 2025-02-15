'use client'; // Add this directive at the top to ensure this is treated as a Client Component.

import { useSearchParams } from 'next/navigation';

import { useEffect, useState,Suspense } from 'react';
import { db } from '../../firebase/firebase'; // Adjust the path as needed
import { doc, getDoc } from 'firebase/firestore';

const StoryPage = () => {
  const searchParams = useSearchParams(); // Get the search params, if any
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = searchParams?.get('id'); // Retrieve the story ID from the search params
    console.log('Story ID:', id); // Log the ID to verify it's correct

    if (id) {
      const fetchStory = async () => {
        try {
          const docRef = doc(db, 'stories', id); // Fetch the story from Firestore using the id
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            console.log('Story data:', docSnap.data()); // Log the data to verify it's fetched correctly
            setStory(docSnap.data());
          } else {
            console.log('No such document with ID:', id); // Log if document doesn't exist
          }
        } catch (error) {
          console.error('Error fetching story:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchStory(); // Fetch the story if id is available
    } else {
      console.log('No id in the searchParams');
      setLoading(false); // Stop loading if no id
    }
  }, [searchParams]); // Trigger effect when searchParams changes

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (!story) {
    return <div className="text-center p-6 text-red-500">Story not found!</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">{story.title}</h1>

      {/* Displaying Story Details */}
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

      {/* Story Content */}
      <div className="mt-6 text-lg text-gray-700">
        <h2 className="text-xl font-semibold text-indigo-500 mb-3">Story:</h2>
        <p>{story.story}</p>
      </div>
    </div>
    </Suspense>
  );
};

export default StoryPage;
