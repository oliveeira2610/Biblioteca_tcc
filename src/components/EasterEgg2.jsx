import React, { useState, useEffect, useRef } from "react";
import "../../src/styles/flapBird.css";
import jumpSoundFile from "./jump.mp3";
import gameOverSoundFile from "./gameover.mp3";

const FlappyBird = () => {
    const canvasRef = useRef(null);
    const [birdY, setBirdY] = useState(150);
    const [birdVelocity, setBirdVelocity] = useState(0);
    const [pipes, setPipes] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const gravity = 0.6;
    const jumpStrength = -10;
    const pipeWidth = 50;
    const pipeGap = 140;
    const birdSize = 20;
    const gameWidth = 400;
    const gameHeight = 500;
    const birdX = 50;

    // Carregar sons
  const jumpSound = new Audio(jumpSoundFile);
  const gameOverSound = new Audio(gameOverSoundFile);

    useEffect(() => {
        if (gameOver) return;

        const update = () => {
            setBirdVelocity((v) => v + gravity);
            setBirdY((y) => y + birdVelocity);

            setPipes((prevPipes) => {
                let newPipes = prevPipes.map((pipe) => ({
                    ...pipe,
                    x: pipe.x - 3
                })).filter(pipe => pipe.x + pipeWidth > 0);

                if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < gameWidth - 200) {
                    const topHeight = Math.random() * (gameHeight - pipeGap - 100) + 50;
                    newPipes.push({ x: gameWidth, topHeight, passed: false });
                }

                return newPipes;
            });

            checkCollision();
            updateScore();
        };

        const checkCollision = () => {
            pipes.forEach((pipe) => {
                const birdHitsPipe =
                    birdY < pipe.topHeight || 
                    birdY + birdSize > pipe.topHeight + pipeGap;

                const birdHitsSide = birdY <= 0 || birdY + birdSize >= gameHeight;

                if ((birdX + birdSize > pipe.x && birdX < pipe.x + pipeWidth && birdHitsPipe) || birdHitsSide) {
                    gameOverSound.play(); // 🔊 Som de game over
                    setGameOver(true);
                }
            });
        };

        const updateScore = () => {
            setPipes((prevPipes) =>
                prevPipes.map((pipe) => {
                    if (!pipe.passed && pipe.x + pipeWidth < birdX) {
                        setScore((prevScore) => prevScore + 1);
                        return { ...pipe, passed: true };
                    }
                    return pipe;
                })
            );
        };

        const gameLoop = setInterval(update, 30);
        return () => clearInterval(gameLoop);
    }, [birdY, birdVelocity, pipes, gameOver]);

    const handleJump = () => {
        if (!gameOver) {
            jumpSound.play(); // 🔊 Som de pulo
            setBirdVelocity(jumpStrength);
        } else {
            restartGame();
        }
    };

    const restartGame = () => {
        setBirdY(150);
        setBirdVelocity(0);
        setPipes([]);
        setScore(0);
        setGameOver(false);
    };

    useEffect(() => {
        window.addEventListener("keydown", handleJump);
        return () => window.removeEventListener("keydown", handleJump);
    }, [gameOver]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const drawGame = () => {
            ctx.clearRect(0, 0, gameWidth, gameHeight);

            // Desenha o pássaro
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(birdX + birdSize / 2, birdY + birdSize / 2, birdSize / 2, 0, Math.PI * 2);
            ctx.fill();

            // Desenha os canos
            ctx.fillStyle = "green";
            pipes.forEach(pipe => {
                ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
                ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, gameHeight - pipe.topHeight - pipeGap);
            });
        };

        drawGame();
    }, [birdY, pipes]);

    return (
        <div className="game-container">
            <h2>Flappy Bird Clone</h2>
            <p className="score">Score: {score}</p>
            <canvas ref={canvasRef} width={gameWidth} height={gameHeight} className="game-canvas" />
            {gameOver && <div className="game-over">Game Over!</div>}
        </div>
    );
};

export default FlappyBird;
