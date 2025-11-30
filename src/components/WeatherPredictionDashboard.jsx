import React, { useState, useEffect } from 'react';
import { fetchWeatherPredictions, analyzeWeatherRisks } from '../services/weatherPredictionService';
import { Activity, AlertTriangle, TrendingUp, Cloud, Thermometer, Wind, Droplets, Heart } from 'lucide-react';

const WeatherPredictionDashboard = () => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadPredictions();
    // Refresh every 30 minutes
    const interval = setInterval(loadPredictions, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const result = await fetchWeatherPredictions({ 
        lat: 28.7041, 
        lng: 77.1025, 
        city: 'Delhi' 
      });
      setPredictions(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-deep-void">
        <div className="text-center">
          <Activity className="w-12 h-12 text-neon-teal animate-pulse mx-auto mb-4" />
          <p className="text-white font-mono">Loading Weather Predictions...</p>
        </div>
      </div>
    );
  }

  const data = predictions?.data;

  return (
    <div className="min-h-screen bg-deep-void text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">
            Weather-Based Surge Prediction
          </h1>
          <p className="text-gray-400 text-sm">
            Real-time environmental data analysis for patient surge forecasting
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-600 mt-2">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
          {predictions?.mode === 'mock' && (
            <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-yellow-400" size={16} />
                <span className="text-yellow-400 font-bold">Using Mock Data</span>
              </div>
              <p className="text-yellow-300/80 text-xs">
                n8n webhook not responding (500 error). This is normal if the workflow isn't configured yet.
                The dashboard will automatically switch to live data once the workflow is ready.
              </p>
            </div>
          )}
          {predictions?.mode === 'live' && (
            <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Connected to live n8n environmental data
            </div>
          )}
        </div>

        {/* Current Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Thermometer className="text-orange-500" size={24} />
              <span className="text-gray-400 text-sm">Temperature</span>
            </div>
            <div className="text-3xl font-bold">{data?.currentConditions?.temperature}°C</div>
          </div>

          <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wind className="text-blue-500" size={24} />
              <span className="text-gray-400 text-sm">Air Quality</span>
            </div>
            <div className="text-3xl font-bold">{data?.currentConditions?.aqi}</div>
            <div className="text-xs text-red-400 mt-1">Poor</div>
          </div>

          <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="text-cyan-500" size={24} />
              <span className="text-gray-400 text-sm">Humidity</span>
            </div>
            <div className="text-3xl font-bold">{data?.currentConditions?.humidity}%</div>
          </div>

          <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Cloud className="text-purple-500" size={24} />
              <span className="text-gray-400 text-sm">Wind Speed</span>
            </div>
            <div className="text-3xl font-bold">{data?.currentConditions?.windSpeed} km/h</div>
          </div>
        </div>

        {/* Surge Predictions Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SurgePredictionCard
            title="Next 24 Hours"
            probability={data?.predictions?.next24Hours?.surgeProbability}
            increase={data?.predictions?.next24Hours?.expectedIncrease}
            factors={data?.predictions?.next24Hours?.primaryFactors}
            riskLevel={data?.predictions?.next24Hours?.riskLevel}
          />
          <SurgePredictionCard
            title="Next 72 Hours"
            probability={data?.predictions?.next72Hours?.surgeProbability}
            increase={data?.predictions?.next72Hours?.expectedIncrease}
            factors={data?.predictions?.next72Hours?.primaryFactors}
            riskLevel={data?.predictions?.next72Hours?.riskLevel}
          />
          <SurgePredictionCard
            title="Next Week"
            probability={data?.predictions?.nextWeek?.surgeProbability}
            increase={data?.predictions?.nextWeek?.expectedIncrease}
            factors={data?.predictions?.nextWeek?.primaryFactors}
            riskLevel={data?.predictions?.nextWeek?.riskLevel}
          />
        </div>

        {/* Department Impact */}
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Heart className="text-red-500" />
            Department-Wise Impact Forecast
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {data?.departmentWiseImpact && Object.entries(data.departmentWiseImpact).map(([dept, impact]) => (
              <div key={dept} className="bg-black/30 rounded-lg p-4 border border-white/5">
                <div className="text-sm text-gray-400 capitalize mb-2">{dept}</div>
                <div className="text-2xl font-bold text-neon-teal mb-1">
                  +{impact.expectedIncrease}
                </div>
                <div className={`text-xs px-2 py-1 rounded inline-block ${
                  impact.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400' :
                  impact.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {impact.riskLevel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" />
            Recommended Actions
          </h2>
          <div className="space-y-3">
            {data?.recommendations?.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 bg-black/30 p-4 rounded-lg border border-white/5">
                <div className="w-6 h-6 rounded-full bg-neon-teal/20 text-neon-teal flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-300">{rec}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// Surge Prediction Card Component
const SurgePredictionCard = ({ title, probability, increase, factors, riskLevel }) => {
  const getRiskColor = (level) => {
    switch(level) {
      case 'Critical': return 'border-red-500 bg-red-500/5';
      case 'High': return 'border-orange-500 bg-orange-500/5';
      case 'Moderate': return 'border-yellow-500 bg-yellow-500/5';
      default: return 'border-green-500 bg-green-500/5';
    }
  };

  return (
    <div className={`border-2 rounded-xl p-6 ${getRiskColor(riskLevel)}`}>
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-1">Surge Probability</div>
        <div className="text-4xl font-black text-neon-teal">
          {(probability * 100).toFixed(0)}%
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-1">Expected Increase</div>
        <div className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp size={20} />
          {increase}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Primary Factors</div>
        <div className="space-y-1">
          {factors?.map((factor, i) => (
            <div key={i} className="text-xs bg-black/30 px-2 py-1 rounded">
              • {factor}
            </div>
          ))}
        </div>
      </div>

      <div className={`text-center py-2 rounded font-bold text-sm ${
        riskLevel === 'Critical' ? 'bg-red-500 text-white' :
        riskLevel === 'High' ? 'bg-orange-500 text-white' :
        riskLevel === 'Moderate' ? 'bg-yellow-500 text-black' :
        'bg-green-500 text-white'
      }`}>
        {riskLevel} Risk
      </div>
    </div>
  );
};

export default WeatherPredictionDashboard;
