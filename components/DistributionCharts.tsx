import React from 'react';
import { PackingListItem } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface Props {
  data: PackingListItem[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const DistributionCharts: React.FC<Props> = ({ data }) => {
  
  // 1. Data Processing for Graphs
  
  // Graph 1: Distribution by Customer (Count)
  const customerCounts = data.reduce((acc, item) => {
    acc[item.customer] = (acc[item.customer] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const customerData = Object.entries(customerCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 10); // Top 10

  // Graph 2: Distribution by Device Category (Pie)
  const categoryCounts = data.reduce((acc, item) => {
    acc[item.DeviceCategory] = (acc[item.DeviceCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts)
    .map(([name, value]) => ({ name, value }));

  // Graph 3: Deliveries over Time (Line)
  const dateCounts = data.reduce((acc, item) => {
    // Deliverdate in sample is Excel serial date or string. 
    // For visualization, we treat it as a category if simple string, 
    // or try to parse if real date. Assuming string/category for safety with sample data "45968".
    acc[item.deliverdate] = (acc[item.deliverdate] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timeData = Object.entries(dateCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name));

  // Graph 4: Model Number Frequency
  const modelCounts = data.reduce((acc, item) => {
    acc[item.ModelNum] = (acc[item.ModelNum] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const modelData = Object.entries(modelCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Chart 1 */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Top 10 Customers by Volume</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={customerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Device Category Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3 */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Delivery Timeline</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" name="Shipments" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4 */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Models Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10}} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#ffc658" name="Quantity" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};