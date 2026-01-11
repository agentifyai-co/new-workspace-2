import React, { useState, useCallback } from 'react';
    import deck from '../deck.json';
    import apiSpec from '../api.json';
    import { Atom, ShieldCheck, TestTube2, ChevronRight, LoaderCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

    // NOTE: The base URL for the API is not present in the provided spec.
    // Using a plausible URL based on public information.
    const API_BASE_URL = 'https://api.aviationspreads.com';

    // Helper to find an API endpoint by its ID in the nested structure
    const findEndpointById = (nodes, id) => {
      for (const node of nodes) {
        if (node.id === id && node.type === 'api') {
          return node;
        }
        if (node.children) {
          const found = findEndpointById(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const DeckInput = ({ label, name, type, value, onChange }) => (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
    );

    const StepCard = ({ step, icon }) => {
      const [inputs, setInputs] = useState(() => 
        step.inputs.reduce((acc, input) => {
          acc[input.name] = input.defaultValue ?? '';
          return acc;
        }, {})
      );
      const [loading, setLoading] = useState(false);
      const [response, setResponse] = useState(null);
      const [error, setError] = useState(null);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
      };

      const handleExecute = useCallback(async () => {
        setLoading(true);
        setError(null);
        setResponse(null);

        const endpointId = step.action.endpointRef;
        const apiRoot = apiSpec.scopes['691fce2fa95b9b19e25004b1::691548f5d144703317a4599e'];
        const endpoint = findEndpointById(apiRoot.children, endpointId);

        if (!endpoint) {
          setError(`Endpoint with ref "${endpointId}" not found.`);
          setLoading(false);
          return;
        }

        const params = new URLSearchParams();
        Object.entries(step.action.params).forEach(([key, valueSource]) => {
          if (valueSource.startsWith('input.')) {
            const inputName = valueSource.substring(6);
            if (inputs[inputName]) {
              params.append(key.replace('query.', ''), inputs[inputName]);
            }
          }
        });

        try {
          const res = await fetch(`${API_BASE_URL}${endpoint.url}?${params.toString()}`);
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.detail || `Request failed with status ${res.status}`);
          }
          setResponse(data);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
          setLoading(false);
        }
      }, [step, inputs]);

      return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            {icon}
            <h3 className="text-lg font-semibold">{step.title}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-2">Inputs:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {step.inputs.map(input => (
                  <DeckInput key={input.name} {...input} value={inputs[input.name]} onChange={handleInputChange} />
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={handleExecute} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors">
                {loading ? <LoaderCircle className="animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                Execute Step
              </button>
            </div>
            {(response || error || loading) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-2">Output:</h4>
                {loading && <div className="flex justify-center p-4"><LoaderCircle className="w-6 h-6 animate-spin text-indigo-500" /></div>}
                {error && <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4" role="alert"><p className="font-bold">Error</p><p>{error}</p></div>}
                {response && <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-sm overflow-x-auto">{JSON.stringify(response, null, 2)}</pre>}
              </div>
            )}
          </div>
        </div>
      );
    };

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
              <p className="text-gray-600 dark:text-gray-400">An interactive demo built with Doje Studio.</p>
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