
import React, { useState, useCallback, useMemo } from 'react';

// Icon component (defined outside App to prevent re-creation)
const ThermometerIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12.5 4.5a.75.75 0 00-1.5 0v6.416a3.75 3.75 0 101.5 0V4.5zM12 15a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" clipRule="evenodd" />
  </svg>
);

// InputField component (defined outside App)
interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unit: string;
  placeholder: string;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, value, onChange, unit, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
    </label>
    <div className="mt-1 relative rounded-md">
      <input
        type="number"
        name={id}
        id={id}
        className="w-full p-3 pr-14 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 focus:outline-none transition-colors duration-200"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min="0"
        step="any"
        aria-label={`${label} ${unit}`}
      />
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
        <span className="text-slate-500 dark:text-slate-400 sm:text-sm">{unit}</span>
      </div>
    </div>
  </div>
);


const App: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [results, setResults] = useState<{ f85: number; f0: number } | null>(null);
  
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (results) {
      setResults(null);
    }
  };

  const calculateFValue = useCallback(() => {
    const timeSec = parseFloat(time);
    const tempC = parseFloat(temperature);

    if (isNaN(timeSec) || isNaN(tempC) || timeSec < 0) {
        setResults(null);
        return;
    }

    const timeMin = timeSec / 60.0; // F値の計算式は分単位のため、秒から分に変換

    // F85値の計算 (基準温度 85℃, Z=7.8)
    const T_ref_85 = 85;
    const z_85 = 7.8;
    const f85 = timeMin * Math.pow(10, (tempC - T_ref_85) / z_85);

    // F0値の計算 (基準温度 121.1℃, Z=10)
    const T_ref_0 = 121.1; 
    const z_0 = 10;
    const f0 = timeMin * Math.pow(10, (tempC - T_ref_0) / z_0);

    setResults({ f85, f0 });
  }, [time, temperature]);
  
  const clearInputs = useCallback(() => {
    setTime('');
    setTemperature('');
    setResults(null);
  }, []);

  const canCalculate = useMemo(() => {
    const timeSec = parseFloat(time);
    const tempC = parseFloat(temperature);
    return !isNaN(timeSec) && !isNaN(tempC) && timeSec >= 0;
  }, [time, temperature]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-800 dark:text-slate-200">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-flex justify-center items-center gap-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-full px-4 py-2 mb-4">
              <ThermometerIcon className="w-6 h-6" />
              <h1 className="text-2xl md:text-3xl font-bold">
                F値 計算ツール
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              加熱時間と温度からF値を計算します。
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); calculateFValue(); }}>
            <div className="space-y-6">
              <InputField
                id="time"
                label="加熱時間"
                value={time}
                onChange={handleInputChange(setTime)}
                unit="秒"
                placeholder="例: 600"
              />
              <InputField
                id="temperature"
                label="加熱温度"
                value={temperature}
                onChange={handleInputChange(setTemperature)}
                unit="℃"
                placeholder="例: 115"
              />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={clearInputs}
                className="w-full text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-300 dark:focus:ring-slate-600"
              >
                クリア
              </button>
              <button
                type="submit"
                disabled={!canCalculate}
                className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transform hover:scale-105"
              >
                計算する
              </button>
            </div>
          </form>

          {results && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 animate-fade-in" aria-live="polite">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 text-center">計算結果</h2>
              <div className="space-y-4">
                <div className="bg-slate-100 dark:bg-slate-700/80 p-4 rounded-lg flex justify-between items-center transition-all duration-300">
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">F85値 (基準温度 85℃)</span>
                    <span className="block text-sm text-slate-500 dark:text-slate-400">Z = 7.8</span>
                  </div>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400" aria-label={`F85値 ${results.f85.toFixed(3)}`}>
                    {results.f85.toFixed(3)}
                  </span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-700/80 p-4 rounded-lg flex justify-between items-center transition-all duration-300">
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">F0値 (基準温度 121.1℃)</span>
                    <span className="block text-sm text-slate-500 dark:text-slate-400">Z = 10</span>
                  </div>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400" aria-label={`F0値 ${results.f0.toFixed(3)}`}>
                    {results.f0.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
