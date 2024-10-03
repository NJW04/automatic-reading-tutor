import React from "react";
import Board from "../components/ReadingBoard/Board";
import { useLocation } from "react-router-dom";

function ReadingBoard() {
  const location = useLocation();

  const { story_content, story_id } = location.state;
  return (
    <>
      <Board story={story_content} story_id={story_id} />
    </>
  );
}

export default ReadingBoard;
