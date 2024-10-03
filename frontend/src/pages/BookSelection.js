import React from "react";
import Library from "../components/Library/Library";
import { useLocation } from "react-router-dom";

function BookSelection() {
  const location = useLocation();
  const { difficulty } = location.state;
  return (
    <>
      <Library difficulty={difficulty} />
    </>
  );
}

export default BookSelection;
