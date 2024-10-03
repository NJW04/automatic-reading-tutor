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

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Handle login when the user submits the form.
   * Sends a POST request to the backend to authenticate the user.
   */
  const logInUser = async () => {
    try {
      const resp = await httpClient.post("/login", {
        email,
        password,
      });

      // Save user data and role (admin or learner) to local storage
      console.log(resp);
      const { accountType } = resp.data;
      localStorage.setItem("user", JSON.stringify(resp.data));

      // Redirect based on the account type
      if (accountType === "admin") {
        window.location.href = "/admin-home";
      } else {
        window.location.href = "/home";
      }
    } catch (error) {
      console.log(error.response.data.error);
      if (error.response) {
        if (error.response.status === 401) {
          showToast(error.response.data.error); // Showing the error message using toast notification
        } else {
          window.location.href = "/404";
        }
      } else {
        window.location.href = "/404";
      }
    }
  };

  /**
   * Display a toast notification with a custom message.
   * @param {string} message - The message to display in the toast
   */
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
              Log in
            </h3>

            <MDBInput
              wrapperClass="mb-4 mx-5 w-100"
              label="Email address"
              type="email"
              size="lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <MDBInput
              wrapperClass="mb-4 mx-5 w-100"
              label="Password"
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
              onClick={() => logInUser()}
            >
              Login
            </MDBBtn>
            <p className="ms-5">
              Don't have an account?{" "}
              <a href="/register" className="link-info">
                Register here
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

export default LoginForm;
