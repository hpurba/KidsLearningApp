import React, { useState, useEffect, useCallback, useRef } from "react";
import "./PhonicsGame.css";

// Letter to audio file mapping
const letterAudioMap = {
  A: "/audio/phonics/A.m4a",
  B: "/audio/phonics/B.m4a",
  C: "/audio/phonics/C.m4a",
  D: "/audio/phonics/D.m4a",
  E: "/audio/phonics/E.m4a",
  F: "/audio/phonics/F.m4a",
  G: "/audio/phonics/G.m4a",
  H: "/audio/phonics/H.m4a",
  I: "/audio/phonics/I.m4a",
  J: "/audio/phonics/J.m4a",
  K: "/audio/phonics/K.m4a",
  L: "/audio/phonics/L.m4a",
  M: "/audio/phonics/M.m4a",
  N: "/audio/phonics/N.m4a",
  O: "/audio/phonics/O.m4a",
  P: "/audio/phonics/P.m4a",
  Q: "/audio/phonics/Q.m4a",
  R: "/audio/phonics/R.m4a",
  S: "/audio/phonics/S.m4a",
  T: "/audio/phonics/T.m4a",
  U: "/audio/phonics/U.m4a",
  V: "/audio/phonics/V.m4a",
  W: "/audio/phonics/W.m4a",
  X: "/audio/phonics/X.m4a",
  Y: "/audio/phonics/Y.m4a",
  Z: "/audio/phonics/Z.m4a",
};

const PhonicsGame = ({ onExit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);

  // Function to play the letter audio with repeat after 1 second pause
  const playLetterAudio = useCallback((letter, shouldRepeat = true) => {
    const audioPath = letterAudioMap[letter];

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
          playLetterAudio(letter, true);
        }, 1000);
      };
    }

    audio.play().catch((error) => {
      console.warn(
        `Audio file not found for ${letter}, using text-to-speech fallback`,
      );
      // Fallback to text-to-speech if audio file doesn't exist
      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);

      // Repeat text-to-speech with 1 second pause
      if (shouldRepeat) {
        utterance.onend = () => {
          timeoutRef.current = setTimeout(() => {
            playLetterAudio(letter, true);
          }, 1000);
        };
      }
    });
  }, []);

  // Play letter audio when letter changes
  useEffect(() => {
    if (!isPlaying) return;

    const currentLetter = alphabet[currentLetterIndex];

    // Play immediately
    playLetterAudio(currentLetter, true);

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
  }, [currentLetterIndex, isPlaying, alphabet, playLetterAudio]);

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

        if (currentLetterIndex < alphabet.length - 1) {
          setCurrentLetterIndex((prev) => prev + 1);
        } else {
          // Game finished, show celebration
          setIsPlaying(false);
          setIsFinished(true);
        }
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();

        if (currentLetterIndex > 0) {
          setCurrentLetterIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, currentLetterIndex, alphabet.length, onExit]);

  const startGame = () => {
    setCurrentLetterIndex(0);
    setIsPlaying(true);
  };

  const currentLetter = alphabet[currentLetterIndex];

  if (isFinished) {
    return (
      <div className="phonics-celebration-screen">
        <div className="phonics-celebration-content">
          <h1 className="phonics-celebration-title">🎉 Amazing! 🎉</h1>
          <p className="phonics-celebration-message">
            You learned all the phonics sounds!
          </p>
          <div className="phonics-confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="phonics-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 1}s`,
                  backgroundColor: [
                    "#ff6b6b",
                    "#ffd93d",
                    "#ff9f43",
                    "#f8b500",
                    "#ff6348",
                    "#ff9ff3",
                  ][Math.floor(Math.random() * 6)],
                }}
              />
            ))}
          </div>
          <div className="phonics-stars-container">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="phonics-star"
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
      <div className="phonics-start-screen">
        <h2>🎵 Learn Phonics Sounds! 🎵</h2>
        <p>Press the button to start</p>
        <p className="phonics-instructions">
          Use the <span className="phonics-key-highlight">SPACEBAR</span> or{" "}
          <span className="phonics-key-highlight">ARROW KEYS</span> to navigate
        </p>
        <button className="phonics-start-button" onClick={startGame}>
          🎮 Start Learning!
        </button>
      </div>
    );
  }

  return (
    <div className="phonics-game">
      <div className="phonics-progress-bar">
        <div
          className="phonics-progress-fill"
          style={{
            width: `${((currentLetterIndex + 1) / alphabet.length) * 100}%`,
          }}
        />
      </div>

      <div className="phonics-letter-display">
        <div className="phonics-letter uppercase">{currentLetter}</div>
        <div className="phonics-letter lowercase">
          {currentLetter.toLowerCase()}
        </div>
      </div>

      <div className="phonics-game-info">
        <p className="phonics-letter-count">
          Letter {currentLetterIndex + 1} of {alphabet.length}
        </p>
        <p className="phonics-spacebar-hint">
          Press <span className="phonics-key-highlight">SPACEBAR</span> or{" "}
          <span className="phonics-key-highlight">ARROWS</span> to navigate
        </p>
      </div>
    </div>
  );
};

export default PhonicsGame;
