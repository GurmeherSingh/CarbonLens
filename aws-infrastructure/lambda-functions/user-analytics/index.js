/**
 * CarbonLens User Analytics Lambda Function
 * Calculates user's environmental impact and sustainability metrics
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Environment variables
const USER_SCANS_TABLE = process.env.USER_SCANS_TABLE;
const ENVIRONMENTAL_DATA_TABLE = process.env.ENVIRONMENTAL_DATA_TABLE;

exports.handler = async (event) => {
    console.log('📊 User Analytics Lambda triggered');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        const { userId, timeframe = 'month' } = JSON.parse(event.body);
        
        if (!userId) {
            return createResponse(400, { error: 'User ID is required' });
        }
        
        // Step 1: Get user's scan history
        const userScans = await getUserScans(userId, timeframe);
        console.log(`📈 Found ${userScans.length} scans for user ${userId}`);
        
        // Step 2: Calculate environmental impact metrics
        const environmentalMetrics = await calculateEnvironmentalMetrics(userScans);
        
        // Step 3: Calculate sustainability score
        const sustainabilityScore = await calculateUserSustainabilityScore(userScans);
        
        // Step 4: Generate insights and recommendations
        const insights = await generateInsights(userScans, environmentalMetrics);
        
        // Step 5: Calculate trends and progress
        const trends = await calculateTrends(userId, timeframe);
        
        const analytics = {
            userId: userId,
            timeframe: timeframe,
            totalScans: userScans.length,
            environmentalMetrics: environmentalMetrics,
            sustainabilityScore: sustainabilityScore,
            insights: insights,
            trends: trends,
            metadata: {
                timestamp: new Date().toISOString(),
                calculationMethod: 'AWS DynamoDB Analytics'
            }
        };
        
        return createResponse(200, {
            success: true,
            analytics: analytics
        });
        
    } catch (error) {
        console.error('❌ User analytics error:', error);
        return createResponse(500, { 
            error: 'User analytics calculation failed',
            message: error.message 
        });
    }
};

/**
 * Get user's scan history for the specified timeframe
 */
async function getUserScans(userId, timeframe) {
    try {
        const timeFilter = getTimeFilter(timeframe);
        
        const params = {
            TableName: USER_SCANS_TABLE,
            KeyConditionExpression: 'userId = :userId AND #timestamp BETWEEN :startTime AND :endTime',
            ExpressionAttributeNames: {
                '#timestamp': 'timestamp'
            },
            ExpressionAttributeValues: {
                ':userId': userId,
                ':startTime': timeFilter.start,
                ':endTime': timeFilter.end
            },
            ScanIndexForward: false // Most recent first
        };
        
        const result = await dynamodb.query(params).promise();
        return result.Items || [];
        
    } catch (error) {
        console.error('❌ Error fetching user scans:', error);
        return [];
    }
}

/**
 * Get time filter based on timeframe
 */
function getTimeFilter(timeframe) {
    const now = new Date();
    const end = now.toISOString();
    
    let start;
    switch (timeframe) {
        case 'week':
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
        case 'month':
            start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            break;
        case 'year':
            start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
            break;
        default:
            start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    return { start, end };
}

/**
 * Calculate environmental impact metrics from user scans
 */
async function calculateEnvironmentalMetrics(userScans) {
    try {
        let totalCarbonFootprint = 0;
        let totalWaterUsage = 0;
        let totalMilesDriven = 0;
        let totalTreesAbsorbed = 0;
        let totalPlasticBottlesEquivalent = 0;
        
        const categoryBreakdown = {};
        const brandBreakdown = {};
        
        for (const scan of userScans) {
            if (scan.products && Array.isArray(scan.products)) {
                for (const product of scan.products) {
                    // Calculate from product environmental data
                    if (product.environmental) {
                        const env = product.environmental;
                        
                        if (env.carbonFootprint?.perUnit) {
                            totalCarbonFootprint += env.carbonFootprint.perUnit;
                        }
                        
                        if (env.waterUsage?.perUnit) {
                            totalWaterUsage += env.waterUsage.perUnit;
                        }
                        
                        if (env.environmentalEquivalents) {
                            const equiv = env.environmentalEquivalents;
                            if (equiv.milesDriven) totalMilesDriven += equiv.milesDriven;
                            if (equiv.treesAbsorbed) totalTreesAbsorbed += equiv.treesAbsorbed;
                            if (equiv.plasticBottlesEquivalent) totalPlasticBottlesEquivalent += equiv.plasticBottlesEquivalent;
                        }
                    }
                    
                    // Category breakdown
                    if (product.category) {
                        categoryBreakdown[product.category] = (categoryBreakdown[product.category] || 0) + 1;
                    }
                    
                    // Brand breakdown
                    if (product.brand) {
                        brandBreakdown[product.brand] = (brandBreakdown[product.brand] || 0) + 1;
                    }
                }
            }
        }
        
        return {
            totalCarbonFootprint: Math.round(totalCarbonFootprint * 100) / 100,
            totalWaterUsage: Math.round(totalWaterUsage),
            totalMilesDriven: Math.round(totalMilesDriven * 100) / 100,
            totalTreesAbsorbed: Math.round(totalTreesAbsorbed * 100) / 100,
            totalPlasticBottlesEquivalent: Math.round(totalPlasticBottlesEquivalent),
            categoryBreakdown: categoryBreakdown,
            brandBreakdown: brandBreakdown,
            averageCarbonPerScan: userScans.length > 0 ? Math.round((totalCarbonFootprint / userScans.length) * 100) / 100 : 0,
            averageWaterPerScan: userScans.length > 0 ? Math.round(totalWaterUsage / userScans.length) : 0
        };
        
    } catch (error) {
        console.error('❌ Error calculating environmental metrics:', error);
        return {
            totalCarbonFootprint: 0,
            totalWaterUsage: 0,
            totalMilesDriven: 0,
            totalTreesAbsorbed: 0,
            totalPlasticBottlesEquivalent: 0,
            categoryBreakdown: {},
            brandBreakdown: {},
            averageCarbonPerScan: 0,
            averageWaterPerScan: 0
        };
    }
}

/**
 * Calculate user's overall sustainability score
 */
async function calculateUserSustainabilityScore(userScans) {
    try {
        if (userScans.length === 0) {
            return {
                overall: 50,
                breakdown: {
                    carbonFootprint: 50,
                    waterUsage: 50,
                    packaging: 50,
                    sourcing: 50
                },
                level: 'Beginner',
                nextMilestone: 'Complete your first scan to get started!'
            };
        }
        
        let totalScore = 0;
        let scoreCount = 0;
        const breakdown = {
            carbonFootprint: 0,
            waterUsage: 0,
            packaging: 0,
            sourcing: 0
        };
        
        for (const scan of userScans) {
            if (scan.products && Array.isArray(scan.products)) {
                for (const product of scan.products) {
                    if (product.environmental?.sustainabilityScore) {
                        totalScore += product.environmental.sustainabilityScore;
                        scoreCount++;
                        
                        // Breakdown by category
                        if (product.category?.toLowerCase().includes('organic')) {
                            breakdown.sourcing += 20;
                        }
                        if (product.packaging?.toLowerCase().includes('recyclable')) {
                            breakdown.packaging += 15;
                        }
                        if (product.environmental.carbonFootprint?.perUnit < 1.0) {
                            breakdown.carbonFootprint += 15;
                        }
                        if (product.environmental.waterUsage?.perUnit < 100) {
                            breakdown.waterUsage += 15;
                        }
                    }
                }
            }
        }
        
        const overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 50;
        
        // Normalize breakdown scores
        Object.keys(breakdown).forEach(key => {
            breakdown[key] = Math.min(100, Math.max(0, breakdown[key]));
        });
        
        // Determine level and next milestone
        const { level, nextMilestone } = getSustainabilityLevel(overallScore, userScans.length);
        
        return {
            overall: overallScore,
            breakdown: breakdown,
            level: level,
            nextMilestone: nextMilestone
        };
        
    } catch (error) {
        console.error('❌ Error calculating sustainability score:', error);
        return {
            overall: 50,
            breakdown: { carbonFootprint: 50, waterUsage: 50, packaging: 50, sourcing: 50 },
            level: 'Beginner',
            nextMilestone: 'Complete your first scan to get started!'
        };
    }
}

/**
 * Get sustainability level and next milestone
 */
function getSustainabilityLevel(score, scanCount) {
    if (score >= 90) {
        return {
            level: 'Eco Champion',
            nextMilestone: 'Share your sustainable choices with friends!'
        };
    } else if (score >= 80) {
        return {
            level: 'Eco Warrior',
            nextMilestone: 'Try to reach 90+ sustainability score'
        };
    } else if (score >= 70) {
        return {
            level: 'Eco Conscious',
            nextMilestone: 'Focus on organic and local products'
        };
    } else if (score >= 60) {
        return {
            level: 'Eco Aware',
            nextMilestone: 'Look for products with eco-friendly packaging'
        };
    } else if (score >= 50) {
        return {
            level: 'Getting Started',
            nextMilestone: 'Choose products with higher sustainability scores'
        };
    } else {
        return {
            level: 'Beginner',
            nextMilestone: 'Start scanning products to build your sustainability profile'
        };
    }
}

/**
 * Generate insights and recommendations
 */
async function generateInsights(userScans, environmentalMetrics) {
    try {
        const insights = [];
        const recommendations = [];
        
        // Carbon footprint insights
        if (environmentalMetrics.totalCarbonFootprint > 10) {
            insights.push({
                type: 'carbon',
                message: `Your carbon footprint is ${environmentalMetrics.totalCarbonFootprint} kg CO₂`,
                impact: 'high'
            });
            recommendations.push('Consider choosing products with lower carbon footprints');
        }
        
        // Water usage insights
        if (environmentalMetrics.totalWaterUsage > 1000) {
            insights.push({
                type: 'water',
                message: `You've used ${environmentalMetrics.totalWaterUsage} liters of water`,
                impact: 'medium'
            });
            recommendations.push('Look for products that use less water in production');
        }
        
        // Category insights
        const topCategory = Object.keys(environmentalMetrics.categoryBreakdown)
            .reduce((a, b) => environmentalMetrics.categoryBreakdown[a] > environmentalMetrics.categoryBreakdown[b] ? a : b);
        
        if (topCategory) {
            insights.push({
                type: 'category',
                message: `Your most scanned category is ${topCategory}`,
                impact: 'neutral'
            });
        }
        
        // Sustainability score insights
        const avgScore = environmentalMetrics.averageCarbonPerScan;
        if (avgScore > 2.0) {
            insights.push({
                type: 'sustainability',
                message: 'Consider choosing more sustainable alternatives',
                impact: 'high'
            });
            recommendations.push('Look for organic and locally sourced products');
        }
        
        return {
            insights: insights,
            recommendations: recommendations,
            topCategories: Object.entries(environmentalMetrics.categoryBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([category, count]) => ({ category, count })),
            topBrands: Object.entries(environmentalMetrics.brandBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([brand, count]) => ({ brand, count }))
        };
        
    } catch (error) {
        console.error('❌ Error generating insights:', error);
        return {
            insights: [],
            recommendations: ['Start scanning more products to get personalized insights'],
            topCategories: [],
            topBrands: []
        };
    }
}

/**
 * Calculate trends over time
 */
async function calculateTrends(userId, timeframe) {
    try {
        // This would typically involve more complex time-series analysis
        // For now, return basic trend indicators
        
        const trends = {
            carbonFootprintTrend: 'stable', // 'increasing', 'decreasing', 'stable'
            waterUsageTrend: 'stable',
            sustainabilityScoreTrend: 'stable',
            scanFrequencyTrend: 'stable'
        };
        
        return trends;
        
    } catch (error) {
        console.error('❌ Error calculating trends:', error);
        return {
            carbonFootprintTrend: 'stable',
            waterUsageTrend: 'stable',
            sustainabilityScoreTrend: 'stable',
            scanFrequencyTrend: 'stable'
        };
    }
}

/**
 * Create standardized API response
 */
function createResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}
