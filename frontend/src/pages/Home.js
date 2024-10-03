import React, { useState, useEffect } from "react";
import httpClient from "../httpClient";
import { useNavigate } from "react-router-dom";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
  MDBRow,
  MDBCol,
  MDBFooter,
  MDBTypography,
  MDBIcon,
} from "mdb-react-ui-kit";
import "bootstrap/dist/css/bootstrap.min.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";

function Home() {
  const [user, setUser] = useState("");
  const navigate = useNavigate();

  /**
   * Handles navigation to the library page with the selected difficulty level.
   * @param {string} difficulty - The difficulty level selected by the user.
   */
  const handleNavigation = (difficulty) => {
    const data = { difficulty };
    console.log(data);
    navigate("/library", { state: data });
  };

  /**
   * Logs the user out by sending a POST request to the /logout endpoint.
   * After logging out, redirects the user to the home page.
   */
  const logoutUser = async () => {
    await httpClient.post("/logout");
    window.location.href = "/";
  };

  /**
   * useEffect hook to fetch the current user's details when the component mounts.
   * If the user is not authenticated, an error will be logged.
   */
  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get("/learner/@me");
        setUser(resp.data);
      } catch (error) {
        console.log("Not authenticated");
      }
    })();
  }, []);

  return (
    <>
      {/* Welcome Section */}
      <MDBContainer fluid className="text-center bg-primary text-white p-5">
        <MDBTypography tag="h1" className="display-3 mb-4">
          Welcome, <span className="fw-bold">{user.username}</span>
        </MDBTypography>
      </MDBContainer>

      {/* Difficulty Cards */}
      <MDBContainer className="my-5">
        <MDBTypography tag="h2" className="text-center mb-4">
          Choose Reading Difficulty Level
        </MDBTypography>
        <MDBRow className="justify-content-center">
          <MDBCol md="4">
            <MDBCard className="shadow-0 border rounded-3">
              <MDBCardBody className="text-center">
                <MDBCardTitle className="text-success">Easy</MDBCardTitle>
                <MDBCardText>
                  Browse stories with easy difficulty to get started.
                </MDBCardText>
                <MDBBtn
                  color="success"
                  onClick={() => handleNavigation("easy")}
                >
                  Select
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol md="4">
            <MDBCard className="shadow-0 border rounded-3">
              <MDBCardBody className="text-center">
                <MDBCardTitle className="text-warning">Medium</MDBCardTitle>
                <MDBCardText>
                  Explore medium stories to challenge yourself.
                </MDBCardText>
                <MDBBtn
                  color="warning"
                  onClick={() => handleNavigation("medium")}
                >
                  Select
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol md="4">
            <MDBCard className="shadow-0 border rounded-3">
              <MDBCardBody className="text-center">
                <MDBCardTitle className="text-danger">Hard</MDBCardTitle>
                <MDBCardText>
                  Test your skills with our hard difficulty stories.
                </MDBCardText>
                <MDBBtn color="danger" onClick={() => handleNavigation("hard")}>
                  Select
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>

      {/* Statistics Button */}
      <MDBContainer className="text-center my-5">
        <MDBBtn
          color="primary"
          size="lg"
          href="#view-statistics"
          onClick={() => navigate("/lifetime_statistics")}
        >
          View Statistics
        </MDBBtn>
      </MDBContainer>
      <MDBContainer className="text-center my-5">
        <MDBBtn color="primary" size="lg" onClick={logoutUser}>
          Logout
        </MDBBtn>
      </MDBContainer>

      {/* Footer Separator */}
      <div className="bg-light py-3">
        <MDBContainer>
          <MDBTypography tag="h5" className="text-center mb-0">
            Thank you for visiting!
          </MDBTypography>
        </MDBContainer>
      </div>

      {/* Footer */}
      <MDBFooter
        bgColor="dark"
        className="text-center text-lg-start text-white"
      >
        <MDBContainer className="p-4">
          <MDBRow className="justify-content-center">
            <MDBCol md="4" lg="3" className="mb-4 mb-md-0">
              <MDBTypography tag="h5" className="text-uppercase mb-4">
                About Us
              </MDBTypography>
              <MDBTypography>
                We are dedicated to providing innovative tools to enhance
                reading skills and literacy.
              </MDBTypography>
            </MDBCol>
            <MDBCol md="4" lg="3" className="mb-4 mb-md-0">
              <MDBTypography tag="h5" className="text-uppercase mb-4">
                Contact
              </MDBTypography>
              <MDBTypography>
                <MDBIcon icon="envelope" className="me-2" />
                support@readingtutor.com
              </MDBTypography>
              <MDBTypography>
                <MDBIcon icon="phone" className="me-2" />
                (123) 456-7890
              </MDBTypography>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
        <div className="text-center p-3 bg-dark">
          © 2024 Reading Tutor. All Rights Reserved.
        </div>
      </MDBFooter>
    </>
  );
}

export default Home;
