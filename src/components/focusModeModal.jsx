import React, { useState, useEffect } from "react";
import { Wind, Brain, Timer } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

const TimeInput = ({ onTimeSubmit }) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalMs = hours * 60 * 60 * 1000 + minutes * 60 * 1000;
    onTimeSubmit(totalMs);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="row g-3">
        <div className="col">
          <label className="form-label">Hours</label>
          <input
            type="number"
            className="form-control"
            min="0"
            max="8"
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="col">
          <label className="form-label">Minutes</label>
          <input
            type="number"
            className="form-control"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
      <button type="submit" className="btn btn-dark w-100 mt-3">
        Start Timer
      </button>
    </form>
  );
};

const formatTime = (ms) => {
  if (!ms) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const FocusModeModal = ({ isOpen, onClose, onStatusChange }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [error, setError] = useState(null);

  const questions = [
    {
      id: 1,
      question: "What's your current stress level?",
      options: ["Very Stressed", "Somewhat Stressed", "Neutral", "Relaxed"],
      icon: <Wind size={20} />,
    },
    {
      id: 2,
      question: "What type of work are you planning to do?",
      options: ["Deep Focus Work", "Creative Work", "Light Study", "Review"],
      icon: <Brain size={20} />,
    },
    {
      id: 3,
      question: "Choose focus duration or set custom time",
      options: ["25 mins", "45 mins", "60 mins", "Custom"],
      icon: <Timer size={20} />,
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAnswers({});
      setTimeLeft(null);
      setIsTimerActive(false);
      setShowCustomTime(false);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(timer);
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const startFocusMode = (duration) => {
    if (!duration || !answers[1] || !answers[2]) {
      setError("Please complete all steps before starting focus mode");
      return;
    }

    setTimeLeft(duration);
    setIsTimerActive(true);
    setStep(4);
    setError(null);
  };

  const handleTimeSelection = (option) => {
    if (option === "Custom") {
      setShowCustomTime(true);
      return;
    }

    setAnswers((prev) => ({ ...prev, [step]: option }));
    const minutes = parseInt(option.split(" ")[0], 10);
    const duration = minutes * 60 * 1000;
    startFocusMode(duration);
  };

  const handleOptionClick = (option) => {
    if (step === questions.length) {
      handleTimeSelection(option);
    } else {
      setAnswers((prev) => ({ ...prev, [step]: option }));
      setStep((prev) => prev + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Focus Mode Setup</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            {step <= questions.length && !showCustomTime && (
              <>
                <div className="d-flex align-items-center gap-2">
                  {questions[step - 1].icon}
                  <p className="fw-medium">{questions[step - 1].question}</p>
                </div>

                <div className="row g-2 mt-2">
                  {questions[step - 1].options.map((option) => (
                    <div className="col-6" key={option}>
                      <button
                        className={`btn btn-outline-secondary w-100 ${
                          answers[step] === option ? "active" : ""
                        }`}
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-center mt-3">
                  {questions.map((_, index) => (
                    <div
                      key={index}
                      className={`progress-bar bg-dark mx-1 rounded ${
                        index + 1 === step ? "w-25" : "w-10"
                      }`}
                      style={{ height: "5px" }}
                    />
                  ))}
                </div>
              </>
            )}

            {showCustomTime && <TimeInput onTimeSubmit={startFocusMode} />}

            {step > questions.length && isTimerActive && (
              <div>
                <div className="text-center fs-2 fw-bold my-3">
                  {formatTime(timeLeft)}
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${(timeLeft / (25 * 60 * 1000)) * 100}%` }}
                  />
                </div>
                <button className="btn btn-danger w-100 mt-3" onClick={onClose}>
                  End Session Early
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusModeModal;
