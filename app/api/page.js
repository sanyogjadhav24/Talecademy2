"use client";
import React, { useState } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { db, addDoc, collection } from "../firebase/firebase";
import { getAuth } from "firebase/auth";

// Define keyframes for animation
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const rotateBackground = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
`;

// Global styles with gradient animation
const GlobalStyle = createGlobalStyle`
body {
  margin: 0;
  padding: 0;
  font-family: "Arial", sans-serif;
  background: linear-gradient(to right, #86efac, #93c5fd, #d8b4fe);
  background-size: 400% 400%;
  animation: ${rotateBackground} 15s ease infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto; /* Allow vertical scrolling */
  cursor: pointer;
  min-height: 100vh; /* Ensure body takes at least the full viewport height */
}

`;

// Styled components
const Container = styled.div`
  font-family: "Arial, sans-serif";
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 1s ease-out;
  width: 100%;
  height: auto;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    padding: 20px;
    max-width: 90%;
  }
`;

const Title = styled.h1`
  text-align: center;
  color: #2c3e50;
  font-size: 36px;
  margin-bottom: 20px;
  text-transform: uppercase;
  font-weight: 700;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  padding: 14px;
  margin: 10px 0;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  font-size: 16px;
  color: #333;
  background-color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    border: 2px solid #3498db;
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
  }
`;

const Textarea = styled.textarea`
  padding: 14px;
  margin: 10px 0;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  height: 120px;
  font-size: 16px;
  color: #333;
  background-color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    border: 2px solid #3498db;
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease, transform 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #2980b9;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(2px);
  }
`;

const RedButton = styled(Button)`
  background: red;

  &:hover {
    background: #e74c3c;
  }
`;

const StoryContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
`;

const StoryTitle = styled.h2`
  color: #2980b9;
  font-size: 24px;
`;

const Story = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: #333;
`;

const Error = styled.p`
  color: red;
  font-weight: bold;
`;

const Loading = styled.p`
  color: #333;
  font-weight: bold;
  margin-top: 20px;
`;

const Choices = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChoiceButton = styled.button`
  padding: 12px 24px;
  background: #2ecc71;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease, transform 0.3s ease;

  &:hover {
    background: #27ae60;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(2px);
  }
`;

const QuestionButton = styled(ChoiceButton)`
  background: #f39c12;

  &:hover {
    background: #e67e22;
  }
`;

const App = () => {
  const [currentStory, setCurrentStory] = useState("Once upon a time...");
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState(""); // Duration in minutes
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [questions, setQuestions] = useState([]);

  const handlePublishStory = async () => {
    if (!currentStory || !genre || !duration || !description || !author) {
      setError("Please complete all fields before publishing.");
      return;
    }

    setLoading(true);
    setError("");
    const auth = getAuth();
    const creatorId = auth.currentUser?.uid;

    try {
      await addDoc(collection(db, "stories"), {
        genre,
        duration,
        description,
        story: currentStory,
        author,
        creatorId,
        createdAt: new Date(),
        likes: 0,
        likedBy: [],
      });

      setCurrentStory("");
      setChoices([]);
      setGenre("");
      setDuration("");
      setDescription("");
      setAuthor("");
      alert("Story published successfully!");
    } catch (e) {
      setError("Failed to publish the story.");
    } finally {
      setLoading(false);
    }
  };

  const handleStoryStart = async () => {
    if (!genre || !duration || !description || !author) {
      setError("Please fill in all fields before starting the story.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/generateStory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre,
          duration,
          description,
          author,
          currentStory: "Once upon a time...",
          choice: "Start the story",
        }),
      });

      const data = await response.json();
      setCurrentStory(data.story);
      setChoices(data.choices);
    } catch (error) {
      setError("Error generating the story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = async (choice) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/generateStory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre,
          duration,
          description,
          author,
          currentStory,
          choice,
        }),
      });

      const data = await response.json();
      setCurrentStory((prevStory) => prevStory + " " + data.story);
      setChoices(data.choices);
      // Set questions when story ends
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (error) {
      setError("Error generating the next part of the story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearStory = () => {
    setCurrentStory("Once upon a time...");
    setChoices([]);
    setGenre("");
    setDuration("");
    setDescription("");
    setAuthor("");
    setQuestions([]);
  };

  return (
    <>
      <GlobalStyle/>
      <Container>
        <Title>StoryHub</Title>
        <InputContainer>
          <Input
            type="text"
            placeholder="Enter author name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Enter story genre (e.g., Adventure, Fantasy, Thriller, etc.) "
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Enter duration (in minutes)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <Textarea
            placeholder="Enter a short description of the story"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </InputContainer>

        <Button onClick={handleStoryStart} disabled={loading}>
          Start Story
        </Button>

        {loading && <Loading>Generating story...</Loading>}
        {error && <Error>{error}</Error>}

        {currentStory && (
          <StoryContainer>
            <StoryTitle>Story:</StoryTitle>
            <Story>{currentStory}</Story>
          </StoryContainer>
        )}

        {choices.length > 0 && (
          <Choices>
            {choices.map((choice, index) => (
              <ChoiceButton key={index} onClick={() => handleChoice(choice)}>
                {choice}
              </ChoiceButton>
            ))}
          </Choices>
        )}

        {questions.length > 0 && (
          <Choices>
            {questions.map((question, index) => (
              <QuestionButton key={index} onClick={() => alert(`Answered: ${question}`)}>
                {question}
              </QuestionButton>
            ))}
          </Choices>
        )}

        <RedButton onClick={handleClearStory}>Clear Story</RedButton>
        <Button onClick={handlePublishStory} disabled={loading}>
          Publish Story
        </Button>
      </Container>
    </>
  );
};

export default App;
