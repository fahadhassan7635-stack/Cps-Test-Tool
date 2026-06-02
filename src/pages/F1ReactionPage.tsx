import React, { useState, useEffect, useRef } from "react";

type GameState = "idle" | "countdown" | "waiting" | "go" | "result" | "foul";

const F1ReactionPage: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [lightsLit, setLightsLit] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("Click anywhere or press Space to Start");

  const startTimeRef = useRef<number>(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const randomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard support (Spacebar to interact)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleInteraction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearAllTimers();
    };
  }, [gameState, lightsLit]);

  const clearAllTimers = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (randomTimeoutRef.current) clearTimeout(randomTimeoutRef.current);
  };

  const startTest = () => {
    clearAllTimers();
    setGameState("countdown");
    setLightsLit(0);
    setReactionTime(null);
    setMessage("Lights are coming on...");

    let currentLight = 0;
    // 5ti light 1 second por por jwlbw
    countdownIntervalRef.current = setInterval(() => {
      currentLight += 1;
      setLightsLit(currentLight);

      if (currentLight === 5) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setGameState("waiting");
        setMessage("Wait for lights out!");

        // 5ti light jwlar por 1 theke 5 second er moddhe random shomoye nifbe
        const randomDelay = Math.floor(Math.random() * 4000) + 1000; // 1s to 5s
        randomTimeoutRef.current = setTimeout(() => {
          setGameState("go");
          setMessage("LIGHTS OUT! CLICK NOW!");
          startTimeRef.current = performance.now();
        }, randomDelay);
      }
    }, 1000);
  };

  const handleInteraction = () => {
    if (gameState === "idle" || gameState === "result" || gameState === "foul") {
      startTest();
    } else if (gameState === "countdown" || gameState === "waiting") {
      // Light nevhar age click korle Foul / False Start
      clearAllTimers();
      setGameState("foul");
      setMessage("FALSE START! You jumped the lights. 🚦");
    } else if (gameState === "go") {
      // Perfect click er por reaction time ber kora
      const endTime = performance.now();
      const timeTaken = Math.round(endTime - startTimeRef.current);
      setReactionTime(timeTaken);
      setGameState("result");
      setMessage(`Your Reaction Time: ${timeTaken} ms`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 mb-2">
          🏎️ F1 Reaction Time Test
        </h1>
        <p className="text-gray-400 mb-8">
          Test your reflexes like a Formula 1 driver. Wait for the five red lights to turn on, and click the instant they go out!
        </p>

        {/* F1 Lights Box */}
        <div 
          onClick={handleInteraction}
          className={`w-full bg-[#131a26] border-2 border-gray-800 rounded-2xl p-10 mb-6 cursor-pointer select-none transition-colors duration-200 ${
            gameState === "go" ? "bg-emerald-950/20 border-emerald-500" : ""
          } ${gameState === "foul" ? "bg-red-950/20 border-red-500" : ""}`}
        >
          {/* 5 F1 Lights Row */}
          <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 mb-10">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="flex flex-col gap-1 items-center bg-black/40 p-2 rounded-xl border border-gray-800">
                {/* Red Lights */}
                <div className="grid grid-cols-2 gap-1">
                  <div className={`w-4 h-4 rounded-full transition-all duration-100 ${lightsLit >= index && gameState !== "go" ? "bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.8)]" : "bg-gray-900"}`}></div>
                  <div className={`w-4 h-4 rounded-full transition-all duration-100 ${lightsLit >= index && gameState !== "go" ? "bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.8)]" : "bg-gray-900"}`}></div>
                  <div className={`w-4 h-4 rounded-full transition-all duration-100 ${lightsLit >= index && gameState !== "go" ? "bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.8)]" : "bg-gray-900"}`}></div>
                  <div className={`w-4 h-4 rounded-full transition-all duration-100 ${lightsLit >= index && gameState !== "go" ? "bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.8)]" : "bg-gray-900"}`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Screen Content / Status Message */}
          <div className="py-6">
            {gameState === "result" && reactionTime !== null ? (
              <div className="animate-bounce">
                <span className="text-5xl font-black text-emerald-400">{reactionTime} ms</span>
                <p className="text-sm text-gray-400 mt-2">
                  {reactionTime < 200 ? "⚡ Elite Reflexes! F1 Driver Level." : reactionTime < 300 ? "👍 Good job! Very fast." : "🐢 A bit slow, try again!"}
                </p>
              </div>
            ) : (
              <p className={`text-xl font-bold ${gameState === "go" ? "text-emerald-400 animate-pulse text-2xl" : gameState === "foul" ? "text-red-500" : "text-gray-300"}`}>
                {message}
              </p>
            )}
          </div>

          {/* Subtext info */}
          <p className="text-xs text-gray-500 mt-4">
            {gameState === "countdown" || gameState === "waiting" ? "DON'T CLICK YET!" : "Click anywhere inside this area to interact"}
          </p>
        </div>

        {/* Action Button */}
        {(gameState === "idle" || gameState === "result" || gameState === "foul") && (
          <button
            onClick={startTest}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-900/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {gameState === "idle" ? "Start Test" : "Try Again"}
          </button>
        )}
      </div>
    </div>
  );
};

export default F1ReactionPage;