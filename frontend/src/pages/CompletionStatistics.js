import React from "react";
import StoryStatistics from "../components/StoryStatistics/StoryStatistics";
import { useLocation } from "react-router-dom";

function CompletionStatistics() {
  const location = useLocation();
  const { statistic_id } = location.state;

  return (
    <>
      <StoryStatistics statistic_id={statistic_id} />
    </>
  );
}

export default CompletionStatistics;
