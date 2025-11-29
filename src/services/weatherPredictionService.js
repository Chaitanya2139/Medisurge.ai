/**
 * Weather-Based Patient Surge Prediction Service
 * Fetches weather data and analyzes various factors to predict patient surges
 */

// Configuration
const N8N_WEBHOOK_URL = 'https://vaibhavopps22.app.n8n.cloud/webhook/patient-surge-prediction';

/**
 * Fetch comprehensive weather and environmental data
 * @param {Object} location - { lat, lng, city }
 * @returns {Promise<Object>} Weather data and predictions
 */
export const fetchWeatherPredictions = async (location = { lat: 28.7041, lng: 77.1025, city: 'Delhi' }) => {
  try {
    // Prepare comprehensive data payload for n8n
    const predictionData = {
      timestamp: new Date().toISOString(),
      location: {
        city: location.city || 'Delhi',
        latitude: location.lat,
        longitude: location.lng,
        country: 'India'
      },
      dataRequest: {
        weatherFactors: true,
        pollutionFactors: true,
        epidemiologicalData: true,
        socialEvents: true,
        historicalTrends: true
      },
      analysisType: 'patient-surge-prediction',
      timeHorizon: {
        shortTerm: '24-72 hours',
        mediumTerm: '1-2 weeks',
        longTerm: '1 month'
      }
    };

    console.log('🌤️ Fetching weather predictions from n8n:', predictionData);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(predictionData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Weather predictions received:', result);

    return {
      success: true,
      data: result,
      processedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error fetching weather predictions:', error);
    
    // Return mock data for development/testing
    return getMockPredictionData(location);
  }
};

/**
 * Analyze specific weather factors for surge prediction
 * @param {Object} weatherData - Current weather conditions
 * @returns {Object} Risk analysis
 */
export const analyzeWeatherRisks = (weatherData) => {
  const risks = [];
  let overallRiskLevel = 'Low';

  // Temperature analysis
  if (weatherData.temperature > 40) {
    risks.push({
      factor: 'Extreme Heat',
      severity: 'High',
      impact: 'Heat stroke, dehydration cases expected',
      predictedIncrease: '150-200%'
    });
    overallRiskLevel = 'High';
  } else if (weatherData.temperature < 5) {
    risks.push({
      factor: 'Extreme Cold',
      severity: 'High',
      impact: 'Respiratory infections, hypothermia',
      predictedIncrease: '120-150%'
    });
    overallRiskLevel = 'High';
  }

  // Air Quality Index (AQI) analysis
  if (weatherData.aqi > 300) {
    risks.push({
      factor: 'Severe Air Pollution',
      severity: 'Critical',
      impact: 'Respiratory emergencies, cardiac issues',
      predictedIncrease: '200-300%'
    });
    overallRiskLevel = 'Critical';
  } else if (weatherData.aqi > 150) {
    risks.push({
      factor: 'Poor Air Quality',
      severity: 'Moderate',
      impact: 'Asthma, COPD exacerbations',
      predictedIncrease: '80-120%'
    });
    if (overallRiskLevel === 'Low') overallRiskLevel = 'Moderate';
  }

  // Humidity analysis
  if (weatherData.humidity > 85) {
    risks.push({
      factor: 'High Humidity',
      severity: 'Moderate',
      impact: 'Fungal infections, breathing difficulties',
      predictedIncrease: '40-60%'
    });
  }

  // Rainfall/Flooding
  if (weatherData.rainfall > 100) {
    risks.push({
      factor: 'Heavy Rainfall',
      severity: 'High',
      impact: 'Waterborne diseases, accidents, injuries',
      predictedIncrease: '150-200%'
    });
    overallRiskLevel = 'High';
  }

  return {
    overallRiskLevel,
    risks,
    totalRiskFactors: risks.length,
    recommendedActions: generateRecommendations(risks)
  };
};

/**
 * Generate recommendations based on risk analysis
 */
const generateRecommendations = (risks) => {
  const recommendations = [];

  risks.forEach(risk => {
    if (risk.factor.includes('Heat')) {
      recommendations.push('Increase ICU capacity for heat-related emergencies');
      recommendations.push('Stock IV fluids and cooling equipment');
      recommendations.push('Alert geriatric and pediatric departments');
    }
    if (risk.factor.includes('Pollution')) {
      recommendations.push('Prepare additional oxygen supplies');
      recommendations.push('Staff pulmonology department adequately');
      recommendations.push('Setup outdoor triage for respiratory cases');
    }
    if (risk.factor.includes('Cold')) {
      recommendations.push('Increase emergency room capacity');
      recommendations.push('Stock antibiotics and respiratory medications');
      recommendations.push('Prepare warming equipment');
    }
    if (risk.factor.includes('Rainfall')) {
      recommendations.push('Prepare for trauma and injury cases');
      recommendations.push('Stock antibiotics for waterborne diseases');
      recommendations.push('Alert orthopedic and emergency departments');
    }
  });

  return [...new Set(recommendations)]; // Remove duplicates
};

/**
 * Mock prediction data for development/testing
 */
const getMockPredictionData = (location) => {
  return {
    success: true,
    mode: 'mock',
    data: {
      location: {
        city: location.city || 'Delhi',
        latitude: location.lat,
        longitude: location.lng
      },
      currentConditions: {
        temperature: 38,
        humidity: 65,
        aqi: 180,
        rainfall: 0,
        windSpeed: 15,
        uvIndex: 8
      },
      predictions: {
        next24Hours: {
          surgeProbability: 0.65,
          expectedIncrease: '120%',
          primaryFactors: ['High Temperature', 'Poor Air Quality'],
          riskLevel: 'Moderate'
        },
        next72Hours: {
          surgeProbability: 0.78,
          expectedIncrease: '150%',
          primaryFactors: ['Extreme Heat Wave', 'Severe Pollution'],
          riskLevel: 'High'
        },
        nextWeek: {
          surgeProbability: 0.55,
          expectedIncrease: '80%',
          primaryFactors: ['Festival Season', 'Moderate Pollution'],
          riskLevel: 'Moderate'
        }
      },
      departmentWiseImpact: {
        emergency: { expectedIncrease: '200%', riskLevel: 'Critical' },
        cardiology: { expectedIncrease: '150%', riskLevel: 'High' },
        pulmonology: { expectedIncrease: '180%', riskLevel: 'High' },
        pediatrics: { expectedIncrease: '120%', riskLevel: 'Moderate' },
        geriatrics: { expectedIncrease: '160%', riskLevel: 'High' }
      },
      recommendations: [
        'Increase emergency staff by 50% for next 72 hours',
        'Stock critical medications: respiratory, cardiac',
        'Prepare additional ICU beds (estimated +20 beds needed)',
        'Alert ambulance services for increased demand',
        'Setup outdoor triage for non-critical cases',
        'Coordinate with nearby hospitals for load balancing'
      ],
      historicalComparison: {
        similarConditionsPast: '15 times in last 2 years',
        averageSurgeIncrease: '165%',
        peakHours: ['10 AM - 2 PM', '6 PM - 10 PM']
      }
    },
    processedAt: new Date().toISOString(),
    note: 'Mock data - n8n webhook will provide real-time data'
  };
};

/**
 * Get real-time surge alerts
 */
export const getSurgeAlerts = async (hospitalId) => {
  try {
    const response = await fetch(`${N8N_WEBHOOK_URL}?type=alerts&hospitalId=${hospitalId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching surge alerts:', error);
    return {
      success: false,
      alerts: [],
      error: error.message
    };
  }
};

/**
 * Submit feedback on prediction accuracy
 */
export const submitPredictionFeedback = async (predictionId, actualData) => {
  try {
    const feedback = {
      predictionId,
      actualData,
      timestamp: new Date().toISOString(),
      type: 'accuracy-feedback'
    };

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback)
    });

    return await response.json();
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: error.message };
  }
};

export default {
  fetchWeatherPredictions,
  analyzeWeatherRisks,
  getSurgeAlerts,
  submitPredictionFeedback
};
