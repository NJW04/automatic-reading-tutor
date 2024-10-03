import React from "react";
import { Outlet, Navigate } from "react-router-dom";

const ProtectedAdminRoute = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  console.log(user);

  // Check if the user is logged in and is an admin
  if (!user || user.accountType !== "admin") {
    return <Navigate to="/" replace />;
  }

  // If the user is an admin, allow access to the page
  return <Outlet />;
};

export default ProtectedAdminRoute;
