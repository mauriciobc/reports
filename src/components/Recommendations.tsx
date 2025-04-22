import React from 'react';
import { useData } from './DataContext';
import { generateRecommendations } from '../utils/recommendationsEngine';

export const Recommendations: React.FC = () => {
  const { radarData, barData, pieData } = useData();
  const recommendations = generateRecommendations(radarData, barData, pieData);

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                rec.priority === 'high'
                  ? 'bg-red-50 border-red-200'
                  : rec.priority === 'medium'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <h3 className="font-semibold text-lg mb-2">{rec.title}</h3>
              <p className="text-gray-700">{rec.description}</p>
              <span
                className={`inline-block mt-2 px-2 py-1 text-sm rounded ${
                  rec.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : rec.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No recommendations available.</p>
      )}
    </div>
  );
};