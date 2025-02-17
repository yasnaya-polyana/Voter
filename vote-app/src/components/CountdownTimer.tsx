'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  onExpire?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        if (onExpire) onExpire();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  return (
    <div className="grid grid-flow-col gap-2 text-center auto-cols-max">
      {timeLeft.days > 0 && (
        <div className="flex flex-col">
          <span className="countdown font-mono text-2xl">
            <span style={{ "--value": timeLeft.days } as any}></span>
          </span>
          days
        </div>
      )}
      <div className="flex flex-col">
        <span className="countdown font-mono text-2xl">
          <span style={{ "--value": timeLeft.hours } as any}></span>
        </span>
        hours
      </div>
      <div className="flex flex-col">
        <span className="countdown font-mono text-2xl">
          <span style={{ "--value": timeLeft.minutes } as any}></span>
        </span>
        min
      </div>
      <div className="flex flex-col">
        <span className="countdown font-mono text-2xl">
          <span style={{ "--value": timeLeft.seconds } as any}></span>
        </span>
        sec
      </div>
    </div>
  );
};

export default CountdownTimer; 