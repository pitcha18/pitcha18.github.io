'use client';

import { useState} from 'react';

const generateLayouts = (): number[][] => {
  return [
    [...Array(6).keys()].flatMap((i) => [i + 1, i + 7]),
    [...Array(6).keys()].flatMap((i) => [6 - i, 12 - i]),
    [...Array(6).keys()].flatMap((i) => [i + 1, 12 - i]),
    [...Array(6).keys()].flatMap((i) => [6 - i, i + 7]),
  ];
};

const sendDataToGoogleSheet = async (times: number[]): Promise<void> => {
  const url = `https://script.google.com/macros/s/AKfycbzKI0EAuzvHhAaEc8hGxT8GqXGUo6UkrrA1quj5RKPpLW7UlA5DFR-ClJwFSrPMHmphvw/exec?times=${encodeURIComponent(
    JSON.stringify(times)
  )}`;

  const response = await fetch(url, { method: 'GET' });
  if (response.ok) {
    console.log('Data saved successfully!');
  } else {
    console.error('Failed to save data.');
  }
};

export default function ElevatorGame() {
  // กำหนดชนิดของ State ให้ชัดเจน
  const [started, setStarted] = useState<boolean>(false);
  const [targetFloor, setTargetFloor] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTimes, setElapsedTimes] = useState<number[]>([]);
  const [layoutIndex, setLayoutIndex] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [usedFloors, setUsedFloors] = useState<number[]>([]);
  const layouts: number[][] = generateLayouts();

  // ดึงเลขชั้นแบบสุ่มจาก layouts ที่ยังไม่ได้ใช้
  const getRandomFloor = (): number | null => {
    const availableFloors = layouts[layoutIndex].filter(
      (floor) => !usedFloors.includes(floor)
    );
    if (availableFloors.length === 0) return null;
    return availableFloors[Math.floor(Math.random() * availableFloors.length)];
  };

  // ฟังก์ชันเริ่มเกม: หาชั้นใหม่ ถ้าเจอให้ setTargetFloor
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

  // ยืนยันการเริ่ม (เมื่อกด Start Game)
  const confirmStart = (): void => {
    if (targetFloor !== null) {
      setStarted(true);
      setUsedFloors((prev) => [...prev, targetFloor]);
      setStartTime(Date.now());
    }
  };

  // ฟังก์ชันเมื่อกดปุ่มชั้น
  const handleFloorClick = (floor: number): void => {
    // เช็คว่าชั้นที่กดตรงกับเป้าหมาย + มี startTime แล้วหรือไม่
    if (floor === targetFloor && startTime !== null) {
      const timeTaken = (Date.now() - startTime) / 1000;
      setElapsedTimes((prev) => [...prev, timeTaken]);
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

  // ฟังก์ชันรีสตาร์ทเกม
  const handleRestart = (): void => {
    sendDataToGoogleSheet(elapsedTimes);
    setElapsedTimes([]);
    setLayoutIndex(0);
    setUsedFloors([]);
    setGameFinished(false);
    setStarted(false);
    handleStart();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* ถ้าเกมยังไม่เริ่มและยังไม่จบ */}
      {!started && !gameFinished ? (
        targetFloor === null ? (
          // ถ้าไม่มี targetFloor ให้กดปุ่ม Start
          <button
            onClick={handleStart}
            className="px-10 py-6 text-5xl font-bold text-white bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-all"
          >
            Start
          </button>
        ) : (
          // ถ้ามี targetFloor แล้ว ให้ยืนยันเริ่มเกม
          <div className="flex flex-col items-center">
            <h2 className="mb-10 text-6xl font-semibold text-red-600">
              Floor {targetFloor}
            </h2>
            <button
              onClick={confirmStart}
              className="px-8 py-5 text-4xl font-bold text-white bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-all"
            >
              Start Game
            </button>
          </div>
        )
      ) : gameFinished ? (
        // ถ้าเกมจบแล้ว
        <div className="mt-4 text-3xl font-semibold text-gray-700">
          <h3 className="mb-4 text-4xl font-semibold text-red-600">
            Final Results 
          </h3>
          {/* แสดงเวลาที่ใช้ในแต่ละ pattern */}
          {elapsedTimes.map((time, index) => (
            <p key={index}>
              Pattern {index + 1} : {time.toFixed(3)} sec
            </p>
          ))}
          <button
            onClick={handleRestart}
            className="mt-10 px-8 py-5 text-4xl font-bold text-white bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-all"
          >
            Restart
          </button>
        </div>
      ) : (
        // เมื่อเกมเริ่มแล้ว
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-2 gap-4">
            {layouts[layoutIndex].map((floor) => (
              <button
                key={floor}
                onClick={() => handleFloorClick(floor)}
                className="
                  w-32 h-32
                  flex items-center justify-center
                  text-5xl font-bold text-gray-50
                  bg-gray-500 border-8 border-gray-400
                  rounded-full shadow-xl
                  transition-all duration-200
                  hover:brightness-125 hover:shadow-xl
                  active:scale-90 active:shadow-inner active:bg-gray-300
                "
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
