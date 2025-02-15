"use client";

import { Suspense } from "react";
import StoryContent from "./storycontent/page";

const StoryPage = () => {
  return (
    <Suspense fallback={<div className="text-center p-6">Loading...</div>}>
      <StoryContent />
    </Suspense>
  );
};

export default StoryPage;
