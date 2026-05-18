import { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";

interface DigitColumnProps {
  digit: number;
}

const DigitColumn = memo(({ digit }: DigitColumnProps) => {
  // Live odometer does not need extra spin cycles as it increments step-by-step on screen.
  // It simply rolls from the old digit to the new digit smoothly.
  const cycleCount = 0;
  const duration = 0.35;
  const totalDigits = 10; // Simple 0-9 strip

  // Render the repeating strip of 0-9 digits
  const digitsArray = Array.from({ length: totalDigits }, (_, i) => i);
  const targetIndex = digit;

  return (
    <span className="relative overflow-hidden inline-block align-middle select-none h-[1em] leading-none">
      {/* Absolute container that slides vertically */}
      <motion.span
        className="absolute top-0 left-0 right-0 flex flex-col items-center justify-start"
        animate={{ y: `-${targetIndex}em` }}
        transition={{
          duration: duration,
          ease: "easeOut", // Smooth deceleration
        }}
      >
        {digitsArray.map((num, idx) => (
          <span
            key={idx}
            className="h-[1em] leading-none flex items-center justify-center font-black select-none shrink-0"
          >
            {num}
          </span>
        ))}
      </motion.span>
      {/* Invisible placeholder to establish perfect responsive font sizing */}
      <span className="invisible pointer-events-none select-none h-[1em] leading-none inline-block">0</span>
    </span>
  );
});

DigitColumn.displayName = "DigitColumn";

interface RollingOdometerProps {
  value: string;
}

export const RollingOdometer = memo(({ value }: RollingOdometerProps) => {
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [targetValue, setTargetValue] = useState<number>(0);
  const [maxAllowedValue, setMaxAllowedValue] = useState<number>(0);
  const [prefix, setPrefix] = useState<string>("");
  const [suffix, setSuffix] = useState<string>("");
  const [hasCommasState, setHasCommasState] = useState<boolean>(false);

  useEffect(() => {
    // 1. Robust regex parsing of the fact string (e.g. "10,000+")
    const match = value.match(/^([^0-9]*)([0-9,]+)([^0-9]*)$/);
    if (!match) {
      setPrefix("");
      setSuffix("");
      setCurrentValue(null);
      return;
    }

    const matchedPrefix = match[1];
    const numberStr = match[2];
    const matchedSuffix = match[3];

    const hasCommas = numberStr.includes(",");
    const baseNumber = parseInt(numberStr.replace(/,/g, ""), 10);

    // 2. Local storage dynamic increment offset calculation
    let offset = 0;
    try {
      const stored = localStorage.getItem("innova_applicants_offset");
      if (stored) {
        // Increment the offset randomly to simulate ongoing dynamic registrations
        const prevOffset = parseInt(stored, 10);
        const randIncrement = Math.floor(Math.random() * 5) + 3; // +3 to +7
        // Wrap offset around at 100 to keep the increment at 2 digits maximum (0-99)
        offset = (prevOffset + randIncrement) % 100;
      } else {
        // First visit: initialize with a realistic signup offset
        offset = Math.floor(Math.random() * 21) + 15; // 15 to 35
      }
      localStorage.setItem("innova_applicants_offset", offset.toString());
    } catch (e) {
      console.warn("[RollingOdometer] LocalStorage access failed, using default offset", e);
      offset = 20;
    }

    const finalNumber = baseNumber + offset;
    const maxVal = baseNumber + 1000; // Cap at baseNumber + 1000

    setPrefix(matchedPrefix);
    setSuffix(matchedSuffix);
    setHasCommasState(hasCommas);

    // Reset back to initial base value on mount/value change
    setCurrentValue(baseNumber);
    setTargetValue(finalNumber);
    setMaxAllowedValue(maxVal);
  }, [value]);

  // 3. Live count-up animation interval
  useEffect(() => {
    if (currentValue === null || currentValue >= targetValue) return;

    const diff = targetValue - currentValue;
    const durationMs = 2000; // total count-up duration: 2.0 seconds
    const intervalMs = 60; // 60ms tick rate
    const totalSteps = durationMs / intervalMs;
    const stepSize = Math.max(1, Math.ceil(diff / totalSteps));

    const timer = setInterval(() => {
      setCurrentValue((prev) => {
        if (prev === null) {
          clearInterval(timer);
          return null;
        }
        if (prev >= targetValue) {
          clearInterval(timer);
          return targetValue;
        }
        const next = prev + stepSize;
        if (next >= targetValue) {
          clearInterval(timer);
          return targetValue;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [targetValue, currentValue === null]);

  // 4. Live background real-time ticker (Simulates new dynamic registrations every 4-8s without refreshing)
  useEffect(() => {
    if (currentValue === null || currentValue < targetValue || targetValue >= maxAllowedValue) return;

    // Schedule a simulated live signup after a randomized delay (4 to 8 seconds)
    const triggerNextTicker = () => {
      const delay = Math.floor(Math.random() * 4000) + 4000;
      return setTimeout(() => {
        setTargetValue((prev) => {
          const liveIncrement = Math.floor(Math.random() * 10) + 1; // random increment between 1 and 10 signups
          const nextVal = prev + liveIncrement;
          return nextVal > maxAllowedValue ? maxAllowedValue : nextVal;
        });
      }, delay);
    };

    const timerId = triggerNextTicker();
    return () => clearTimeout(timerId);
  }, [targetValue, currentValue === targetValue, maxAllowedValue]);

  if (currentValue === null) {
    return <span>{value}</span>;
  }

  // Format currentValue dynamically with commas as it changes
  const displayedValueStr = hasCommasState
    ? currentValue.toLocaleString("en-IN")
    : currentValue.toString();

  // Split target string into characters (preserving commas)
  const charArray = displayedValueStr.split("");

  return (
    <span className="inline-flex items-baseline font-black">
      {/* Optional leading prefix (e.g. Currency symbol) */}
      {prefix && <span className="inline-block select-none">{prefix}</span>}

      {/* Render characters with separate rolling columns for digits */}
      {charArray.map((char, index) => {
        if (!/[0-9]/.test(char)) {
          // Render non-numeric characters (commas) as static
          return (
            <span key={index} className="inline-block select-none">
              {char}
            </span>
          );
        }

        return (
          <DigitColumn
            key={index}
            digit={parseInt(char, 10)}
          />
        );
      })}

      {/* Optional trailing suffix (e.g. "+", "k") */}
      {suffix && <span className="inline-block select-none">{suffix}</span>}
    </span>
  );
});

RollingOdometer.displayName = "RollingOdometer";
export default RollingOdometer;
