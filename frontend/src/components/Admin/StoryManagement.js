import React, { useState, useEffect } from "react";
import httpClient from "../../httpClient";

import {
  MDBContainer,
  MDBFooter,
  MDBTypography,
  MDBIcon,
  MDBRow,
  MDBCol,
  MDBBtn,
} from "mdb-react-ui-kit"; // No MDBInput import here
import "bootstrap/dist/css/bootstrap.min.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";

function StoryManagement() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isJsonUpload, setIsJsonUpload] = useState(false); // Track if JSON file is uploaded

  /**
   * Handles the submission of the story form.
   * Validates the input fields and checks if a JSON upload is being used.
   * Sends the story data to the backend if valid.
   */
  const handleSubmit = async () => {
    if (isJsonUpload) {
      setMessage(
        "You've uploaded a JSON file. Please reset the form to manually add a story."
      );
      setMessageType("error");
      return;
    }

    if (!title || !content || !difficulty) {
      setMessage("All fields must be filled in.");
      setMessageType("error");
    } else if (!/^[\w\s]+[\.\!]\s+[\w\s]+[\.\!]/.test(content)) {
      setMessage("Content must be in the format of <sentence>. <sentence>.");
      setMessageType("error");
    } else {
      // Submit the form data
      try {
        const response = await httpClient.post("/admin/add_story", {
          title,
          content,
          difficulty,
        });
        setMessage("Story added successfully!");
        setMessageType("success");
        // Clear fields after successful submission
        setTitle("");
        setContent("");
        setDifficulty("");
      } catch (err) {
        setMessage("Error adding story. Please try again.");
        setMessageType("error");
      }
    }
  };

  /**
   * Handles the JSON file upload.
   * Reads the file, parses it as JSON, and populates the form fields.
   */
  const handleJsonUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const { title, difficulty, content } = json;

        // Validate JSON format
        if (!title || !difficulty || !content) {
          setMessage(
            "Invalid JSON format. Required format: { title: Sample Title, difficulty: easy, content: Story content. }."
          );
          setMessageType("error");
          return;
        }

        // Ensure form fields are empty if JSON upload is used
        if (title || difficulty || content) {
          setTitle("");
          setDifficulty("");
          setContent("");
        }

        // Update the form with JSON values
        setTitle(title);
        setDifficulty(difficulty);
        setContent(content);
        setMessage("JSON story loaded successfully!");
        setMessageType("success");
        setIsJsonUpload(true); // Mark that JSON file is uploaded
      } catch (err) {
        setMessage(
          "Error parsing JSON file. Please ensure the format is correct."
        );
        setMessageType("error");
      }
    };

    if (file) {
      reader.readAsText(file);
    }
  };

  /**
   * Resets the form fields and messages.
   * Clears all input fields and resets the JSON upload state.
   */
  const handleResetForm = () => {
    setTitle("");
    setContent("");
    setDifficulty("");
    setMessage("");
    setMessageType("");
    setIsJsonUpload(false); // Reset the form
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* Header */}
      <MDBContainer fluid className="text-center bg-primary text-white p-5">
        <MDBTypography tag="h1" className="display-3 mb-4">
          Automated Reading Tutor
        </MDBTypography>
        <button
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            padding: "10px 20px",
            cursor: "pointer",
            boxShadow: "0px 4px 8px rgba(0, 123, 255, 0.5)",
            marginRight: "40px",
          }}
          onClick={() => (window.location.href = "/admin-home")}
        >
          Home
        </button>
      </MDBContainer>

      {/* Add a Story Page */}
      <MDBContainer className="my-5" style={{ flexGrow: 1 }}>
        <MDBRow className="justify-content-center">
          <MDBCol md="6">
            <div
              style={{
                backgroundColor: "#f1f1f1", // Lighter gray color
                border: "2px solid #d0d0d0",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                padding: "20px",
                textAlign: "center",
                margin: "10px auto",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#343a40",
                }}
              >
                Add a Story
              </h2>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #d0d0d0",
                  marginBottom: "20px",
                }}
                disabled={isJsonUpload} // Disable when JSON is uploaded
              />
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="difficulty" style={{ marginRight: "10px" }}>
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #d0d0d0",
                  }}
                  disabled={isJsonUpload} // Disable when JSON is uploaded
                >
                  <option value="" disabled>
                    Select Difficulty
                  </option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <textarea
                rows="10"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: "100%",
                  resize: "none",
                  overflowY: "auto",
                  height: "300px",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  textAlign: "left",
                  padding: "10px",
                  boxSizing: "border-box",
                  marginBottom: "20px",
                }}
                placeholder="Your story goes here..."
                disabled={isJsonUpload}
              />

              {/* Row to align buttons in a single line */}
              <MDBRow>
                {/* Centralized Add Story button */}
                <MDBCol className="text-center">
                  <MDBBtn color="primary" onClick={handleSubmit}>
                    Add Story
                  </MDBBtn>
                </MDBCol>

                {/* Right-aligned Choose File button */}
                <MDBCol className="text-end">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleJsonUpload}
                    style={{ marginBottom: "20px" }}
                    disabled={title || content || difficulty} // Disable when manual input exists
                  />
                </MDBCol>
              </MDBRow>

              <MDBBtn color="secondary" pa onClick={handleResetForm}>
                Reset Form
              </MDBBtn>

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#6c757d",
                  marginTop: "16px",
                }}
              >
                Upload a story in JSON format:{" "}
                {
                  '{ "title": "Sample Title", "difficulty": "easy", "content": "Story content." }'
                }
              </p>

              {message && (
                <MDBTypography
                  tag="p"
                  className={`mb-4 ${
                    messageType === "success" ? "text-success" : "text-danger"
                  }`}
                >
                  {message}
                </MDBTypography>
              )}
            </div>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default StoryManagement;
