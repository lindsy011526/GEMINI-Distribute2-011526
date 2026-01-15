import React, { useState, useEffect, useMemo } from 'react';
import { PackingListItem } from './types';
import { SAMPLE_CSV, parseCSV } from './constants';
import { DistributionCharts } from './components/DistributionCharts';
import { SupplyChainGraph } from './components/SupplyChainGraph';
import { AgentExecutor } from './components/AgentExecutor';

function App() {
  const [csvInput, setCsvInput] = useState<string>(SAMPLE_CSV);
  const [packingData, setPackingData] = useState<PackingListItem[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agents'>('dashboard');

  // Filter State
  const [filterField, setFilterField] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');

  useEffect(() => {
    // Initial load
    handleParse();
  }, []);

  const handleParse = () => {
    try {
      const data = parseCSV(csvInput);
      setPackingData(data);
      // Reset filters on new data load
      setFilterField('');
      setFilterValue('');
    } catch (e) {
      alert("Failed to parse CSV. Please check the format.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvInput(text);
        // Automatically parse after upload
        try {
          const data = parseCSV(text);
          setPackingData(data);
          setFilterField('');
          setFilterValue('');
        } catch(e) { console.error(e) }
      };
      reader.readAsText(file);
    }
  };

  // Compute filtered data
  const filteredData = useMemo(() => {
    if (!filterField || !filterValue) return packingData;
    // @ts-ignore - indexing with string key
    return packingData.filter(item => item[filterField] === filterValue);
  }, [packingData, filterField, filterValue]);

  // Compute unique values for the selected filter field
  const filterOptions = useMemo(() => {
    if (!filterField) return [];
    // @ts-ignore
    const values = packingData.map(d => d[filterField]).filter(Boolean);
    return Array.from(new Set(values)).sort();
  }, [packingData, filterField]);

  // Reset filter value when field changes
  const handleFilterFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterField(e.target.value);
    setFilterValue('');
  };

  // Stats for the top cards (based on filtered data)
  const totalRecords = filteredData.length;
  const uniqueCustomers = new Set(filteredData.map(d => d.customer)).size;
  const uniqueDevices = new Set(filteredData.map(d => d.DeviceName)).size;
  const totalUnits = filteredData.reduce((acc, curr) => acc + (parseInt(curr.Numbers) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-3xl mr-2">🧬</span>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  GUDID Chronicles
                </h1>
                <p className="text-xs text-gray-500">Medical Supply Chain AI</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Data Dashboard
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'agents' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Agent Headquarters
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Data Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">1. Data Ingestion (Packing List)</h2>
            <div className="flex items-center space-x-2">
               <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-sm transition-colors text-gray-700">
                  <span>Upload CSV</span>
                  <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
               </label>
               <button 
                onClick={handleParse}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors shadow-sm"
              >
                Reset & Analyze
              </button>
            </div>
          </div>
          <textarea
            className="w-full h-32 p-3 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y custom-scrollbar"
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            placeholder="Paste your CSV data here..."
          />
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Filter Controls */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-wrap items-center gap-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="font-semibold text-gray-700">Filter Visualizations:</span>
              </div>
              
              <select 
                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[150px]"
                value={filterField}
                onChange={handleFilterFieldChange}
              >
                <option value="">Show All Data</option>
                <option value="customer">Customer</option>
                <option value="DeviceCategory">Device Category</option>
                <option value="Suppliername">Supplier</option>
                <option value="DeviceName">Device Name</option>
                <option value="ModelNum">Model Number</option>
              </select>

              {filterField && (
                <div className="flex items-center space-x-2 animate-fade-in">
                  <span className="text-gray-500 text-sm">is</span>
                  <select 
                    className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[200px] max-w-xs"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  >
                    <option value="">-- Select Value --</option>
                    {filterOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {filterField && filterValue && (
                <button 
                  onClick={() => { setFilterField(''); setFilterValue(''); }}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                >
                  Clear Filter
                </button>
              )}
              
              <div className="ml-auto text-sm text-gray-500">
                Showing {totalRecords} records
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-bold text-blue-600">{totalRecords}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Active Customers</p>
                <p className="text-2xl font-bold text-emerald-600">{uniqueCustomers}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Unique Devices</p>
                <p className="text-2xl font-bold text-indigo-600">{uniqueDevices}</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Total Units Shipped</p>
                <p className="text-2xl font-bold text-orange-600">{totalUnits}</p>
              </div>
            </div>

            {/* Tables Section (3 Tables) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Table 1: Recent Transactions */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
                 <div className="px-6 py-4 border-b border-gray-100">
                   <h3 className="font-semibold text-gray-800">Filtered Transactions</h3>
                 </div>
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-600 font-medium">
                       <tr>
                         <th className="px-6 py-3">Date</th>
                         <th className="px-6 py-3">Customer</th>
                         <th className="px-6 py-3">Device Name</th>
                         <th className="px-6 py-3">Lot #</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       {filteredData.slice(0, 5).map((row, idx) => (
                         <tr key={idx} className="hover:bg-gray-50">
                           <td className="px-6 py-3">{row.deliverdate}</td>
                           <td className="px-6 py-3 font-medium text-gray-900">{row.customer}</td>
                           <td className="px-6 py-3 truncate max-w-[200px]">{row.DeviceName}</td>
                           <td className="px-6 py-3 font-mono text-xs">{row.LotNumber}</td>
                         </tr>
                       ))}
                       {filteredData.length === 0 && (
                         <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-400">No data matches filter</td></tr>
                       )}
                     </tbody>
                   </table>
                 </div>
               </div>

               {/* Table 2: Category Breakdown */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-100">
                   <h3 className="font-semibold text-gray-800">Category Stats</h3>
                 </div>
                 <div className="p-4">
                    <ul className="space-y-3">
                      {Array.from(new Set(filteredData.map(d => d.DeviceCategory))).slice(0,5).map((cat, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 truncate w-2/3">{cat}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {filteredData.filter(d => d.DeviceCategory === cat).length} items
                          </span>
                        </li>
                      ))}
                      {filteredData.length === 0 && (
                        <li className="text-center text-gray-400 text-sm">No data available</li>
                      )}
                    </ul>
                 </div>
               </div>
            </div>
            
            {/* Third Table: License IDs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-100">
                   <h3 className="font-semibold text-gray-800">Regulatory Licenses (Top Active)</h3>
                 </div>
                 <div className="overflow-x-auto max-h-60 custom-scrollbar">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-600 sticky top-0">
                       <tr>
                         <th className="px-6 py-3">License ID</th>
                         <th className="px-6 py-3">Usage Count</th>
                         <th className="px-6 py-3">Example Device</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       {Object.entries(filteredData.reduce((acc, i) => {
                          acc[i.licenseID] = (acc[i.licenseID] || 0) + 1;
                          return acc;
                       }, {} as Record<string, number>))
                       .sort((a,b) => (b[1] as number) - (a[1] as number))
                       .slice(0, 5)
                       .map(([id, count], idx) => (
                         <tr key={idx}>
                           <td className="px-6 py-3 font-mono">{id}</td>
                           <td className="px-6 py-3">{count}</td>
                           <td className="px-6 py-3 text-gray-500 truncate max-w-[150px]">
                              {filteredData.find(d => d.licenseID === id)?.DeviceName}
                           </td>
                         </tr>
                       ))}
                       {filteredData.length === 0 && (
                         <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-400">No data available</td></tr>
                       )}
                     </tbody>
                   </table>
                 </div>
            </div>

            {/* Visualizations - Now using filteredData */}
            <h2 className="text-xl font-bold text-gray-800 mt-8">Analytical Visualizations (Updated)</h2>
            {filteredData.length > 0 ? (
              <>
                <DistributionCharts data={filteredData} />
                <SupplyChainGraph data={filteredData} />
              </>
            ) : (
              <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                No data available for the selected criteria.
              </div>
            )}
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="animate-fade-in">
             <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400 text-xl">💡</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Agents will analyze the <strong>{filteredData.length !== packingData.length ? 'filtered' : 'full'} dataset</strong> ({totalRecords} records). 
                      Return to the Dashboard tab to change filter criteria.
                    </p>
                  </div>
                </div>
             </div>
             <AgentExecutor data={filteredData} />
          </div>
        )}

      </main>
    </div>
  );
}

export default App;