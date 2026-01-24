import React, { useState, useEffect, useCallback, useRef } from "react";
import "./AlphabetsGame.css";

// Letter to audio file mapping
const letterAudioMap = {
  A: "/audio/letters/A.m4a",
  B: "/audio/letters/B.m4a",
  C: "/audio/letters/C.m4a",
  D: "/audio/letters/D.m4a",
  E: "/audio/letters/E.m4a",
  F: "/audio/letters/F.m4a",
  G: "/audio/letters/G.m4a",
  H: "/audio/letters/H.m4a",
  I: "/audio/letters/I.m4a",
  J: "/audio/letters/J.m4a",
  K: "/audio/letters/K.m4a",
  L: "/audio/letters/L.m4a",
  M: "/audio/letters/M.m4a",
  N: "/audio/letters/N.m4a",
  O: "/audio/letters/O.m4a",
  P: "/audio/letters/P.m4a",
  Q: "/audio/letters/Q.m4a",
  R: "/audio/letters/R.m4a",
  S: "/audio/letters/S.m4a",
  T: "/audio/letters/T.m4a",
  U: "/audio/letters/U.m4a",
  V: "/audio/letters/V.m4a",
  W: "/audio/letters/W.m4a",
  X: "/audio/letters/X.m4a",
  Y: "/audio/letters/Y.m4a",
  Z: "/audio/letters/Z.m4a",
};

const AlphabetsGame = ({ onExit }) => {
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

    // Add 0.5 second delay before playing
    setTimeout(() => {
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

      setTimeout(() => {
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
      });

      return () => {
        celebrationAudio.pause();
        celebrationAudio.currentTime = 0;
        celebrationAudio.onended = null;
      };
    }
  }, [isFinished, onExit]);

  const advanceLetter = useCallback(() => {
    if (currentLetterIndex < alphabet.length - 1) {
      setCurrentLetterIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
      setIsFinished(true);
    }
  }, [currentLetterIndex, alphabet.length]);

  // Handle spacebar and arrow key presses
  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyPress = (event) => {
      // Prevent repeat events when key is held down
      if (event.repeat) return;

      if (event.code === "Space" || event.code === "ArrowRight") {
        event.preventDefault();
        advanceLetter();
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();

        if (currentLetterIndex > 0) {
          setCurrentLetterIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, currentLetterIndex, alphabet.length, onExit, advanceLetter]);

  const startGame = () => {
    setCurrentLetterIndex(0);
    setIsPlaying(true);
  };

  const currentLetter = alphabet[currentLetterIndex];

  if (isFinished) {
    return (
      <div className="celebration-screen">
        <div className="celebration-content">
          <h1 className="celebration-title">🎉 Amazing! 🎉</h1>
          <p className="celebration-message">You learned all the letters!</p>
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 1}s`,
                  backgroundColor: [
                    "#ff6b6b",
                    "#4ecdc4",
                    "#45b7d1",
                    "#f093fb",
                    "#ffd93d",
                    "#6bcf7f",
                  ][Math.floor(Math.random() * 6)],
                }}
              />
            ))}
          </div>
          <div className="stars-container">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="star"
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
      <div className="alphabet-start-screen">
        <h2>🔤 Learn Your ABCs! 🔤</h2>
        <p>Press the button to start</p>
        <p className="instructions">
          Use the <span className="key-highlight">SPACEBAR</span> or tap the
          letter card to move to the next letter
        </p>
        <button className="start-button" onClick={startGame}>
          🎮 Start Learning!
        </button>
      </div>
    );
  }

  return (
    <div className="alphabet-game">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${((currentLetterIndex + 1) / alphabet.length) * 100}%`,
          }}
        />
      </div>

      <div
        className="letter-display"
        onClick={advanceLetter}
        role="button"
        tabIndex={0}
        aria-label="Next letter"
      >
        <div className="letter uppercase">{currentLetter}</div>
        <div className="letter lowercase">{currentLetter.toLowerCase()}</div>
      </div>

      <div className="game-info">
        <p className="letter-count">
          Letter {currentLetterIndex + 1} of {alphabet.length}
        </p>
        <p className="spacebar-hint">
          Press <span className="key-highlight">SPACEBAR</span> or tap the
          letter card for next letter
        </p>
      </div>
    </div>
  );
};

export default AlphabetsGame;
