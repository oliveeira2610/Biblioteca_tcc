import React, { useEffect, useRef, useState } from "react";
import jumpSoundFile from "./jump.mp3";
import gameOverSoundFile from "./gameover.mp3";

export default function DinoGame() {
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const dinoRef = useRef(null);
  const cactusRef = useRef(null);
  const gameRef = useRef(null);
  const [speed, setSpeed] = useState(2);

  let isGameOver = false;

  const jumpSound = new Audio(jumpSoundFile);
  const gameOverSound = new Audio(gameOverSoundFile);

  useEffect(() => {
    document.addEventListener("keydown", jump);
    
    const moveCactus = setInterval(() => {
      if (cactusRef.current && dinoRef.current) {
        let cactusLeft = parseInt(
          window.getComputedStyle(cactusRef.current).getPropertyValue("left")
        );
        let dinoTop = parseInt(
          window.getComputedStyle(dinoRef.current).getPropertyValue("top")
        );

        if (cactusLeft < 50 && cactusLeft > 0 && dinoTop >= 140) {
          gameOverSound.play();
          setGameOver(true);
          isGameOver = true;
          cactusRef.current.style.animation = "none";
          clearInterval(moveCactus);
        }
      }
    }, 50);

    const scoreInterval = setInterval(() => {
      if (!isGameOver) {
        setScore((prev) => prev + 1);
        if (score % 10 === 0) {
          setSpeed((prev) => prev * 0.95);
        }
      }
    }, 200);

    return () => {
      document.removeEventListener("keydown", jump);
      clearInterval(moveCactus);
      clearInterval(scoreInterval);
    };
  }, [score]);

  function jump() {
    if (!isJumping && dinoRef.current && !gameOver) {
      setIsJumping(true);
      dinoRef.current.style.animation = "jump 0.5s linear";
      jumpSound.play();
      setTimeout(() => {
        setIsJumping(false);
        dinoRef.current.style.animation = "";
      }, 500);
    }
  }

  return (
    <div ref={gameRef} className="game-container">
      <h2>Jogo do Dinossauro 🦖</h2>
      <h3>Pontuação: {score}</h3>
      {gameOver && <h3>GAME OVER! Pressione F5 para reiniciar</h3>}
      <div className="game">
        <div ref={dinoRef} className="dino"></div>
        <div ref={cactusRef} className="cactus" style={{ animationDuration: `${speed}s` }}></div>
      </div>

      <style>
        {`
          .game-container {
            text-align: center;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          }

          .game {
            position: relative;
            width: 600px;
            height: 200px;
            border: 2px solid black;
            background-color: white;
            overflow: hidden;
            margin: auto;
          }

          .dino {
            width: 50px;
            height: 50px;
            background-image: url('https://png.pngtree.com/png-clipart/20241221/original/pngtree-dinosaur-cartoon-png-image_18120311.png');
            background-size: cover;
            position: absolute;
            bottom: 0;
            left: 20px;
          }

          .cactus {
            width: 25px;
            height: 50px;
            background-image: url('https://www.pngarts.com/files/3/Saguaro-Cactus-Free-PNG-Image.png');
            background-size: cover;
            position: absolute;
            bottom: 0;
            right: 0;
            animation: moveCactus ${speed}s linear infinite;
          }

          @keyframes jump {
            0% { bottom: 0; }
            50% { bottom: 80px; }
            100% { bottom: 0; }
          }

          @keyframes moveCactus {
            0% { right: -20px; }
            100% { right: 100%; }
          }
        `}
      </style>
    </div>
  );
}
