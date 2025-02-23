'use client';

import { useState } from 'react';

const generateLayouts = (): number[][] => {
  return [
    [...Array(6).keys()].flatMap((i) => [i + 1, i + 7]),
    [...Array(6).keys()].flatMap((i) => [6 - i, 12 - i]),
    [...Array(6).keys()].flatMap((i) => [i + 1, 12 - i]),
    [...Array(6).keys()].flatMap((i) => [6 - i, i + 7]),
  ];
};

export default function ElevatorGame() {
  const [started, setStarted] = useState(false);
  const [targetFloor, setTargetFloor] = useState<number | null>(null);
  const [layoutIndex, setLayoutIndex] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [usedFloors, setUsedFloors] = useState<number[]>([]);
  const layouts: number[][] = generateLayouts();

  const getRandomFloor = (): number | null => {
    const availableFloors = layouts[layoutIndex].filter(
      (floor) => !usedFloors.includes(floor)
    );
    return availableFloors.length === 0
      ? null
      : availableFloors[Math.floor(Math.random() * availableFloors.length)];
  };

  const handleStart = (): void => {
    if (layoutIndex >= layouts.length) {
      setGameFinished(true);
      setStarted(false);
      return;
    }
    const newFloor = getRandomFloor();
    if (newFloor !== null) {
      setTargetFloor(newFloor);
    }
  };

  const confirmStart = (): void => {
    if (targetFloor !== null) {
      setStarted(true);
      setUsedFloors((prev) => [...prev, targetFloor]);
    }
  };

  const handleFloorClick = (floor: number): void => {
    if (floor === targetFloor) {
      setStarted(false);

      if (layoutIndex < layouts.length - 1) {
        setTimeout(() => {
          setLayoutIndex((prev) => prev + 1);
          setUsedFloors([]);
          handleStart();
        }, 1000);
      } else {
        setTimeout(() => setGameFinished(true), 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {!started && !gameFinished ? (
        targetFloor === null ? (
          <button
            onClick={handleStart}
            className="px-16 py-8 text-6xl font-bold text-white bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-all"
          >
            Start
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <h2 className="mb-8 text-7xl font-semibold text-red-600">
              Floor {targetFloor}
            </h2>
            <button
              onClick={confirmStart}
              className="px-10 py-6 text-5xl font-bold text-white bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-all"
            >
              Start Game
            </button>
          </div>
        )
      ) : gameFinished ? (
        <div className="mt-4 text-4xl font-semibold text-gray-700 text-center">
          <h3 className="mb-6 text-5xl font-semibold text-red-600">Game Over</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-10 py-6 text-5xl font-bold text-white bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-all"
          >
            Restart
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {layouts[layoutIndex].map((floor) => (
              <button
                key={floor}
                onClick={() => handleFloorClick(floor)}
                className="w-40 h-40 flex items-center justify-center text-6xl font-bold text-white bg-gray-500 border-8 border-gray-300 rounded-full shadow-xl transition-all duration-200 hover:brightness-125 active:scale-90"
              >
                {floor}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
