import React, { useEffect, useState } from 'react';
import { OpenAI } from 'node-openai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChartDataResponse } from '../utils/csvHandler';
import { logger } from '../utils/logger';

interface InsightsCardProps {
  data: ChartDataResponse;
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export const InsightsCard: React.FC<InsightsCardProps> = ({ data }) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async (chartData: ChartDataResponse) => {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      setError('OpenAI API key not found. Please check your environment variables.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const api = openai.v1();
      
      // Prepare the data for analysis
      const dataContext = {
        radarData: chartData.radar,
        barData: chartData.bar,
        pieData: chartData.pie,
      };

      // Create a prompt for the AI
      const prompt = `Analyze this 360-degree feedback data and provide key insights:
      
Radar Chart Data (Team competencies by member): ${JSON.stringify(dataContext.radarData)}
Bar Chart Data (Strength categories): ${JSON.stringify(dataContext.barData)}
Pie Chart Data (Overall performance distribution): ${JSON.stringify(dataContext.pieData)}

Please provide:
1. Top performing areas and team members
2. Areas that need improvement
3. Notable patterns and trends
4. Specific recommendations for team development
5. Overall team performance summary

Format the response in markdown with clear sections using ## headers and bullet points.
Keep the analysis concise but informative.`;

      const completion = await api.chat.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in analyzing 360-degree feedback data and providing actionable insights. Focus on identifying patterns, strengths, and areas for improvement. Be specific and constructive in your recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No insights generated from the AI model');
      }

      setInsights(content);
    } catch (err) {
      logger.error('Error generating insights:', err);
      setError(
        err instanceof Error 
          ? `Failed to generate insights: ${err.message}` 
          : 'An unexpected error occurred while generating insights'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      generateInsights(data);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Generating Insights</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => generateInsights(data)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">AI-Generated Insights</h2>
      <div className="prose max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-6 mb-3" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc ml-6 my-2" {...props} />,
            li: ({node, ...props}) => <li className="text-gray-700 my-1" {...props} />,
            p: ({node, ...props}) => <p className="text-gray-700 my-2" {...props} />
          }}
        >
          {insights}
        </ReactMarkdown>
      </div>
      <button 
        onClick={() => generateInsights(data)}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Refresh Insights
      </button>
    </div>
  );
}; 