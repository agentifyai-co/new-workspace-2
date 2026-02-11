import React from 'react';
    import deck from '../deck.json'; // Import the deck manifest directly
    import { Atom, ShieldCheck, TestTube2, ChevronRight } from 'lucide-react';

    // A simple, reusable input component for the deck UI
    const DeckInput = ({ label, type, defaultValue }) => (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input
          type={type}
          defaultValue={defaultValue}
          readOnly // Inputs are for display; runtime would handle state
          className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm"
        />
      </div>
    );

    // A component to render a single step from the deck manifest
    const StepCard = ({ step, icon }) => (
      <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-lg font-semibold">{step.title}</h3>
          </div>
          <span className="text-xs font-mono px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
            ID: {step.id}
          </span>
        </div>
        <div className="space-y-4">
          {step.inputs && step.inputs.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-2">Inputs:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {step.inputs.map(input => (
                  <DeckInput key={input.name} {...input} />
                ))}
              </div>
            </div>
          )}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
             <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                Execute Step
                <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    );

    // Main App component that renders the entire deck
    export default function App() {
      const icons = {
        getAmbientDose: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
        getEffectiveDose: <ShieldCheck className="w-6 h-6 text-blue-500" />,
        getDifferentialIntensity: <TestTube2 className="w-6 h-6 text-purple-500" />,
      };

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <header className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Atom className="w-8 h-8 text-indigo-500" />
                <h1 className="text-3xl font-bold tracking-tight">{deck.title}</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                This UI represents the steps defined in <code className="text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded">deck.json</code>.
              </p>
            </header>

            <main className="space-y-6">
              {deck.steps.map(step => (
                <StepCard key={step.id} step={step} icon={icons[step.id] || <Atom />} />
              ))}
            </main>
          </div>
        </div>
      );
    }