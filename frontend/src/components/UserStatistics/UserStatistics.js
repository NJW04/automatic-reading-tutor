import React, { useState, useEffect } from "react";
import httpClient from "../../httpClient";

const UserStatistics = () => {
  // State to store the user's name
  const [username, setUsername] = useState("");

  // State to store the total number of stories read by the user
  const [totalStoriesRead, setTotalStoriesRead] = useState(0);

  // State to store the user's average word error rate
  const [averageErrorRate, setAverageErrorRate] = useState(0);

  // State to store the user's average pronunciation score
  const [averagePronounciationScore, setAveragePronounciationScore] =
    useState(0);

  // State to store the user's average words per minute reading speed
  const [averageWPM, setAverageWPM] = useState(0);

  // State to store all individual statistic records for the user
  const [tableData, setTableData] = useState([]);

  /**
   * useEffect to fetch lifetime statistics for the user when the component mounts.
   * Sends a request to the backend to get the user's statistics and updates the state.
   */
  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get("learner/get_lifetime_statistics");
        console.log(resp);
        setUsername(resp.data.username);
        setTotalStoriesRead(resp.data.total_stories_read);
        setAverageErrorRate(resp.data.average_word_error_rate);
        setAveragePronounciationScore(resp.data.average_pronounciation_score);
        setAverageWPM(resp.data.average_words_per_minute);
        setTableData(resp.data.all_statistic_records);
        console.log(tableData);
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            setUsername(error.respone.data.username);
          } else {
            window.location.href = "/404";
          }
        } else {
          window.location.href = "/404";
        }
      }
    })();
  }, []);

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
          onClick={() => (window.location.href = "/home")}
        >
          Home
        </button>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", marginTop: "40px" }}>
        {/* User Info */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ margin: 0, color: "#007bff" }}>Hello, {username}</h2>
        </div>

        {/* Statistics */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            marginLeft: "20px",
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ color: "#007bff" }}>Statistics</h2>
          <p>
            <strong>Total Stories Read:</strong> {totalStoriesRead}
          </p>
          <p>
            <strong>Average Word Error Rate:</strong> {averageErrorRate}
          </p>
          <p>
            <strong>Average Pronounciation Score:</strong>{" "}
            {averagePronounciationScore}%
          </p>
          <p>
            <strong>Average Word Per Minute Speed:</strong> {averageWPM}
          </p>
        </div>
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
          <tbody>
            {tableData &&
              tableData.map((row, index) => (
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
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserStatistics;
