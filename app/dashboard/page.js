"use client";

import { Suspense } from "react";
import StoryContent from "./storycontent/page";
import { useSearchParams } from "next/navigation";

const StoryPage = () => {
  const searchParams = useSearchParams();
  const storyId = searchParams?.get("id"); // Get the story ID before passing it as a prop

  return (
    <Suspense fallback={<div className="text-center p-6">Loading...</div>}>
      <StoryContent storyId={storyId} />
    </Suspense>
  );
};

export default StoryPage;
