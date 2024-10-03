import React, { useState, useEffect } from "react";
import { MDBBtn } from "mdb-react-ui-kit";
import AudioAnalyser from "react-audio-analyser";
import httpClient from "../../httpClient";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Board(props) {
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [status, setStatus] = useState(""); // Tracks the current status of the audio recording
  const audioType = "audio/wav"; // Specifies the type of audio file to handle
  const [audioSrc, setAudioSrc] = useState(null); // Stores the audio source URL for playback

  // Split the story content into individual sentences and remove empty ones
  const story = props.story
    .split(".")
    .filter((sentence) => sentence.trim() !== "");

  // State to track the current sentence index in the story
  const [storyIndex, setStoryIndex] = useState(0);

  // State to track the sentence the user is currently reading
  const [currentSentence, setCurrentSentence] = useState("");

  // State to track the highlighted sentence in feedback mode
  const [feedbackHighlightedSentence, setFeedbackHighlightedSentence] =
    useState("");

  // State to track mispronounced words, along with their associated data (audio URLs, syllable strings, etc.)
  const [mispronouncedWords, setMispronouncedWords] = useState([]);

  // State to track corrected mispronounced words during feedback mode
  const [correctedWords, setCorrectedWords] = useState([]);

  // State to track the current word index in feedback mode
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // State to track various conditional flags (stop button, feedback mode, mistake count)
  const [stopButtonClickable, setStopButtonClickable] = useState(false);
  const [isFeedbackMode, setIsFeedbackMode] = useState(false); // Tracks whether feedback mode is active
  const [mistakeCount, setMistakeCount] = useState(0); // Tracks the number of mistakes on the current word

  // Statistics states
  const [errorsMade, setErrorsMade] = useState(0); // Tracks total errors made during reading
  const [audioFileLengths, setAudioFileLengths] = useState(0); // Tracks the total length of recorded audio files

  // Calculate the total number of words in the story
  const totalWords = story.reduce((total, sentence) => {
    const words = sentence
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    return total + words.length;
  }, 0);

  /**
   * Updates the current audio recording status and manages the stop button state accordingly.
   * @param {string} newStatus - The new status of the audio recording (e.g., 'recording', 'inactive').
   */
  const controlAudio = (newStatus) => {
    if (newStatus == "recording") {
      setStopButtonClickable(true);
    } else if (newStatus == "inactive") {
      setStopButtonClickable(false);
    }
    setStatus(newStatus);
  };

  /**
   * useEffect to update the current sentence when the story index changes.
   * Sets the current sentence based on the current story index.
   */
  useEffect(() => {
    setCurrentSentence(story[storyIndex]);
  }, [storyIndex]);

  /**
   * Handles feedback mode, sets mispronounced words, and highlights the current sentence.
   * @param {Array} results - The results of the pronunciation check, containing mispronounced words.
   */
  const handleFeedbackMode = (results) => {
    setIsFeedbackMode(true);

    setMispronouncedWords(results);
    setCurrentWordIndex(0);
    setCorrectedWords([]); // Reset corrected words when entering feedback mode
    setFeedbackHighlightedSentence(currentSentence);
  };

  /**
   * useEffect to update the current sentence when mispronounced words or word index changes in feedback mode.
   */
  useEffect(() => {
    if (isFeedbackMode && mispronouncedWords.length > 0) {
      setCurrentSentence(mispronouncedWords[currentWordIndex]?.word || "");
    }
  }, [mispronouncedWords, currentWordIndex]);

  /**
   * useEffect to handle the upload of statistics when the story is finished.
   * It calculates errors made, pronunciation score, and words per minute (WPM).
   */
  useEffect(() => {
    // If storyIndex has exceeded the length, we trigger the stats upload
    if (storyIndex > story.length - 1) {
      handleStatsUpload(
        errorsMade,
        100 - Math.round((errorsMade / totalWords) * 100),
        Math.round(
          (props.story.trim().split(/\s+/).length / audioFileLengths) * 60
        )
      );
    }
  }, [audioFileLengths, storyIndex]);

  /**
   * Handles the uploading of the recorded audio file to the backend.
   * @param {Blob} blob - The recorded audio file in Blob format.
   */
  const handleAudioUpload = async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "audio.wav");
    formData.append("currentSentence", currentSentence.trim());

    try {
      const response = await httpClient.post(
        "/learner/check_mispronounciation",
        formData
      );
      const { results } = response.data;

      // If no mispronounced words and not in feedback more, want next sentence
      if (results === "pass" && !isFeedbackMode) {
        showToast("good");

        updateAudioFileLength(response.data.duration_audio_file);
        // First, update the story index
        setStoryIndex((prevIndex) => prevIndex + 1);

        // After updating the story index, check if the story has ended
        const newIndex = storyIndex + 1;
        setCurrentSentence(story[newIndex]);
      } else if (results === "pass" && isFeedbackMode) {
        showToast("good");
        moveToNextWord();
      } else if (results.length > 0 && isFeedbackMode) {
        showToast("bad");
        increaseMistake();
      } else if (results.length > 0 && !isFeedbackMode) {
        // Enter feedback mode and start with the first mispronounced word
        incrementErrors(results.length);
        updateAudioFileLength(results[0].duration_audio_file);
        handleFeedbackMode(results);
      }

      setStopButtonClickable(false);
    } catch (error) {
      console.error("Error sending audio file:", error);
    }
  };

  /**
   * Handles the uploading of statistics to the backend after completing the story.
   * @param {number} errorsMade - The total number of errors made by the user.
   * @param {number} pronounciationScore - The calculated pronunciation score.
   * @param {number} wpmAveraged - The calculated words per minute (WPM).
   */
  const handleStatsUpload = async (
    errorsMade,
    pronounciationScore,
    wpmAveraged
  ) => {
    const formData = new FormData();
    formData.append("errors_made", errorsMade);
    formData.append("pronounciation_score", pronounciationScore);
    formData.append("story_id", props.story_id);
    formData.append("wpm_averaged", wpmAveraged);

    try {
      const response = await httpClient.post(
        "/statistic/upload_statistics",
        formData
      );
      console.log("This is statistics upload response", { response });
      const statistic_id = response.data.statistic_id;

      // Navigate to stats screen for this story, passing it stats ID to fetch stats
      navigate("/completion_statistics", { state: { statistic_id } });
    } catch (error) {
      console.error("Error sending audio file:", error);
    }
  };

  // Function to move to the next mispronounced word and handle story progression
  const moveToNextWord = () => {
    if (mispronouncedWords.length > 0) {
      const currentWord =
        mispronouncedWords[currentWordIndex]?.word.toLowerCase();

      // Mark the current word as corrected by adding it to the correctedWords array
      if (!correctedWords.includes(currentWord)) {
        setCorrectedWords((prevCorrected) => [...prevCorrected, currentWord]);
      }

      if (currentWordIndex < mispronouncedWords.length - 1) {
        // Move to the next mispronounced word
        setCurrentWordIndex((prevIndex) => prevIndex + 1);
        setMistakeCount(0); // Reset mistake count for the next word
      } else {
        // Exit feedback mode if no more mispronounced words
        setIsFeedbackMode(false);
        setMistakeCount(0);

        // First, update the story index
        setStoryIndex((prevIndex) => prevIndex + 1);

        // After updating the story index, check if the story has ended
        const newIndex = storyIndex + 1;
        setCurrentSentence(story[newIndex]);
      }
    }
  };

  const getHighlightedSentence = () => {
    const sentenceWords = feedbackHighlightedSentence.split(/\s+/); // Split sentence into words
    const mispronouncedWordSet = new Set(
      mispronouncedWords.map((wordObj) => wordObj.word.toLowerCase())
    ); // Create a set of mispronounced words

    return sentenceWords.map((word, index) => {
      const cleanedWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase(); // Clean punctuation from the word
      const isMispronounced = mispronouncedWordSet.has(cleanedWord);

      // Check if this mispronounced word has been corrected
      const isCorrected =
        isMispronounced && correctedWords.includes(cleanedWord);

      return (
        <span
          key={index}
          style={{
            color: isCorrected ? "green" : isMispronounced ? "red" : "green",
            marginRight: "4px",
          }}
        >
          {word}
        </span>
      );
    });
  };

  // To increment errorsMade by number of mispronounciations made
  const incrementErrors = (numOfMispronounciations) => {
    setErrorsMade((prevErrors) => prevErrors + numOfMispronounciations);
  };

  const increaseMistake = () => {
    setMistakeCount((prevCount) => prevCount + 1);
  };

  // Function to update wordsPerMinute by adding a new value
  const updateAudioFileLength = (additionalValue) => {
    setAudioFileLengths(
      (prevAudioFileLength) => prevAudioFileLength + additionalValue
    );
  };

  const showToast = (feedback) => {
    let message = "";
    if (feedback === "good") {
      const messages = ["Well Done!", "Good Job!", "Way to go!"];
      message = messages[Math.floor(Math.random() * messages.length)];
    } else {
      message = "Incorrect Pronounciation, please try again.";
    }
    toast(message, {
      position: "top-center", // Set the position to the top center
      autoClose: 3000, // 3 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        fontSize: "1rem",
      },
    });
  };

  const audioProps = {
    audioType,
    status,
    audioSrc,
    timeslice: 1000,
    backgroundColor: "#39c0ed",
    strokeColor: "white",
    startCallback: (e) => {
      console.log("succ start", e);
      setStopButtonClickable(true);
    },
    pauseCallback: (e) => {
      console.log("succ pause", e);
    },
    stopCallback: (e) => {
      const audioBlob = e;

      // This generates the audio file the user made in the browser
      //setAudioSrc(window.URL.createObjectURL(audioBlob));
      console.log("succ stop", audioBlob);

      // Upload the audio to the backend
      handleAudioUpload(audioBlob);
    },
    onRecordCallback: (e) => {
      console.log("recording", e);
    },
    errorCallback: (err) => {
      console.log("error", err);
    },
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
            maxWidth: "1200px",
            borderRadius: "8px",
            padding: "20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtY29sb3I9InJnYigyNTUsMjU1LDEwNSkiIHN0cm9rZS1saW5lLWxhc3Q9InJvdW5kIiBzdHJva2Utb3BhY2l0eT0iMDIiIHN0cm9rZS1kYXNoYXJyYXk9IjAuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmUtb3BhY2l0eT0iMjAiIHN0cm9rZS1zdHJva2UtZGFzaGFycmF5PSIwLjMiIHhtbG5zPSJodHRwOi8vd3d3Ljc3Ny5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBoMjAgdjIwSDB6IiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtY29sb3I9InJnYigyNTUsMjU1LDEwNSkiIHN0cm9rZS1saW5lLWxhc3Q9InJvdW5kIiBzdHJva2Utb3BhY2l0eT0iMDIiIHN0cm9rZS1zdHJva2UtbGFzaGFycmF5PSIwLjMiLz48cGF0aCBkPSJNMTAgMCAxMCAxMCAwIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtY29sb3I9InJnYigyNTUsMjU1LDEwNSkiIHN0cm9rZS1saW5lLWxhc3Q9InJvdW5kIiBzdHJva2Utb3BhY2l0eT0iMDIiIHN0cm9rZS1zdHJva2UtZGFzaGFycmF5PSIwLjIiLz48cGF0aCBkPSJNMTAgMCAxMCAxMCAxMCIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxhc3Q9InJvdW5kIiBzdHJva2Utb3BhY2l0eT0iMCIgc3Ryb2tlLXN0cm9rZS1kYXNoYXJyYXk9IjAuMiIvPjwvc3ZnPg==")`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "repeat",
            position: "relative",
          }}
        >
          <div>
            {isFeedbackMode ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "2rem",
                    color: "#000",
                  }}
                >
                  {getHighlightedSentence()}
                </div>
                <p
                  className="display-4 font-weight-bold"
                  style={{
                    fontSize: "1.5rem",
                    color: "#000",
                    marginTop: "50px",
                  }}
                >
                  Please Repeat Mispronounced Word:{" "}
                  <span
                    style={{
                      color: "red",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {mispronouncedWords[currentWordIndex]?.word}
                  </span>
                </p>
                <p style={{ fontSize: "1.5rem", color: "#000" }}>
                  {mispronouncedWords[currentWordIndex]?.syllable_string}
                </p>
                <audio
                  style={{ marginBottom: "16px" }}
                  controls
                  src={mispronouncedWords[currentWordIndex]?.audio_url}
                ></audio>
                {mistakeCount >= 2 && (
                  <MDBBtn size="lg" color="primary" onClick={moveToNextWord}>
                    Next Word
                  </MDBBtn>
                )}
              </div>
            ) : (
              <>
                <p style={{ fontSize: "1.25rem", color: "#666" }}>
                  Please read the following sentence:
                </p>
                <p
                  className="display-4 font-weight-bold"
                  style={{ fontSize: "2rem", color: "#000" }}
                >
                  {currentSentence}.
                </p>
              </>
            )}
          </div>

          <div style={{ width: "100%" }}>
            {stopButtonClickable && (
              <p
                style={{
                  fontSize: "1.25rem",
                  color: "#007BFF",
                  textAlign: "center",
                }}
              >
                I am currently listening, you can speak!
              </p>
            )}
            <AudioAnalyser {...audioProps} />
          </div>
        </div>
        <ToastContainer />
      </div>

      <div
        style={{
          backgroundColor: "#deb887",
          backgroundImage: `url('/images/wood-pattern.png')`,
          backgroundSize: "cover",
          padding: "20px",
          boxSizing: "border-box",
          flexGrow: 1,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: "30px" }}>
          <button
            style={{
              padding: "15px 30px",
              fontSize: "1.5rem",
              color: "#fff",
              backgroundColor: "#28a745",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => controlAudio("recording")}
          >
            Begin Reading
          </button>
          <button
            style={{
              padding: "15px 30px",
              fontSize: "1.5rem",
              color: "#fff",
              backgroundColor: "#39c0ed",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => controlAudio("paused")}
          >
            Pause Reading
          </button>
          <button
            style={{
              padding: "15px 30px",
              fontSize: "1.5rem",
              color: "#fff",
              backgroundColor: "#dc3545",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => controlAudio("inactive")}
            disabled={!stopButtonClickable}
          >
            Stop Reading
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#deb887",
          //backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')`,
          backgroundImage: `url('/images/wood-pattern.png')`,
          backgroundSize: "cover",
          padding: "25px 0px",
          textAlign: "center",
          flexGrow: 1,
        }}
      >
        <div>&copy; 2024 Your Company</div>
      </div>
    </>
  );
}

export default Board;
