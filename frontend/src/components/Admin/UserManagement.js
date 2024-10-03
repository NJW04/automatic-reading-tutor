import React, { useState, useEffect } from "react";
import httpClient from "../../httpClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserManagement() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userList, setUserList] = useState([]);

  const [viewMode, setViewMode] = useState(null); // 'add', 'edit', or 'delete'

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [editUser, setEditUser] = useState({ username: "", email: "" });

  /**
   * useEffect to fetch the list of users when the component mounts.
   * Calls the backend to get all learners and sets the user list state.
   */
  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get("/admin/get_all_learners");
        setUserList(resp.data);
      } catch (error) {
        console.log("Not authenticated");
      }
    })();
  }, []);

  /**
   * Handle adding a new user.
   * Validates form inputs and sends a POST request to add the user to the backend.
   */
  const handleAddUser = async () => {
    if (newUser.username && newUser.email && newUser.password) {
      try {
        // Extract user details from newUser state
        const { email, username, password } = newUser;

        // Make post request to backend
        const resp = await httpClient.post("/register", {
          email,
          username,
          password,
        });

        // Fetch user ID and other details from the backend response
        const newUserFromBackend = resp.data;

        // Update the userList with the new user details including password
        setUserList([...userList, newUserFromBackend]);

        // Clear the form and reset the view mode
        setNewUser({ username: "", email: "", password: "" });
        setViewMode(null);
        showToast("User Added!");
      } catch (error) {
        if (error.response) {
          if (error.response.status === 409) {
            showToast("User with that email or username already exists");
          } else {
            window.location.href = "/404";
          }
        } else {
          // Handle backend offline or no response
          window.location.href = "/404";
        }
      }
    } else {
      showToast("Please fill in all fields.");
    }
  };

  /**
   * Handle editing an existing user.
   * Validates form inputs and sends a PUT request to update the user on the backend.
   */
  const handleEditUser = async () => {
    if (editUser.username && editUser.email) {
      try {
        console.log("Selected User ID:", selectedUser.id);
        // Make a PUT request to update the user on the backend
        const resp = await httpClient.put(
          `/admin/edit_user/${selectedUser.id}`,
          {
            username: editUser.username,
            email: editUser.email,
          },
          { withCredentials: true }
        );

        // Update the userList with the edited user
        const updatedList = userList.map((user) =>
          user.id === selectedUser.id ? { ...user, ...resp.data } : user
        );

        // Update the state with the new userList
        setUserList(updatedList);

        // Show success message with updated username and email
        showToast(
          `User successfully edited: email = ${resp.data.email}, username = ${resp.data.username}`
        );

        // Clear selection and reset view mode
        setSelectedUser(null);
        setViewMode(null);
      } catch (error) {
        if (error.response) {
          if (error.response.status === 409) {
            showToast("Username or email already exists");
          } else {
            //window.location.href = "/404";
            console.log("Selected User ID:", selectedUser.id);
          }
        } else {
          //window.location.href = "/404";
          console.log("Selected User ID:", selectedUser.id);
        }
      }
    } else {
      showToast("Please fill in all fields.");
    }
  };

  /**
   * Handle deleting a user.
   * Sends a DELETE request to remove the selected user from the backend.
   */
  const handleDeleteUser = async () => {
    if (!selectedUser) {
      showToast("Please select a user to delete.");
      return;
    }

    try {
      // Make a DELETE request to the backend to remove the user
      await httpClient.delete(`/admin/delete_user/${selectedUser.id}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Filter out the deleted user from the user list
      const updatedList = userList.filter(
        (user) => user.id !== selectedUser.id
      );
      setUserList(updatedList);

      // Clear the selection and reset the view mode
      setSelectedUser(null);
      setViewMode(null);

      // Show a success toast notification
      showToast("User successfully deleted!");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        showToast("User not found or already deleted.");
      } else {
        showToast("An error occurred while deleting the user.");
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

  /**
   * Render the list of users.
   * Highlights the selected user in the list.
   */
  const renderUserList = () => (
    <ul style={{ padding: 0, listStyle: "none" }}>
      {userList.map((user) => (
        <li
          key={user.id}
          onClick={() => setSelectedUser(user)}
          style={{
            padding: "10px",
            cursor: "pointer",
            color: selectedUser?.id === user.id ? "#ffffff" : "#007bff", // Highlight color when selected
            backgroundColor:
              selectedUser?.id === user.id ? "#007bff" : "transparent", // Background change when selected
            borderBottom: "1px solid #ddd",
          }}
        >
          Username: {user.username}, Email: {user.email}
        </li>
      ))}
    </ul>
  );

  return (
    <div style={containerStyle}>
      {/* Header */}
      <h1 style={headerStyle}>Admin User Management</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
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
            marginLeft: "50px",
          }}
          onClick={() => (window.location.href = "/admin-home")}
        >
          Home
        </button>
      </div>

      {/* Button options under header */}
      <div style={buttonContainer}>
        <button onClick={() => setViewMode("add")} style={buttonStyle}>
          Add New User
        </button>
        <button onClick={() => setViewMode("edit")} style={buttonStyle}>
          Edit User
        </button>
        <button onClick={() => setViewMode("delete")} style={buttonStyle}>
          Delete User
        </button>
      </div>

      {/* Content based on the selected mode */}
      <div style={{ marginTop: "50px" }}>
        {viewMode === "add" && (
          <div style={modalStyle}>
            <h3 style={sectionHeaderStyle}>Add New User</h3>
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              style={inputStyle}
            />
            <button onClick={handleAddUser} style={submitButtonStyle}>
              Submit
            </button>
          </div>
        )}

        {viewMode === "edit" && (
          <div style={modalStyle}>
            <h3 style={sectionHeaderStyle}>Select a User to Edit</h3>
            {renderUserList()}
            {selectedUser && (
              <div style={{ marginTop: "20px" }}>
                <h4 style={sectionHeaderStyle}>Edit User Info</h4>
                <input
                  type="text"
                  placeholder="username"
                  value={editUser.username}
                  onChange={(e) =>
                    setEditUser({ ...editUser, username: e.target.value })
                  }
                  style={inputStyle}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                  style={inputStyle}
                />
                <button onClick={handleEditUser} style={submitButtonStyle}>
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}

        {viewMode === "delete" && (
          <div style={modalStyle}>
            <h3 style={sectionHeaderStyle}>Select a User to Delete</h3>
            {renderUserList()}
            {selectedUser && (
              <div style={{ marginTop: "20px" }}>
                <h4 style={sectionHeaderStyle}>
                  Are you sure you want to delete {selectedUser.username}?
                </h4>
                <button
                  onClick={handleDeleteUser}
                  style={{ ...submitButtonStyle, backgroundColor: "red" }}
                >
                  Confirm Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

// Styles
const containerStyle = {
  padding: "20px",
  backgroundColor: "#f4f7fc",
  minHeight: "100vh",
};

const headerStyle = {
  fontSize: "36px",
  fontWeight: "bold",
  color: "#007bff",
  textAlign: "center",
  marginBottom: "20px",
};

const buttonContainer = {
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  marginBottom: "20px",
};

const buttonStyle = {
  padding: "10px 20px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  boxShadow: "0px 4px 6px rgba(0, 123, 255, 0.4)",
};

const modalStyle = {
  marginTop: "20px",
  padding: "30px",
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
};

const sectionHeaderStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#007bff",
  marginBottom: "20px",
};

const inputStyle = {
  display: "block",
  margin: "10px 0",
  padding: "10px",
  width: "100%",
  borderRadius: "5px",
  border: "1px solid #ddd",
};

const submitButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "10px",
  boxShadow: "0px 4px 6px rgba(40, 167, 69, 0.4)",
};

export default UserManagement;
