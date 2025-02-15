"use client"; // Ensure this is a Client Component

import { Suspense } from "react";
import StoryContent from "./storycontent/page"; // Move the logic to a separate component

const StoryPage = () => {
  return (
    <Suspense fallback={<div className="text-center p-6">Loading...</div>}>
      <StoryContent />
    </Suspense>
  );
};

export default StoryPage;
