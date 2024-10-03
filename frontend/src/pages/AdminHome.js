import React, { useState, useEffect } from "react";
import httpClient from "../httpClient";
import { useNavigate } from "react-router-dom";

import {
  MDBContainer,
  MDBFooter,
  MDBTypography,
  MDBIcon,
  MDBRow,
  MDBCol,
  MDBBtn,
} from "mdb-react-ui-kit";
import "bootstrap/dist/css/bootstrap.min.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";

function AdminHome() {
  const [user, setUser] = useState("");
  const navigate = useNavigate();

  /**
   * Fetch admins email to display on the home page
   */
  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get("/admin/@me");
        setUser(resp.data);
        console.log(user);
      } catch (error) {
        console.log("Not authenticated");
      }
    })();
  }, []);

  /**
   * Logout user
   */
  const logoutUser = async () => {
    await httpClient.post("/logout");
    window.location.href = "/";
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* Welcome Section */}
      <MDBContainer fluid className="text-center bg-primary text-white p-5">
        <MDBTypography tag="h1" className="display-3 mb-4">
          Welcome, <span className="fw-bold">{user.email}</span>
        </MDBTypography>
      </MDBContainer>

      {/* Boxes Section */}
      <MDBContainer className="my-5" style={{ flexGrow: 1 }}>
        <MDBRow className="justify-content-center">
          {/* Upload Stories Box */}
          <MDBCol md="4">
            <div
              style={{
                backgroundColor: "#f8f9fa",
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
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  color: "#343a40",
                }}
              >
                Upload Stories
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#6c757d" }}>
                Add new stories to your library.
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
                  width: "100%",
                }}
                onClick={() => navigate("/admin-story-management")}
              >
                Upload
              </button>
            </div>
          </MDBCol>

          {/* Manage Users Box */}
          <MDBCol md="4">
            <div
              style={{
                backgroundColor: "#f8f9fa",
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
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  color: "#343a40",
                }}
              >
                Manage Users
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#6c757d" }}>
                Manage user accounts and permissions.
              </p>
              <button
                style={{
                  backgroundColor: "#28a745",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "50px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  width: "100%",
                }}
                onClick={() => navigate("/admin-user-management")}
              >
                Manage
              </button>
            </div>
          </MDBCol>

          {/* See Statistics Box */}
          <MDBCol md="4">
            <div
              style={{
                backgroundColor: "#f8f9fa",
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
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  color: "#343a40",
                }}
              >
                See Statistics
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#6c757d" }}>
                View user statistics and progress.
              </p>
              <button
                style={{
                  backgroundColor: "#ffc107",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "50px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  width: "100%",
                }}
                onClick={() => navigate("/admin-statistics-management")}
              >
                View Stats
              </button>
            </div>
          </MDBCol>
        </MDBRow>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <MDBBtn color="primary" size="lg" onClick={logoutUser}>
            Logout
          </MDBBtn>
        </div>
      </MDBContainer>

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
    </div>
  );
}

export default AdminHome;
