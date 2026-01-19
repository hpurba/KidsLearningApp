import React, { useState, useEffect, useCallback, useRef } from "react";
import "./NumbersGame.css";

// Number to audio file mapping
const numberAudioMap = {
  0: "/audio/numbers/0.m4a",
  1: "/audio/numbers/1.m4a",
  2: "/audio/numbers/2.m4a",
  3: "/audio/numbers/3.m4a",
  4: "/audio/numbers/4.m4a",
  5: "/audio/numbers/5.m4a",
  6: "/audio/numbers/6.m4a",
  7: "/audio/numbers/7.m4a",
  8: "/audio/numbers/8.m4a",
  9: "/audio/numbers/9.m4a",
  10: "/audio/numbers/10.m4a",
  11: "/audio/numbers/11.m4a",
  12: "/audio/numbers/12.m4a",
  13: "/audio/numbers/13.m4a",
  14: "/audio/numbers/14.m4a",
  15: "/audio/numbers/15.m4a",
  16: "/audio/numbers/16.m4a",
  17: "/audio/numbers/17.m4a",
  18: "/audio/numbers/18.m4a",
  19: "/audio/numbers/19.m4a",
  20: "/audio/numbers/20.m4a",
};

const NumbersGame = ({ onExit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const numbers = Array.from({ length: 21 }, (_, i) => i); // 0 to 20
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);

  // Function to play the number audio with repeat after 1 second pause
  const playNumberAudio = useCallback((number, shouldRepeat = true) => {
    const audioPath = numberAudioMap[number];

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Try to play custom audio, fallback to text-to-speech if file doesn't exist
    const audio = new Audio(audioPath);
    audioRef.current = audio;

    // Set up repeat with 1 second pause after audio ends
    if (shouldRepeat) {
      audio.onended = () => {
        timeoutRef.current = setTimeout(() => {
          playNumberAudio(number, true);
        }, 1000);
      };
    }

    audio.play().catch((error) => {
      console.warn(
        `Audio file not found for ${number}, using text-to-speech fallback`,
      );
      // Fallback to text-to-speech if audio file doesn't exist
      const utterance = new SpeechSynthesisUtterance(number.toString());
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);

      // Repeat text-to-speech with 1 second pause
      if (shouldRepeat) {
        utterance.onend = () => {
          timeoutRef.current = setTimeout(() => {
            playNumberAudio(number, true);
          }, 1000);
        };
      }
    });
  }, []);

  // Play number audio when number changes
  useEffect(() => {
    if (!isPlaying) return;

    const currentNumber = numbers[currentNumberIndex];

    // Play immediately
    playNumberAudio(currentNumber, true);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.onended = null;
      }
      window.speechSynthesis.cancel();
    };
  }, [currentNumberIndex, isPlaying, numbers, playNumberAudio]);

  // Play celebration audio when game finishes
  useEffect(() => {
    if (isFinished) {
      const celebrationAudio = new Audio("/audio/Amazing.m4a");

      // Exit to home screen after audio completes
      celebrationAudio.onended = () => {
        setIsFinished(false);
        onExit();
      };

      celebrationAudio.play().catch((error) => {
        console.warn(
          "Could not play celebration audio, exiting after 3 seconds:",
          error,
        );
        // Fallback: exit after 3 seconds if audio fails
        setTimeout(() => {
          setIsFinished(false);
          onExit();
        }, 3000);
      });

      return () => {
        celebrationAudio.pause();
        celebrationAudio.currentTime = 0;
        celebrationAudio.onended = null;
      };
    }
  }, [isFinished, onExit]);

  // Handle spacebar and arrow key presses
  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyPress = (event) => {
      // Prevent repeat events when key is held down
      if (event.repeat) return;

      if (event.code === "Space" || event.code === "ArrowRight") {
        event.preventDefault();

        if (currentNumberIndex < numbers.length - 1) {
          setCurrentNumberIndex((prev) => prev + 1);
        } else {
          // Game finished, show celebration
          setIsPlaying(false);
          setIsFinished(true);
        }
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();

        if (currentNumberIndex > 0) {
          setCurrentNumberIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, currentNumberIndex, numbers.length, onExit]);

  const startGame = () => {
    setCurrentNumberIndex(0);
    setIsPlaying(true);
  };

  const currentNumber = numbers[currentNumberIndex];

  if (isFinished) {
    return (
      <div className="numbers-celebration-screen">
        <div className="numbers-celebration-content">
          <h1 className="numbers-celebration-title">🎉 Amazing! 🎉</h1>
          <p className="numbers-celebration-message">
            You learned all the numbers!
          </p>
          <div className="numbers-confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="numbers-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 1}s`,
                  backgroundColor: [
                    "#ff6b6b",
                    "#4ecdc4",
                    "#45b7d1",
                    "#ffd93d",
                    "#6bcf7f",
                    "#ff9ff3",
                  ][Math.floor(Math.random() * 6)],
                }}
              />
            ))}
          </div>
          <div className="numbers-stars-container">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="numbers-star"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                ⭐
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div className="numbers-start-screen">
        <h2>🔢 Learn Your Numbers! 🔢</h2>
        <p>Press the button to start</p>
        <p className="numbers-instructions">
          Use the <span className="numbers-key-highlight">SPACEBAR</span> or{" "}
          <span className="numbers-key-highlight">ARROW KEYS</span> to navigate
        </p>
        <button className="numbers-start-button" onClick={startGame}>
          🎮 Start Learning!
        </button>
      </div>
    );
  }

  return (
    <div className="numbers-game">
      <div className="numbers-progress-bar">
        <div
          className="numbers-progress-fill"
          style={{
            width: `${((currentNumberIndex + 1) / numbers.length) * 100}%`,
          }}
        />
      </div>

      <div className="numbers-display">
        <div className="number-large">{currentNumber}</div>
      </div>

      <div className="numbers-game-info">
        <p className="numbers-count">
          Number {currentNumberIndex} of {numbers.length}
        </p>
        <p className="numbers-hint">
          Press <span className="numbers-key-highlight">SPACEBAR</span> or{" "}
          <span className="numbers-key-highlight">ARROWS</span> to navigate
        </p>
      </div>
    </div>
  );
};

export default NumbersGame;
