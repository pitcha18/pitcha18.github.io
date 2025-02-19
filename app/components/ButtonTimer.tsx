'use client';

import { useState } from 'react';

const generateLayouts = () => {
  const floors = Array.from({ length: 12 }, (_, i) => i + 1);
  return [
    [...Array(6).keys()].flatMap(i => [i + 1, i + 7]),
    [...Array(6).keys()].flatMap(i => [6 - i, 12 - i]), 
    [...Array(6).keys()].flatMap(i => [6 - i, i + 7]), 
    [...Array(6).keys()].flatMap(i => [i + 1, 12 - i]), 
  ];
};

const sendDataToGoogleSheet = async (times: number[]) => {
  const url = `https://script.google.com/macros/s/AKfycbzKI0EAuzvHhAaEc8hGxT8GqXGUo6UkrrA1quj5RKPpLW7UlA5DFR-ClJwFSrPMHmphvw/exec?times=${encodeURIComponent(JSON.stringify(times))}`;
  
  const response = await fetch(url, { method: "GET" });

  if (response.ok) {
    console.log("Data saved successfully!");
  } else {
    console.error("Failed to save data.");
  }
};

export default function ElevatorGame() {
  const [started, setStarted] = useState(false);
  const [targetFloor, setTargetFloor] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTimes, setElapsedTimes] = useState<number[]>([]);
  const [layoutIndex, setLayoutIndex] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [usedFloors, setUsedFloors] = useState<number[]>([]);
  const layouts = generateLayouts();

  const getRandomFloor = () => {
    const availableFloors = layouts[layoutIndex].filter(floor => !usedFloors.includes(floor));
    if (availableFloors.length === 0) return null;
    return availableFloors[Math.floor(Math.random() * availableFloors.length)];
  };

  const handleStart = () => {
    if (layoutIndex >= layouts.length) {
      setGameFinished(true);
      setStarted(false);
      return;
    }
    const newFloor = getRandomFloor();
    if (newFloor !== null) {
      setStarted(true);
      setTargetFloor(newFloor);
      setUsedFloors(prev => [...prev, newFloor]);
      setStartTime(Date.now());
    } else {
      setGameFinished(true);
      setStarted(false);
    }
  };

  const handleFloorClick = (floor: number) => {
    if (floor === targetFloor && startTime !== null) {
      const timeTaken = (Date.now() - startTime) / 1000;
      setElapsedTimes(prev => [...prev, timeTaken]);
      setStarted(false);
      
      if (layoutIndex < layouts.length - 1) {
        setTimeout(() => {
          setLayoutIndex(prev => prev + 1);
          setUsedFloors([]); // รีเซ็ตเลขชั้นที่ใช้ไปแล้วเมื่อเปลี่ยนแพทเทิร์น
        }, 1000);
      } else {
        setTimeout(() => setGameFinished(true), 1000);
      }
    }
  };

  const handleRestart = () => {
    sendDataToGoogleSheet(elapsedTimes); 
    setElapsedTimes([]);
    setLayoutIndex(0);
    setUsedFloors([]);
    setGameFinished(false);
    setStarted(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!started && !gameFinished ? (
        <button
          onClick={handleStart}
          className="px-10 py-6 text-5xl font-bold text-white bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-all"
        >
          Start
        </button>
      ) : gameFinished ? (
        <div className="mt-4 text-3xl font-semibold text-gray-800">
          <h3>Final Results:</h3>
          {elapsedTimes.map((time, index) => (
            <p key={index}>Pattern {index + 1}: {time.toFixed(3)} sec</p>
          ))}
          <button
            onClick={handleRestart}
            className="mt-10 px-8 py-4 text-3xl font-bold text-white bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-all"
          >
            Restart
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h2 className="mb-10 text-6xl font-semibold text-red-600 mb-4">
            Press Floor {targetFloor}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {layouts[layoutIndex].map((floor) => (
              <button
                key={floor}
                onClick={() => handleFloorClick(floor)}
                className="w-30 h-30 p-10 m-3 text-5xl font-bold text-white bg-blue-500 rounded-full shadow-md hover:bg-blue-600 transition-all"
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
