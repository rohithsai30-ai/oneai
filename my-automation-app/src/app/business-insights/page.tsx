'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Progress, Tag, Button, Alert, List, Divider, Statistic, Timeline } from 'antd';
import { 
  DashboardOutlined, 
  TrophyOutlined, 
  ExclamationCircleOutlined, 
  RocketOutlined,
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  BarChartOutlined,
  BulbOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { supabaseHelpers } from '../../lib/supabase';

const { Title, Text, Paragraph } = Typography;

interface BusinessData {
  business_type: string;
  industry: string;
  company_size: string;
  annual_revenue: string;
  business_goals: string[];
  pain_points: string[];
  current_tools: string[];
  budget_range: string;
  timeline: string;
  additional_info: string;
}

const BusinessInsightsPage = () => {
  const [loading, setLoading] = useState(true);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      // Get user info from localStorage
      const user = localStorage.getItem('r1ai_user');
      if (user) {
        const userData = JSON.parse(user);
        setUserInfo(userData);
        
        // Load business onboarding data from Supabase
        console.log('Loading business data for user ID:', userData.id);
        const result = await supabaseHelpers.getBusinessOnboarding(userData.id);
        console.log('Supabase query result:', result);
        
        if (result.success && result.data) {
          console.log('Business data loaded successfully:', result.data);
          setBusinessData(result.data);
          generateInsights(result.data);
        } else {
          console.log('No business data found. Result:', result);
          console.log('User data:', userData);
          // Check if user has completed onboarding at all
          console.log('Checking if onboarding was completed...');
        }
      } else {
        router.push('/signup');
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (data: BusinessData) => {
    // AI-powered business analysis based on onboarding data
    const analysisInsights = {
      overallScore: calculateOverallScore(data),
      strengths: identifyStrengths(data),
      laggingAreas: identifyLaggingAreas(data),
      recommendations: generateRecommendations(data),
      priorityActions: getPriorityActions(data),
      automationOpportunities: getAutomationOpportunities(data)
    };
    
    setInsights(analysisInsights);
  };

  const calculateOverallScore = (data: BusinessData): number => {
    let score = 50; // Base score
    
    // Revenue factor
    if (data.annual_revenue?.includes('$100K+')) score += 15;
    else if (data.annual_revenue?.includes('$50K-$100K')) score += 10;
    else if (data.annual_revenue?.includes('$25K-$50K')) score += 5;
    
    // Company size factor
    if (data.company_size?.includes('11-50')) score += 10;
    else if (data.company_size?.includes('51+')) score += 15;
    else if (data.company_size?.includes('6-10')) score += 5;
    
    // Goals alignment
    score += Math.min(data.business_goals?.length * 3, 15);
    
    // Current tools usage
    score += Math.min(data.current_tools?.length * 2, 10);
    
    // Budget readiness
    if (data.budget_range?.includes('$1000+')) score += 10;
    else if (data.budget_range?.includes('$500-$1000')) score += 5;
    
    return Math.min(score, 100);
  };

  const identifyStrengths = (data: BusinessData): string[] => {
    const strengths = [];
    
    if (data.annual_revenue?.includes('$100K+')) {
      strengths.push('Strong revenue foundation');
    }
    
    if (data.company_size?.includes('11+')) {
      strengths.push('Established team size');
    }
    
    if (data.business_goals?.includes('Increase Revenue')) {
      strengths.push('Growth-focused mindset');
    }
    
    if (data.current_tools?.length > 3) {
      strengths.push('Technology adoption readiness');
    }
    
    if (data.budget_range?.includes('$500+')) {
      strengths.push('Investment capacity for automation');
    }
    
    return strengths.length > 0 ? strengths : ['Business foundation established'];
  };

  const identifyLaggingAreas = (data: BusinessData): Array<{area: string, severity: 'high' | 'medium' | 'low', description: string}> => {
    const lagging = [];
    
    // Financial management
    if (data.pain_points?.includes('Manual bookkeeping') || data.pain_points?.includes('Tax compliance')) {
      lagging.push({
        area: 'Financial Management',
        severity: 'high' as const,
        description: 'Manual financial processes are slowing down your business growth and increasing error risk.'
      });
    }
    
    // Operational efficiency
    if (data.pain_points?.includes('Time management') || data.pain_points?.includes('Process inefficiencies')) {
      lagging.push({
        area: 'Operational Efficiency',
        severity: 'high' as const,
        description: 'Inefficient processes are consuming valuable time that could be spent on strategic activities.'
      });
    }
    
    // Marketing & Sales
    if (data.business_goals?.includes('Improve Marketing') && data.current_tools?.length < 2) {
      lagging.push({
        area: 'Marketing Automation',
        severity: 'medium' as const,
        description: 'Limited marketing tools may be restricting your customer acquisition potential.'
      });
    }
    
    // Technology adoption
    if (data.current_tools?.length < 3) {
      lagging.push({
        area: 'Technology Integration',
        severity: 'medium' as const,
        description: 'Low technology adoption may be limiting your competitive advantage.'
      });
    }
    
    // Scalability
    if (data.company_size?.includes('1-5') && data.business_goals?.includes('Scale Operations')) {
      lagging.push({
        area: 'Scalability Preparation',
        severity: 'low' as const,
        description: 'Current size may require process optimization before scaling effectively.'
      });
    }
    
    return lagging;
  };

  const generateRecommendations = (data: BusinessData): Array<{title: string, priority: 'high' | 'medium' | 'low', action: string}> => {
    const recommendations = [];
    
    if (data.pain_points?.includes('Manual bookkeeping')) {
      recommendations.push({
        title: 'Automate Financial Processes',
        priority: 'high' as const,
        action: 'Implement automated bookkeeping and expense tracking to save 10+ hours weekly'
      });
    }
    
    if (data.business_goals?.includes('Increase Revenue') && !data.current_tools?.includes('CRM')) {
      recommendations.push({
        title: 'Customer Relationship Management',
        priority: 'high' as const,
        action: 'Set up automated CRM workflows to improve customer retention by 25%'
      });
    }
    
    if (data.pain_points?.includes('Time management')) {
      recommendations.push({
        title: 'Process Automation',
        priority: 'medium' as const,
        action: 'Automate repetitive tasks to free up 15+ hours per week for strategic work'
      });
    }
    
    if (data.business_goals?.includes('Improve Marketing')) {
      recommendations.push({
        title: 'Marketing Automation',
        priority: 'medium' as const,
        action: 'Implement email campaigns and social media automation for consistent brand presence'
      });
    }
    
    return recommendations;
  };

  const getPriorityActions = (data: BusinessData): Array<{action: string, timeframe: string, impact: string}> => {
    return [
      {
        action: 'Set up automated expense tracking',
        timeframe: 'This week',
        impact: 'Save 5+ hours weekly on bookkeeping'
      },
      {
        action: 'Implement payroll automation',
        timeframe: 'Next 2 weeks',
        impact: 'Eliminate payroll errors and save 3+ hours monthly'
      },
      {
        action: 'Launch email marketing automation',
        timeframe: 'Next month',
        impact: 'Increase customer engagement by 40%'
      },
      {
        action: 'Set up comprehensive reporting dashboard',
        timeframe: 'Next 6 weeks',
        impact: 'Real-time business insights for better decisions'
      }
    ];
  };

  const getAutomationOpportunities = (data: BusinessData): Array<{service: string, savings: string, roi: string}> => {
    const opportunities = [];
    
    if (data.pain_points?.includes('Manual bookkeeping')) {
      opportunities.push({
        service: 'Automated Bookkeeping',
        savings: '$2,400/year in accounting costs',
        roi: '300% ROI in first year'
      });
    }
    
    if (data.pain_points?.includes('Payroll management')) {
      opportunities.push({
        service: 'Payroll Automation',
        savings: '$1,800/year in processing time',
        roi: '250% ROI in first year'
      });
    }
    
    if (data.business_goals?.includes('Improve Marketing')) {
      opportunities.push({
        service: 'Marketing Automation',
        savings: '$3,600/year in marketing efficiency',
        roi: '400% ROI in first year'
      });
    }
    
    return opportunities;
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#1890ff';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'blue';
      default: return 'default';
    }
  };

  if (loading) {
    return <div>Loading business insights...</div>;
  }

  if (!businessData || !insights) {
    return <div>No business data found. Please complete onboarding first.</div>;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px', 
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* AI Processor Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(0, 255, 0, 0.05) 0%, transparent 50%)
        `,
        zIndex: 1
      }} />
      
      {/* Circuit Board Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(45deg, rgba(255, 0, 255, 0.05) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(0, 255, 0, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px, 50px 50px, 25px 25px, 25px 25px',
        zIndex: 2
      }} />
      
      {/* Floating Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(2px 2px at 20px 30px, rgba(0, 255, 255, 0.3), transparent),
          radial-gradient(2px 2px at 40px 70px, rgba(255, 0, 255, 0.3), transparent),
          radial-gradient(1px 1px at 90px 40px, rgba(0, 255, 0, 0.3), transparent),
          radial-gradient(1px 1px at 130px 80px, rgba(0, 255, 255, 0.3), transparent),
          radial-gradient(2px 2px at 160px 30px, rgba(255, 0, 255, 0.3), transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 3
      }} />
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
      `}</style>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <Card style={{ 
          marginBottom: '24px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0, color: '#1a1a2e' }}>
                <DashboardOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
                Business Insights Dashboard
              </Title>
              <Text type="secondary">AI-powered analysis of {userInfo?.fullName}'s business</Text>
            </Col>
            <Col>
              <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => router.push('/')}>
                Go to Dashboard
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Business Overview */}
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col xs={24} md={8}>
            <Card style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <Statistic
                title="Business Health Score"
                value={insights.overallScore}
                suffix="/ 100"
                valueStyle={{ color: insights.overallScore >= 70 ? '#3f8600' : insights.overallScore >= 50 ? '#faad14' : '#cf1322' }}
                prefix={<TrophyOutlined />}
              />
              <Progress 
                percent={insights.overallScore} 
                strokeColor={insights.overallScore >= 70 ? '#52c41a' : insights.overallScore >= 50 ? '#faad14' : '#ff4d4f'}
                showInfo={false}
                style={{ marginTop: '8px' }}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <Statistic
                title="Business Type"
                value={businessData.business_type}
                prefix={<TeamOutlined />}
              />
              <Text type="secondary">{businessData.industry} • {businessData.company_size} employees</Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <Statistic
                title="Revenue Range"
                value={businessData.annual_revenue}
                prefix={<DollarOutlined />}
              />
              <Text type="secondary">Budget: {businessData.budget_range}</Text>
            </Card>
          </Col>
        </Row>

        {/* Strengths and Lagging Areas */}
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col xs={24} md={12}>
            <Card 
              title={<><CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />Business Strengths</>}
              style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <List
                dataSource={insights.strengths}
                renderItem={(item: string) => (
                  <List.Item>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    {item}
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card 
              title={<><WarningOutlined style={{ color: '#faad14', marginRight: '8px' }} />Areas Needing Attention</>}
              style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <List
                dataSource={insights.laggingAreas}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<ExclamationCircleOutlined style={{ color: getSeverityColor(item.severity) }} />}
                      title={
                        <div>
                          {item.area}
                          <Tag color={getSeverityColor(item.severity)} style={{ marginLeft: '8px' }}>
                            {item.severity.toUpperCase()}
                          </Tag>
                        </div>
                      }
                      description={item.description}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* AI Recommendations */}
        <Card 
          title={<><BulbOutlined style={{ color: '#1890ff', marginRight: '8px' }} />AI-Powered Recommendations</>}
          style={{ 
            marginBottom: '24px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <List
            dataSource={insights.recommendations}
            renderItem={(item: any) => (
              <List.Item
                actions={[
                  <Button type="primary" size="small" icon={<RocketOutlined />}>
                    Implement Now
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div>
                      {item.title}
                      <Tag color={getPriorityColor(item.priority)} style={{ marginLeft: '8px' }}>
                        {item.priority.toUpperCase()} PRIORITY
                      </Tag>
                    </div>
                  }
                  description={item.action}
                />
              </List.Item>
            )}
          />
        </Card>

        {/* Priority Actions Timeline */}
        <Card 
          title={<><ClockCircleOutlined style={{ color: '#722ed1', marginRight: '8px' }} />Priority Action Timeline</>}
          style={{ 
            marginBottom: '24px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Timeline>
            {insights.priorityActions.map((action: any, index: number) => (
              <Timeline.Item 
                key={index}
                color={index === 0 ? 'red' : index === 1 ? 'orange' : 'blue'}
                dot={index === 0 ? <ClockCircleOutlined style={{ fontSize: '16px' }} /> : undefined}
              >
                <div>
                  <Text strong>{action.action}</Text>
                  <br />
                  <Text type="secondary">{action.timeframe}</Text>
                  <br />
                  <Text style={{ color: '#52c41a' }}>{action.impact}</Text>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>

        {/* Automation ROI Opportunities */}
        <Card 
          title={<><BarChartOutlined style={{ color: '#52c41a', marginRight: '8px' }} />Automation ROI Opportunities</>}
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Row gutter={[16, 16]}>
            {insights.automationOpportunities.map((opportunity: any, index: number) => (
              <Col xs={24} md={8} key={index}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ color: '#1890ff', margin: '0 0 8px 0' }}>
                    {opportunity.service}
                  </Title>
                  <Text style={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}>
                    {opportunity.savings}
                  </Text>
                  <br />
                  <Text type="secondary">{opportunity.roi}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Call to Action */}
        <Alert
          message="Ready to Transform Your Business?"
          description="Based on our analysis, implementing our recommended automations could save you 20+ hours per week and increase your revenue by 30% within 6 months."
          type="success"
          showIcon
          style={{ marginBottom: '24px' }}
          action={
            <Button type="primary" size="large" icon={<RocketOutlined />} onClick={() => router.push('/')}>
              Start Automating Now
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default BusinessInsightsPage;
