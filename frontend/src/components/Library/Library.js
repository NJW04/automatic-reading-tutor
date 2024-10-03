import httpClient from "../../httpClient";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBCardFooter,
  MDBBtn,
  MDBTypography,
} from "mdb-react-ui-kit";

function Library(props) {
  // State to store the list of stories fetched from the backend
  const [stories, setStories] = useState([]);

  // Filter out unread stories based on the 'read' flag
  const unreadStories = stories.filter((story) => !story.read);

  // Filter out read stories based on the 'read' flag
  const readStories = stories.filter((story) => story.read);

  const navigate = useNavigate(); // useNavigate hook for programmatic navigation

  // Capitalize the first letter of the difficulty level passed via props
  const capitalizedDifficulty = capitalizeFirstLetter(props.difficulty);

  /**
   * useEffect to fetch stories from the backend when the component mounts.
   * Sends a request to retrieve stories based on the difficulty level.
   */
  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get("/story/library", {
          params: {
            difficulty: props.difficulty,
          },
        });
        //We are setting stories to have all data in JSON format
        setStories(resp.data);
        console.log("This is resp.data: ", resp.data);
        console.log("This is the stories array:");
        console.log(stories);
      } catch (error) {
        console.log("Error retrieving books");
        alert("Error retrieving books");
      }
    })();
  }, []);

  /**
   * Begin the reading session by navigating to the 'board' screen.
   * Sends the story content and story ID as props to the reading screen.
   * @param {string} story_content - The content of the selected story
   * @param {string} story_id - The ID of the selected story
   */
  function beginReading(story_content, story_id) {
    const data = { story_content, story_id };
    console.log("This is the props data to be sent to board", data);
    navigate("/board", { state: data });
  }

  function handleBackToHome() {
    window.location.href = "/home";
  }

  /**
   * Capitalize the first letter of a given string.
   * If the string is empty or undefined, return an empty string.
   * @param {string} string - The string to capitalize
   * @returns {string} - The string with the first letter capitalized
   */
  function capitalizeFirstLetter(string) {
    if (!string) return ""; // Handle empty string or undefined
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <>
      {/* Header with difficulty level and back to home button */}
      <header
        style={{
          backgroundColor: "#000", // Black background for the header
          color: "#fff",
          padding: "20px 75px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <MDBTypography tag="h2" style={{ margin: 0 }}>
          {capitalizedDifficulty} Difficulty
        </MDBTypography>
        <MDBBtn color="light" onClick={handleBackToHome}>
          Back to Home
        </MDBBtn>
      </header>

      {/* White Background */}
      <div
        style={{
          backgroundColor: "#f8f9fa", // Light grey background for a soft contrast
          minHeight: "100vh",
          padding: "40px 0",
        }}
      >
        <MDBContainer>
          {/* Unread Stories Section */}
          <section style={{ marginBottom: "40px" }}>
            <div
              style={{
                borderBottom: "2px solid #28a745", // Green underline for "Unread Stories"
                paddingBottom: "10px",
                marginBottom: "30px",
              }}
            >
              <MDBTypography
                tag="h3"
                className="text-center"
                style={{
                  color: "#28a745", // Green color for "Unread Stories"
                  fontWeight: "bold",
                  fontSize: "2rem",
                }}
              >
                Unread Stories
              </MDBTypography>
            </div>

            {/* Fixed-size Container for Unread Stories */}
            <div
              style={{
                height: "600px", // Fixed height for the container
                overflowY: "auto", // Enable vertical scrolling
                display: "flex",
                flexDirection: "column",
              }}
            >
              <MDBRow style={{ margin: "0" }}>
                {unreadStories.map((story) => (
                  <MDBCol md="6" lg="4" key={story.id} className="mb-4">
                    <MDBCard
                      style={{
                        borderRadius: "15px",
                        border: "2px solid #dee2e6", // Thicker outline
                        backgroundColor: "#e9ecef", // Slightly different gray color
                        transition: "transform 0.3s",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <MDBCardBody
                        className="text-center"
                        style={{
                          padding: "30px",
                        }}
                      >
                        <MDBCardTitle
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "1.75rem",
                            marginBottom: "20px",
                            color: "#343a40", // Dark text color for better readability
                          }}
                        >
                          {story.title}
                        </MDBCardTitle>
                        <MDBCardText
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "1rem",
                            color: "#6c757d",
                            marginBottom: "15px",
                          }}
                        >
                          <strong>ID:</strong> {story.id}
                        </MDBCardText>
                        <MDBCardText
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "0.9rem",
                            color: "#6c757d",
                            marginBottom: "20px",
                          }}
                        >
                          Preview: {story.content.split(".")[0]}.
                        </MDBCardText>
                      </MDBCardBody>
                      <MDBCardFooter
                        className="text-center"
                        style={{
                          padding: "20px",
                          backgroundColor: "#f1f3f5",
                          borderTop: "1px solid #dee2e6",
                        }}
                      >
                        <MDBBtn
                          className="px-5 w-100"
                          color="info"
                          size="lg"
                          onClick={() => beginReading(story.content, story.id)}
                          style={{
                            borderRadius: "50px",
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: "bold",
                          }}
                        >
                          Read Story
                        </MDBBtn>
                      </MDBCardFooter>
                    </MDBCard>
                  </MDBCol>
                ))}
              </MDBRow>
            </div>
          </section>

          {/* Read Stories Section */}
          <section>
            <div
              style={{
                borderBottom: "2px solid #dc3545", // Red underline for "Read Stories"
                paddingBottom: "10px",
                marginBottom: "30px",
              }}
            >
              <MDBTypography
                tag="h3"
                className="text-center"
                style={{
                  color: "#dc3545", // Red color for "Read Stories"
                  fontWeight: "bold",
                  fontSize: "2rem",
                }}
              >
                Read Stories
              </MDBTypography>
            </div>

            {/* Fixed-size Container for Read Stories */}
            <div
              style={{
                height: "600px", // Fixed height for the container
                overflowY: "auto", // Enable vertical scrolling
                display: "flex",
                flexDirection: "column",
              }}
            >
              <MDBRow style={{ margin: "0" }}>
                {readStories.map((story) => (
                  <MDBCol md="6" lg="4" key={story.id} className="mb-4">
                    <MDBCard
                      style={{
                        borderRadius: "15px",
                        border: "2px solid #dee2e6", // Thicker outline
                        backgroundColor: "#e9ecef", // Slightly different gray color
                        transition: "transform 0.3s",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <MDBCardBody
                        className="text-center"
                        style={{
                          padding: "30px",
                        }}
                      >
                        <MDBCardTitle
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "1.75rem",
                            marginBottom: "20px",
                            color: "#343a40", // Dark text color for better readability
                          }}
                        >
                          {story.title}
                        </MDBCardTitle>
                        <MDBCardText
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "1rem",
                            color: "#6c757d",
                            marginBottom: "15px",
                          }}
                        >
                          <strong>ID:</strong> {story.id}
                        </MDBCardText>
                        <MDBCardText
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: "0.9rem",
                            color: "#6c757d",
                            marginBottom: "20px",
                          }}
                        >
                          Preview: {story.content.split(".")[0]}.
                        </MDBCardText>
                      </MDBCardBody>
                      <MDBCardFooter
                        className="text-center"
                        style={{
                          padding: "20px",
                          backgroundColor: "#f1f3f5",
                          borderTop: "1px solid #dee2e6",
                        }}
                      >
                        <MDBBtn
                          className="px-5 w-100"
                          color="info"
                          size="lg"
                          onClick={() => beginReading(story.content, story.id)}
                          style={{
                            borderRadius: "50px",
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: "bold",
                          }}
                        >
                          Read Story
                        </MDBBtn>
                      </MDBCardFooter>
                    </MDBCard>
                  </MDBCol>
                ))}
              </MDBRow>
            </div>
          </section>
        </MDBContainer>
      </div>
    </>
  );
}

export default Library;
