import React, { useState } from 'react';
import { Agent, PackingListItem, LLMModel } from '../types';
import { AGENTS_LIST } from '../constants';
import { generateAgentResponse } from '../services/geminiService';

interface Props {
  data: PackingListItem[];
}

export const AgentExecutor: React.FC<Props> = ({ data }) => {
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number>(0);
  const [selectedModel, setSelectedModel] = useState<string>(LLMModel.GEMINI_FLASH);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value);
    setSelectedAgentIndex(idx);
    // Reset custom prompt when agent changes to encourage using the new template default
    setCustomPrompt(""); 
  };

  const handleExecute = async () => {
    if (data.length === 0) {
      alert("Please load data first.");
      return;
    }

    setIsLoading(true);
    setResult("");

    const agent = AGENTS_LIST[selectedAgentIndex];
    // Convert data to string (taking first 50 rows to avoid token limits for demo)
    const dataContext = JSON.stringify(data.slice(0, 50), null, 2);
    
    // Construct prompt
    const basePrompt = customPrompt.trim() !== "" ? customPrompt : agent.prompt_template;
    const finalPrompt = basePrompt.replace("{{input}}", dataContext);

    try {
      const response = await generateAgentResponse(
        selectedModel,
        finalPrompt,
        `You are ${agent.name}, a specialized medical device supply chain analyst.`
      );
      setResult(response);
    } catch (error) {
      setResult("Error occurred during execution.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentAgent = AGENTS_LIST[selectedAgentIndex];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center space-x-2 mb-6">
        <span className="text-2xl">🤖</span>
        <h2 className="text-xl font-bold text-gray-800">Agent Intelligence Center</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Specialist Agent</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            value={selectedAgentIndex}
            onChange={handleAgentChange}
          >
            {AGENTS_LIST.map((agent, idx) => (
              <option key={idx} value={idx}>
                {agent.name} - {agent.role}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">{currentAgent.description}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value={LLMModel.GEMINI_FLASH}>Gemini 3 Flash Preview (Fast)</option>
            <option value={LLMModel.GEMINI_PRO}>Gemini 3 Pro Preview (Reasoning)</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prompt Configuration <span className="text-gray-400 font-normal">(Defaults to agent template if empty)</span>
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 font-mono text-sm"
          placeholder={currentAgent.prompt_template}
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
        />
      </div>

      <button
        onClick={handleExecute}
        disabled={isLoading}
        className={`w-full py-3 rounded-lg text-white font-semibold transition-all shadow-md ${
          isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing with {selectedModel}...
          </span>
        ) : (
          `Execute ${currentAgent.name}`
        )}
      </button>

      {result && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Analysis Result</h3>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{result}</pre>
          </div>
        </div>
      )}
    </div>
  );
};