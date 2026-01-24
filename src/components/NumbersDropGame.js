import React, { useState, useEffect, useCallback, useRef } from "react";
import "./NumbersDropGame.css";

// Number to audio file mapping (same as NumbersGame)
const numberAudioMap = {
  //   0: "/audio/numbers/0.m4a",
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

const colors = [
  //   "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B739",
  "#52B788",
  "#FF99CC",
  "#99CCFF",
  "#FFCC99",
  "#CC99FF",
  "#99FFCC",
  "#FFB3BA",
  "#BAFFC9",
  "#BAE1FF",
  "#FFFFBA",
  "#FFD8F1",
];

const NumbersDropGame = ({ onExit }) => {
  const [blocks, setBlocks] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const gameContainerRef = useRef(null);
  const spaceKeyHeldRef = useRef(false);

  // Physics constants
  const GRAVITY = 0.5;
  const DAMPING = 0.8;
  const BLOCK_WIDTH = 80;
  const BLOCK_HEIGHT = 80;
  const GROUND_Y = 550;

  // Function to play the number audio
  const playNumberAudio = useCallback((number) => {
    const audioPath = numberAudioMap[number];

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(audioPath);
    audioRef.current = audio;

    // Add 0.5 second delay before playing
    setTimeout(() => {
      audio.play().catch((error) => {
        console.warn(
          `Audio file not found for ${number}, using text-to-speech fallback`,
        );
        const utterance = new SpeechSynthesisUtterance(number.toString());
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      });
    }, 500);
  }, []);

  // Drop a new block
  const dropBlock = useCallback(() => {
    if (currentNumber > 20) {
      setIsFinished(true);
      return;
    }

    const containerWidth = gameContainerRef.current?.offsetWidth || 600;
    const randomX = Math.random() * (containerWidth - BLOCK_WIDTH);

    const newBlock = {
      id: currentNumber,
      number: currentNumber,
      x: randomX,
      y: -BLOCK_HEIGHT,
      velocityX: (Math.random() - 0.5) * 2,
      velocityY: 0,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 5,
      color: colors[currentNumber % colors.length],
      settled: false,
    };

    setBlocks((prev) => [...prev, newBlock]);
    playNumberAudio(currentNumber);
    setCurrentNumber((prev) => prev + 1);
  }, [currentNumber, playNumberAudio]);

  const handleAdvanceClick = useCallback(() => {
    if (isFinished) return;
    dropBlock();
  }, [dropBlock, isFinished]);

  // Check collision between two blocks
  const checkCollision = (block1, block2) => {
    const dx = block1.x - block2.x;
    const dy = block1.y - block2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < BLOCK_WIDTH;
  };

  // Physics update loop
  useEffect(() => {
    if (blocks.length === 0) return;

    const updatePhysics = () => {
      setBlocks((prevBlocks) => {
        const updatedBlocks = prevBlocks.map((block) => {
          if (block.settled) return block;

          let newBlock = { ...block };

          // Apply gravity
          newBlock.velocityY += GRAVITY;

          // Apply velocity
          newBlock.x += newBlock.velocityX;
          newBlock.y += newBlock.velocityY;
          newBlock.rotation += newBlock.rotationSpeed;

          // Wall collision
          const containerWidth = gameContainerRef.current?.offsetWidth || 600;
          if (newBlock.x <= 0) {
            newBlock.x = 0;
            newBlock.velocityX = Math.abs(newBlock.velocityX) * DAMPING;
          } else if (newBlock.x >= containerWidth - BLOCK_WIDTH) {
            newBlock.x = containerWidth - BLOCK_WIDTH;
            newBlock.velocityX = -Math.abs(newBlock.velocityX) * DAMPING;
          }

          // Ground collision
          if (newBlock.y >= GROUND_Y - BLOCK_HEIGHT) {
            newBlock.y = GROUND_Y - BLOCK_HEIGHT;
            newBlock.velocityY = -newBlock.velocityY * DAMPING;
            newBlock.velocityX *= DAMPING;
            newBlock.rotationSpeed *= DAMPING;

            // Mark as settled if almost stopped
            if (
              Math.abs(newBlock.velocityY) < 0.5 &&
              Math.abs(newBlock.velocityX) < 0.5
            ) {
              newBlock.velocityY = 0;
              newBlock.velocityX = 0;
              newBlock.rotationSpeed = 0;
              newBlock.settled = true;
            }
          }

          // Check collision with other blocks
          prevBlocks.forEach((otherBlock) => {
            if (
              otherBlock.id !== block.id &&
              checkCollision(newBlock, otherBlock)
            ) {
              const dx = newBlock.x - otherBlock.x;
              const dy = newBlock.y - otherBlock.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance > 0) {
                const overlap = BLOCK_WIDTH - distance;
                const nx = dx / distance;
                const ny = dy / distance;

                newBlock.x += nx * overlap * 0.5;
                newBlock.y += ny * overlap * 0.5;

                const relativeVelocityX =
                  newBlock.velocityX - (otherBlock.velocityX || 0);
                const relativeVelocityY =
                  newBlock.velocityY - (otherBlock.velocityY || 0);
                const speed = relativeVelocityX * nx + relativeVelocityY * ny;

                if (speed < 0) {
                  newBlock.velocityX -= speed * nx * DAMPING;
                  newBlock.velocityY -= speed * ny * DAMPING;
                }
              }
            }
          });

          return newBlock;
        });

        return updatedBlocks;
      });

      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    updatePhysics();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [blocks.length]);

  // Spacebar handler to drop blocks
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === "Space" && !isFinished && !spaceKeyHeldRef.current) {
        event.preventDefault();
        spaceKeyHeldRef.current = true;
        dropBlock();
      }
    };

    const handleKeyUp = (event) => {
      if (event.code === "Space") {
        spaceKeyHeldRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [dropBlock, isFinished]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      window.speechSynthesis.cancel();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="numbers-drop-game">
      {/* <div className="game-header">
        <h2>🔢 Numbers Drop Game 🎲</h2>
        <p>Press SPACEBAR to drop numbers!</p>
      </div> */}

      {/* <div className="game-controls">
        <button className="control-button exit-button" onClick={onExit}>
          🏠 Home
        </button>
      </div> */}

      <div className="game-status">
        <div className="status-item">
          <span className="status-label">Count:</span>
          <span className="status-value">{blocks.length}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Next:</span>
          <span className="status-value">
            {currentNumber <= 20 ? currentNumber : "Done!"}
          </span>
        </div>
      </div>

      {isFinished && (
        <div className="completion-message">
          <h3>🎉 Great Job! 🎉</h3>
          <p>You've dropped all numbers from 0 to 20!</p>
        </div>
      )}

      <div
        className="game-container"
        ref={gameContainerRef}
        onClick={handleAdvanceClick}
        role="button"
        tabIndex={0}
        aria-label="Drop next number"
      >
        <div className="background-number">
          {currentNumber <= 20 ? currentNumber - 1 : 20}
        </div>
        {blocks.map((block) => (
          <div
            key={block.id}
            className="falling-block"
            style={{
              left: `${block.x}px`,
              top: `${block.y}px`,
              backgroundColor: block.color,
              transform: `rotate(${block.rotation}deg)`,
              width: `${BLOCK_WIDTH}px`,
              height: `${BLOCK_HEIGHT}px`,
            }}
          >
            <span className="block-number">{block.number}</span>
          </div>
        ))}
        <div className="ground"></div>
      </div>
    </div>
  );
};

export default NumbersDropGame;
