'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Timer, Upload, AlertCircle, CheckCircle } from 'lucide-react';

// Tree growth stages
const TreeStages = {
  SEED: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="18" r="3" fill="currentColor" />
    </svg>
  ),
  SPROUT: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 18V10M12 10C12 10 14 12 16 10M12 10C12 10 10 12 8 10" stroke="currentColor" fill="none" strokeWidth="2"/>
      <circle cx="12" cy="18" r="3" fill="currentColor" />
    </svg>
  ),
  SAPLING: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 18V8M12 8C12 8 16 12 18 8M12 8C12 8 8 12 6 8" stroke="currentColor" fill="none" strokeWidth="2"/>
      <path d="M12 8C12 8 14 4 12 2M12 8C12 8 10 4 12 2" stroke="currentColor" fill="none" strokeWidth="2"/>
      <circle cx="12" cy="18" r="3" fill="currentColor" />
    </svg>
  ),
  TREE: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 20V6" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6C12 6 18 12 20 6M12 6C12 6 6 12 4 6" stroke="currentColor" fill="none" strokeWidth="2"/>
      <path d="M12 12C12 12 16 16 18 12M12 12C12 12 8 16 6 12" stroke="currentColor" fill="none" strokeWidth="2"/>
      <path d="M12 6C12 6 14 2 12 0M12 6C12 6 10 2 12 0" stroke="currentColor" fill="none" strokeWidth="2"/>
    </svg>
  )
};

const presetTimes = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '1.5 hours', minutes: 90 },
  { label: '2 hours', minutes: 120 },
  { label: '2.5 hours', minutes: 150 },
  { label: '3 hours', minutes: 180 }
];

export default function Home() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfs, setPdfs] = useState([]);
  const [sosMode, setSosMode] = useState(false);
  const [allowedApps, setAllowedApps] = useState([]);
  const [customTime, setCustomTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isCustomTimer, setIsCustomTimer] = useState(false);

  const getTreeStage = (progress) => {
    if (progress < 25) return TreeStages.SEED;
    if (progress < 50) return TreeStages.SPROUT;
    if (progress < 75) return TreeStages.SAPLING;
    return TreeStages.TREE;
  };

  useEffect(() => {
    let interval;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => {
          const newTime = prev - 1;
          setProgress((1 - newTime / window.initialTime) * 100);
          return newTime;
        });
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  useEffect(() => {
    if (isRunning) {
      // Block access to other tabs by continuously checking tab focus
      window.addEventListener('focus', handleTabFocus);
      return () => window.removeEventListener('focus', handleTabFocus);
    }
  }, [isRunning]);

  const handleTabFocus = () => {
    if (!sosMode && isRunning) alert('Focus on your study! App access is restricted.');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCustomTimeChange = (field, value) => {
    setCustomTime((prev) => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  const startCustomTimer = () => {
    const totalSeconds =
      customTime.hours * 3600 +
      customTime.minutes * 60 +
      customTime.seconds;
    setTime(totalSeconds);
    window.initialTime = totalSeconds;
    setIsRunning(true);
  };

  const handlePresetTime = (minutes) => {
    setTime(minutes * 60);
    window.initialTime = minutes * 60;
    setIsRunning(true);
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
    setPdfs((prev) => [...prev, ...files.map(file => file.name)]);
  };

  const CurrentTreeComponent = getTreeStage(progress);

  const toggleSosMode = () => {
    setSosMode(!sosMode);
    setAllowedApps([]);
  };

  const toggleAppAccess = (app) => {
    setAllowedApps((prev) =>
      prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app]
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-green-800">
            🌱 LeafMeAlone
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Timer Selection */}
          <div className="mb-8">
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => setIsCustomTimer(false)}
                variant={!isCustomTimer ? "default" : "outline"}
                className="flex-1"
              >
                Preset Timers
              </Button>
              <Button
                onClick={() => setIsCustomTimer(true)}
                variant={isCustomTimer ? "default" : "outline"}
                className="flex-1"
              >
                Custom Timer
              </Button>
            </div>

            {isCustomTimer ? (
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-600">Hours</label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={customTime.hours}
                    onChange={(e) => handleCustomTimeChange('hours', e.target.value)}
                    className="mt-1"
                    disabled={isRunning}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Minutes</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={customTime.minutes}
                    onChange={(e) => handleCustomTimeChange('minutes', e.target.value)}
                    className="mt-1"
                    disabled={isRunning}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Seconds</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={customTime.seconds}
                    onChange={(e) => handleCustomTimeChange('seconds', e.target.value)}
                    className="mt-1"
                    disabled={isRunning}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presetTimes.map(({ label, minutes }) => (
                  <Button
                    key={label}
                    onClick={() => handlePresetTime(minutes)}
                    variant="outline"
                    disabled={isRunning}
                    className="w-full"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            )}
            <Button
              onClick={isCustomTimer ? startCustomTimer : () => handlePresetTime(time / 60)}
              disabled={isRunning}
              className="w-full mt-4"
            >
              Start Timer
            </Button>
          </div>

          {/* Timer Display */}
          <div className="text-center text-2xl font-mono">
            {formatTime(time)}
          </div>

          {/* Tree Growth */}
          <div className="flex justify-center my-4">
            <CurrentTreeComponent className="w-20 h-20 text-green-700" />
          </div>

          {/* SOS Mode */}
          <div className="my-4 flex items-center justify-center gap-4">
            <Button
              onClick={toggleSosMode}
              variant="outline"
              className="flex-1"
            >
              {sosMode ? <CheckCircle /> : <AlertCircle />} {sosMode ? "Disable" : "Enable"} SOS
            </Button>
          </div>
          {sosMode && (
            <div className="my-4">
              <p className="text-center text-sm font-semibold text-green-600 mb-2">Allowed Apps</p>
              <div className="grid grid-cols-2 gap-2">
                {["WhatsApp", "Gmail", "Chrome"].map(app => (
                  <Button
                    key={app}
                    variant={allowedApps.includes(app) ? "default" : "outline"}
                    onClick={() => toggleAppAccess(app)}
                  >
                    {app}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="mt-8">
            <Button variant="outline" as="label" className="w-full">
              <Upload className="mr-2" />
              Add PDF Study Materials
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleUpload}
                className="hidden"
                disabled={isRunning}
              />
            </Button>
            <ul className="list-disc pl-5 mt-4 text-sm">
              {pdfs.map((pdf, idx) => (
                <li key={idx}>{pdf}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
