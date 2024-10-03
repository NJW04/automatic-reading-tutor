import React, { useState, useEffect } from "react";
import httpClient from "../../httpClient";

const StatisticsManagement = () => {
  // State to store selected user and view option
  const [selectedUserID, setSelectedUser] = useState(""); //Stores ID of currently selected User, i.e use that id in the call
  const [viewMode, setViewMode] = useState("general"); // 'general' or 'individual'
  const [generalStatistics, setGeneralStatistics] = useState({
    averagePronunciationScore: null,
    averageWPM: null,
    averageWordErrorRate: null,
  });
  const [learners, setLearners] = useState([]);

  // All statistic records for single learner
  const [tableData, setTableData] = useState([]);

  // Averages For Single Learner
  const [averageLearnerData, setAverageLearnerData] = useState({
    totalStoriesRead: 0,
    averageWordErrorRate: 0,
    averagePronunciationScore: 0,
    averageWordsPerMinute: 0,
  });

  // Fetch general statistics when 'General' view is selected
  useEffect(() => {
    if (viewMode === "general") {
      async function fetchGeneralStatistics() {
        try {
          const response = await httpClient.get("/admin/general_statistics");
          setGeneralStatistics({
            averagePronunciationScore: response.data.averagePronunciationScore,
            averageWPM: response.data.averageWPM,
            averageWordErrorRate: response.data.averageWordErrorRate,
          });
        } catch (error) {
          console.error("Error fetching general statistics:", error);
        }
      }

      fetchGeneralStatistics();
    } else if (viewMode === "individual") {
      async function fetchAllLearners() {
        try {
          const response = await httpClient.get(
            "/admin/statistics_get_all_learners"
          );

          setLearners(response.data);
          console.log(response.data);
        } catch (error) {
          console.error("Error fetching learners:", error);
        }
      }

      fetchAllLearners();
    }
  }, [viewMode]);

  //Update average values and all statistics records for a single learner when selectedUserID changes
  useEffect(() => {
    if (!selectedUserID) return;
    (async () => {
      try {
        const resp = await httpClient.get(
          "/admin/learner_lifetime_statistics",
          {
            params: {
              learner_id: selectedUserID,
            },
          }
        );
        console.log(resp);
        console.log(resp.data.total_stories_read);
        console.log(resp.data.average_word_error_rate);
        console.log(resp.data.average_pronounciation_score);
        console.log(resp.data.average_words_per_minute);

        // Update generalTableData with the new values from the API response
        setAverageLearnerData({
          totalStoriesRead: resp.data.total_stories_read,
          averageWordErrorRate: resp.data.average_word_error_rate,
          averagePronunciationScore: resp.data.average_pronounciation_score,
          averageWordsPerMinute: resp.data.average_words_per_minute,
        });
        setTableData(resp.data.all_statistic_records);
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
          } else {
            window.location.href = "/404";
          }
        } else {
          window.location.href = "/404";
        }
      }
    })();
  }, [selectedUserID]);

  // Filter learners based on search input
  const [searchTerm, setSearchTerm] = useState("");
  const filteredLearner = learners.filter((learner) =>
    learner.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedUser(""); // Reset selected user when switching modes
  };

  const renderStatistics = () => {
    if (viewMode === "general") {
      return (
        <>
          <p>
            <strong>Average Pronounciation Score:</strong>{" "}
            {generalStatistics.averagePronunciationScore}
          </p>
          <p>
            <strong>Average Words Per Minute:</strong>{" "}
            {generalStatistics.averageWPM}
          </p>
          <p>
            <strong>Average Word Error Rate:</strong>{" "}
            {generalStatistics.averageWordErrorRate}
          </p>
        </>
      );
    } else if (selectedUserID) {
      return (
        <>
          <p>
            <strong>Total Stories Read:</strong>{" "}
            {averageLearnerData.totalStoriesRead}
          </p>
          <p>
            <strong>Average Word Error Rate:</strong>{" "}
            {averageLearnerData.averageWordErrorRate}
          </p>
          <p>
            <strong>Average Pronunciation Score:</strong>{" "}
            {averageLearnerData.averagePronunciationScore}
          </p>
          <p>
            <strong>Average Words Per Minute:</strong>{" "}
            {averageLearnerData.averageWordsPerMinute}
          </p>
        </>
      );
    } else {
      return <p>Please select a user to view their statistics.</p>;
    }
  };

  const renderTableData = () => {
    if (selectedUserID) {
      return tableData.map((row, index) => (
        <tr
          key={index}
          style={{
            backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
          }}
        >
          <td style={{ padding: "12px", border: "1px solid #ddd" }}>
            {row.storyTitle}
          </td>
          <td style={{ padding: "12px", border: "1px solid #ddd" }}>
            {row.storyDifficulty}
          </td>
          <td style={{ padding: "12px", border: "1px solid #ddd" }}>
            {row.wordErrorRate}
          </td>
          <td style={{ padding: "12px", border: "1px solid #ddd" }}>
            {row.wordsPerMinute}
          </td>
          <td style={{ padding: "12px", border: "1px solid #ddd" }}>
            {row.pronunciationScore}
          </td>
          <td style={{ padding: "12px", border: "1px solid #ddd" }}>
            {row.dateTime}
          </td>
        </tr>
      ));
    }
    return null;
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f0f4f8",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: "#007bff",
            fontSize: "36px",
            fontWeight: "bold",
            textAlign: "center",
            flex: 1,
          }}
        >
          Automated Reading Tutor
        </h1>
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
          }}
          onClick={() => (window.location.href = "/admin-home")}
        >
          Home
        </button>
      </div>

      {/* View Mode Selection */}
      <div style={{ marginTop: "20px" }}>
        <label
          style={{ fontSize: "18px", color: "#007bff", marginRight: "16px" }}
        >
          View Mode:{" "}
        </label>
        <button
          style={{
            padding: "10px",
            marginLeft: "10px",
            marginRight: "10px",
            borderRadius: "5px",
            backgroundColor: viewMode === "general" ? "#007bff" : "#ccc",
            color: "#fff",
          }}
          onClick={() => handleViewModeChange("general")}
        >
          General Statistics
        </button>
        <button
          style={{
            padding: "10px",
            borderRadius: "5px",
            backgroundColor: viewMode === "individual" ? "#007bff" : "#ccc",
            color: "#fff",
          }}
          onClick={() => handleViewModeChange("individual")}
        >
          Individual Statistics
        </button>
      </div>

      {viewMode === "individual" && (
        <div style={{ marginTop: "20px" }}>
          <label style={{ fontSize: "18px", color: "#007bff" }}>
            Search User:{" "}
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search for a user"
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "5px",
              marginLeft: "10px",
              width: "200px",
            }}
          />
          {filteredLearner.length > 0 && (
            <ul
              style={{
                marginTop: "10px",
                maxHeight: "150px",
                overflowY: "auto",
                backgroundColor: "#fff",
                padding: "10px",
                borderRadius: "5px",
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              {filteredLearner.map((user) => (
                <li
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  style={{
                    padding: "5px",
                    cursor: "pointer",
                    color: user.id === selectedUserID ? "#ffffff" : "#007bff",
                    backgroundColor:
                      user.id === selectedUserID ? "#007bff" : "transparent",
                    marginLeft: "16px",
                    borderRadius: "5px",
                  }}
                >
                  {user.username}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Statistics */}
      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ color: "#007bff" }}>Statistics</h2>
        {renderStatistics()}
      </div>

      {/* Table Component */}
      <div
        style={{
          marginTop: "40px",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.1)",
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        <h2
          style={{
            color: "#007bff",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Performance History
        </h2>
        <table
          style={{ width: "100%", borderCollapse: "collapse", color: "#333" }}
        >
          <thead>
            <tr style={{ backgroundColor: "#007bff", color: "#ffffff" }}>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                Story Title
              </th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                Story Difficulty
              </th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                Number of Pronounciation Errors
              </th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                Words Per Minute Speed
              </th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                Pronunciation Score (%)
              </th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                Date and Time
              </th>
            </tr>
          </thead>
          <tbody>{renderTableData()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default StatisticsManagement;
