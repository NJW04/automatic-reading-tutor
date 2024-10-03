import React, { useState } from "react";
import httpClient from "../../httpClient";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBIcon,
  MDBInput,
} from "mdb-react-ui-kit";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Registers a new user by sending the email, username, and password to the backend.
   * Validates inputs before making the request.
   */
  const registerUser = async () => {
    // Validate inputs
    if (!validateEmail(email)) {
      showToast("Please enter a valid email address without spaces.");
      return;
    }
    if (!validateUsername(username)) {
      showToast(
        "Username can only contain letters, numbers, underscores, and hyphens, and no spaces."
      );
      return;
    }
    if (!validatePassword(password)) {
      showToast("Password must be at least 6 characters long with no spaces.");
      return;
    }

    if (email && username && password) {
      try {
        const resp = await httpClient.post("/register", {
          email,
          username,
          password,
        });

        window.location.href = "/";
      } catch (error) {
        if (error.response) {
          if (error.response.status === 409) {
            const errorMessage = error.response.data.error;

            if (errorMessage.includes("email")) {
              showToast("User with that email already exists");
            } else if (errorMessage.includes("username")) {
              showToast("User with that username already exists");
            } else {
              showToast("User with that email or username already exists");
            }
          } else {
            window.location.href = "404";
          }
        } else {
          window.location.href = "/404";
        }
      }
    } else {
      showToast("Please fill in all fields");
    }
  };

  // Function to show a toast message
  const showToast = (message) => {
    toast(message, {
      position: "top-center", // Set the position to the top center
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        fontSize: "1rem",
      },
    });
  };

  // Email validation function using regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Ensures no spaces in the email
    return emailRegex.test(email);
  };

  // Username validation function using regex
  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_-]+$/; // Only allows letters, numbers, underscores, and hyphens, no spaces
    return usernameRegex.test(username);
  };

  // Password validation function
  const validatePassword = (password) => {
    const passwordRegex = /^\S{6,}$/; // Ensures no spaces and at least 6 characters long
    return passwordRegex.test(password);
  };

  return (
    <MDBContainer fluid>
      <MDBRow>
        <MDBCol sm="6">
          <div className="d-flex flex-row ps-5 pt-5 mb-5">
            <MDBIcon
              fas
              icon="book-open fa-3x me-3"
              style={{ color: "#709085" }}
            />
            <span className="h1 fw-bold mb-0">Automatic Reading Tutor</span>
          </div>

          <div className="d-flex flex-column justify-content-center h-custom-2 w-75 pt-4">
            <h3
              className="fw-normal mb-3 ps-5 pb-3"
              style={{ letterSpacing: "1px" }}
            >
              Registration Below
            </h3>

            <MDBInput
              wrapperClass="mb-4 mx-5 w-100"
              label="Username"
              id="formControlLg"
              type="text"
              size="lg"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <MDBInput
              wrapperClass="mb-4 mx-5 w-100"
              label="Email address"
              id="formControlLg"
              type="email"
              size="lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <MDBInput
              wrapperClass="mb-4 mx-5 w-100"
              label="Password"
              id="formControlLg"
              type="password"
              size="lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <MDBBtn
              className="mb-4 px-5 mx-5 w-100"
              color="info"
              size="lg"
              onClick={() => registerUser()}
            >
              Register
            </MDBBtn>
            <p className="ms-5">
              Already have an account?{" "}
              <a href="/" class="link-info">
                Login here
              </a>
            </p>
          </div>
        </MDBCol>

        <MDBCol sm="6" className="d-none d-sm-block px-0">
          <img
            src="/images/bg2.png"
            alt="Login image"
            className="w-100"
            style={{ objectFit: "cover", objectPosition: "left" }}
          />
        </MDBCol>
      </MDBRow>
      <ToastContainer />
    </MDBContainer>
  );
}

export default RegisterForm;
