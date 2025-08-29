import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import logo from "./assets/logo.png";

function App() {
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer
  useEffect(() => {
    if (questions.length > 0) {
      setTimeLeft(questions.length * 45);
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [questions]);

  // Format timer
  const formatTime = (secs) => {
    const hrs = String(Math.floor(secs / 3600)).padStart(2, "0");
    const mins = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const secsRemaining = String(secs % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secsRemaining}`;
  };

  // Fetch questions based on selected test
  useEffect(() => {
    if (!selectedTest) return;
    axios
      .get(`http://15.222.61.13:5000/api/${selectedTest}/questions`)
      .then((res) => {
        setQuestions(res.data);
        setAnswers({});
        setScore(null);
        setCurrentIndex(0);
      })
      .catch((err) => console.error(err));
  }, [selectedTest]);

  const handleAnswerChange = (qId, option) => {
    setAnswers({ ...answers, [qId]: option });
  };

  const handleSubmit = () => {
    axios
      .post(`http://15.222.61.13:5000/api/${selectedTest}/submit_exam`, { answers })
      .then((res) => setScore(res.data))
      .catch((err) => console.error(err));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // ------------------------
  // Test Selection Page
  // ------------------------
  if (!selectedTest) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", backgroundColor: "#FAFAFA", color: "#222" }}>
        <img src={logo} alt="Logo" style={{ height: "150px", marginBottom: "20px" }} />
        <h2>Select a Mock Test</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>
            <button
              className="button-primary"
              onClick={() => setSelectedTest("test1")}
            >
              NACC Mock Test 1
            </button>
          </li>
          <li>
            <button
              className="button-primary"
              style={{ marginTop: "20px" }}
              onClick={() => setSelectedTest("test2")}
            >
              NACC Mock Test 2
            </button>
          </li>
          <li>
            <button
              className="button-primary"
              style={{ marginTop: "20px" }}
              onClick={() => setSelectedTest("test3")}
            >
              NACC Mock Test 3
            </button>
          </li>
        </ul>

        <footer
          style={{
            marginTop: "40px",
            padding: "10px",
            textAlign: "center",
            borderTop: "1px solid #ccc",
            fontSize: "20px",
            color: "#555",
          }}
        >
          Developed by Sanjoy Kumar Das
        </footer>
      </div>
    );
  }

  // ------------------------
  // Exam Page
  // ------------------------
  if (questions.length === 0) return <p>Loading questions...</p>;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="App" style={{ margin: "0 auto", padding: "20px", backgroundColor: "#FAFAFA", color: "#222" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        {/* Left: Logo */}
        <div style={{ flex: 1, textAlign: "left" }}>
          <img src={logo} alt="Sanjoy Kumar Das Logo" style={{ height: "100px" }} />
        </div>

        {/* Center: Title */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: "28px" }}>
            {selectedTest === "test1"
              ? "NACC Mock Test 1"
              : selectedTest === "test2"
                ? "NACC Mock Test 2"
                : "NACC Mock Test 3"}
          </h2>
        </div>

        {/* Right: empty */}
        <div style={{ flex: 1, textAlign: "right" }}>
          <button
            className="button-primary"
            onClick={() => setSelectedTest(null)}
          >
            Back to Menu
          </button>
        </div>
      </div>

      {/* Dashboard */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        {questions.map((q, idx) => {
          const answered = answers[q.id];
          return (
            <div
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: "35px",
                height: "35px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor: answered ? "green" : "red",
                color: "white",
                fontWeight: "bold",
                borderRadius: "5px",
                textDecoration: answered ? "none" : "line-through",
                border: idx === currentIndex ? "4px solid #000" : "none",
              }}
            >
              {idx + 1}
            </div>
          );
        })}
      </div>

      {!score ? (
        <div style={{ textAlign: "justify", marginLeft: "100px", marginRight: "50px" }}>
          {/* Question Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "20px",
              marginBottom: "10px",
            }}
          >
            <strong>
              Question {currentIndex + 1} of {questions.length}
            </strong>
            <span>
              Time Left: <b style={{ fontSize: "28px" }}>{formatTime(timeLeft)}</b>
            </span>
          </div>

          {/* Question Text */}
          <p style={{ fontSize: "22px", marginBottom: "20px" }}>{currentQuestion.question}</p>

          {/* Options */}
          {currentQuestion.options.map((opt, idx) => {
            const optionLabel = String.fromCharCode(97 + idx);
            return (
              <label key={idx} style={{ display: "block", margin: "5px 0", fontSize: "22px" }}>
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={opt}
                  checked={answers[currentQuestion.id] === opt}
                  onChange={() => handleAnswerChange(currentQuestion.id, opt)}
                  style={{ transform: "scale(1.4)", marginRight: "10px", cursor: "pointer" }}
                />
                {`${optionLabel}) ${opt}`}
              </label>
            );
          })}

          {/* Navigation */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            {currentIndex > 0 && (
              <button onClick={handlePrevious} className="button-primary" style={{ marginRight: "20px" }}>
                Previous
              </button>
            )}
            {currentIndex < questions.length - 1 ? (
              <button onClick={handleNext} className="button-primary">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} className="button-primary" style={{ marginRight: "20px" }}>
                Submit Exam
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <h3 style={{ fontSize: "24px" }}>Your Results</h3>
          <p style={{ fontSize: "24px" }}>
            Score: {score.score} / {score.total_questions}
          </p>
          <button
            onClick={() => setSelectedTest(null)}
            className="button-primary"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          marginTop: "40px",
          padding: "10px",
          textAlign: "center",
          borderTop: "1px solid #ccc",
          fontSize: "20px",
          color: "#555",
        }}
      >
        Developed by Sanjoy Kumar Das
      </footer>
    </div>
  );
}

export default App;
