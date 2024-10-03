import React, { useState, useEffect } from "react";
import httpClient from "../../httpClient";
import { useNavigate } from "react-router-dom";

function StoryStatistics(props) {
  const navigate = useNavigate();

  const [storyTitle, setStoryTitle] = useState("");
  const [errorsMade, setErrorsMade] = useState(0);
  const [pronounciationScore, setPronounciationScore] = useState(0);
  const [wordsPerMinute, setWordsPerMinute] = useState(0);
  const [dateTime, setDateTime] = useState("");

  const [storyDifficulty, setStoryDifficulty] = useState("");

  const [recommendedStory, setRecommendedStory] = useState({
    id: null,
    title: "",
    content: "",
    difficulty: "",
  });

  /**
   * useEffect to fetch statistics data for just read story
   */
  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get("/statistic/get_story_statistic", {
          params: {
            statistic_id: props.statistic_id,
          },
        });
        const statistic_data = resp.data;
        console.log(statistic_data);
        setStoryTitle(statistic_data.storyTitle);
        setErrorsMade(statistic_data.wordErrorRate);
        setPronounciationScore(statistic_data.pronounciationScore);
        setWordsPerMinute(statistic_data.wordsPerMinute);
        setDateTime(statistic_data.date);
        setStoryDifficulty(statistic_data.storyDifficulty);

        //Updating unread story to read for user
        updateUserReadStories(statistic_data.storyID);
        recommendStory(
          statistic_data.storyDifficulty,
          statistic_data.pronounciationScore
        );
      } catch (error) {
        console.log("Error retrieving statistic information");
        alert("Error retrieving statistic information");
      }
    })();
  }, []);

  /**
   * Updates the user's list of read stories by sending the story ID to the backend.
   * @param {string} storyID - The ID of the story to mark as read.
   */
  const updateUserReadStories = async (storyID) => {
    try {
      const formData = new FormData();
      formData.append("storyID", storyID);
      const resp = await httpClient.post("/learner/add_read_story", formData);
      console.log("This is add read story response: ", resp);
    } catch (error) {
      console.log("Could not update user read stories");
    }
  };

  /**
   * Recommends a new story based on the current story's difficulty level and the user's pronunciation score.
   * @param {string} difficultyLevel - The difficulty level of the story just completed.
   * @param {number} pronounciationScore - The user's pronunciation score for the completed story.
   */
  const recommendStory = async (difficultyLevel, pronounciationScore) => {
    try {
      const resp = await httpClient.post("/learner/recommend_story", {
        difficultyLevel,
        pronounciationScore,
      });
      console.log("This is the recommendStory response: ", resp);
      setRecommendedStory(resp.data.recommended_story);
      console.log(recommendedStory);
    } catch (error) {
      console.error("Error recommending story:", error);
    }
  };

  /**
   * Navigates to the reading board to begin reading the selected story.
   * @param {string} story_content - The content of the story.
   * @param {string} story_id - The ID of the story.
   */
  function beginReading(story_content, story_id) {
    const data = { story_content, story_id };
    console.log("This is the props data to be sent to board", data);
    navigate("/board", { state: data });
  }

  const handleNavigationToLibrary = (difficulty) => {
    const data = { difficulty };
    console.log(data);
    navigate("/library", { state: data });
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#e0e0e0",
          padding: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "5px solid #d0d0d0",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
            height: "80%",
            width: "80%",
            maxWidth: "1000px",
            borderRadius: "8px",
            padding: "20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative", // Position relative to allow absolute positioning of emojis
          }}
        >
          {/* Top Left Corner */}
          <div style={{ position: "absolute", top: "10px", left: "10px" }}>
            <span style={{ fontSize: "2rem" }}>😊</span>
          </div>

          {/* Top Right Corner */}
          <div style={{ position: "absolute", top: "10px", right: "10px" }}>
            <span style={{ fontSize: "2rem" }}>👍</span>
          </div>

          {/* Bottom Left Corner */}
          <div style={{ position: "absolute", bottom: "10px", left: "10px" }}>
            <span style={{ fontSize: "2rem" }}>🌟</span>
          </div>

          {/* Bottom Right Corner */}
          <div style={{ position: "absolute", bottom: "10px", right: "10px" }}>
            <span style={{ fontSize: "2rem" }}>🎉</span>
          </div>

          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#333" }}>
              Story Statistics
            </h1>
          </div>
          <div style={{ marginTop: "0px", fontSize: "1rem", color: "#666" }}>
            <p>
              Story Name: <span style={{ color: "#000" }}>{storyTitle}</span>
            </p>
            <p>
              Number of Words Mispronounced:{" "}
              <span style={{ color: "#000" }}>{errorsMade}</span>
            </p>
            <p>
              Pronunciation score:{" "}
              <span style={{ color: "#000" }}>{pronounciationScore}%</span>
            </p>
            <p>
              Words per minute:{" "}
              <span style={{ color: "#000" }}>{wordsPerMinute} WPM</span>
            </p>
            <p>
              Date and time: <span style={{ color: "#000" }}>{dateTime}</span>
            </p>
          </div>

          {/* Recommended Story */}
          {recommendedStory.id && (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                border: "2px solid #d0d0d0",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                padding: "1px",
                width: "100%",
                maxWidth: "350px",
                marginTop: "20px",
                textAlign: "center",
                margin: "0 auto",
                position: "relative",
              }}
            >
              <h2
                style={{
                  fontSize: "1.125rem",
                  color: "#343a40",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                Recommended Story
              </h2>
              <h3
                style={{
                  fontSize: "1rem",
                  color: "#6c757d",
                  marginBottom: "10px",
                }}
              >
                Story Title:{" "}
                <span style={{ color: "#000" }}>{recommendedStory.title}</span>
              </h3>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#6c757d",
                  marginBottom: "10px",
                }}
              >
                Difficulty:{" "}
                <span style={{ color: "#000" }}>
                  {recommendedStory.difficulty}
                </span>
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#6c757d",
                  marginBottom: "20px",
                }}
              >
                Preview:{" "}
                <span style={{ color: "#000" }}>
                  {recommendedStory.content.split(".")[0]}.
                </span>
              </p>

              <button
                style={{
                  backgroundColor: "#007bff",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "50px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  width: "90%",
                  marginBottom: "16px",
                }}
                onClick={() =>
                  beginReading(recommendedStory.content, recommendedStory.id)
                }
              >
                Start Reading "{recommendedStory.title}"
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#deb887",
          backgroundImage: `url('/images/wood-pattern.png')`,
          backgroundSize: "cover",
          padding: "65px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "0px",
          }}
        >
          <button
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "50px",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
            onClick={() => (window.location.href = "/home")}
          >
            Home
          </button>
          <button
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "50px",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
            onClick={() => handleNavigationToLibrary(storyDifficulty)}
          >
            Library
          </button>
        </div>
      </div>
    </>
  );
}

export default StoryStatistics;
