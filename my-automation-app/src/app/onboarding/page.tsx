'use client';

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, message, Select, Checkbox, Row, Col, Progress } from 'antd';
import { BankOutlined, TeamOutlined, DollarOutlined, TagOutlined, ToolOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { supabaseHelpers } from '../../lib/supabase';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const BusinessOnboardingPage = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // Get user info from localStorage
    const user = localStorage.getItem('r1ai_user');
    if (user) {
      setUserInfo(JSON.parse(user));
    } else {
      // Redirect to sign up if no user found
      router.push('/signup');
    }
  }, [router]);

  const businessTypes = [
    'Sole Proprietorship',
    'Partnership',
    'LLC',
    'Corporation',
    'Non-profit',
    'Startup',
    'Other'
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Retail',
    'Manufacturing',
    'Education',
    'Real Estate',
    'Consulting',
    'Marketing',
    'Food & Beverage',
    'Other'
  ];

  const companySizes = [
    'Just me (1)',
    'Small team (2-10)',
    'Medium business (11-50)',
    'Large business (51-200)',
    'Enterprise (200+)'
  ];

  const revenueRanges = [
    'Pre-revenue',
    'Under $50K',
    '$50K - $250K',
    '$250K - $1M',
    '$1M - $5M',
    '$5M+'
  ];

  const budgetRanges = [
    'Under $500/month',
    '$500 - $2,000/month',
    '$2,000 - $5,000/month',
    '$5,000 - $10,000/month',
    '$10,000+/month'
  ];

  const businessGoals = [
    'Automate repetitive tasks',
    'Improve financial management',
    'Scale operations',
    'Reduce costs',
    'Increase revenue',
    'Better customer service',
    'Streamline workflows',
    'Data analysis & reporting',
    'Compliance management',
    'Team productivity'
  ];

  const painPoints = [
    'Manual data entry',
    'Disorganized finances',
    'Time-consuming processes',
    'Poor communication',
    'Lack of automation',
    'Difficulty scaling',
    'Compliance issues',
    'Data silos',
    'Inefficient workflows',
    'Limited reporting'
  ];

  const currentTools = [
    'Excel/Google Sheets',
    'QuickBooks',
    'Salesforce',
    'HubSpot',
    'Slack',
    'Trello/Asana',
    'Zapier',
    'Custom software',
    'No automation tools',
    'Other'
  ];

  const timelines = [
    'Immediate (within 1 month)',
    'Short-term (1-3 months)',
    'Medium-term (3-6 months)',
    'Long-term (6+ months)'
  ];

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (!userInfo?.id) {
        message.error('User information not found. Please sign up again.');
        router.push('/signup');
        return;
      }

      // Prepare onboarding data
      const onboardingData = {
        user_id: userInfo.id,
        business_type: values.businessType,
        industry: values.industry,
        company_size: values.companySize,
        annual_revenue: values.annualRevenue,
        business_goals: values.businessGoals || [],
        pain_points: values.painPoints || [],
        current_tools: values.currentTools || [],
        budget_range: values.budgetRange,
        timeline: values.timeline,
        additional_info: values.additionalInfo,
        onboarding_completed: true
      };

      console.log('Preparing to save onboarding data:', onboardingData);
      console.log('User ID being used:', userInfo.id);
      console.log('User info from localStorage:', userInfo);

      // Save to Supabase
      const result = await supabaseHelpers.insertBusinessOnboarding(onboardingData);
      console.log('Onboarding save result:', result);

      if (result.success) {
        message.success('Business onboarding completed successfully! Welcome to R1 AI!');
        
        // Update user info in localStorage
        const updatedUser = {
          ...userInfo,
          onboardingCompleted: true
        };
        localStorage.setItem('r1ai_user', JSON.stringify(updatedUser));
        
        // Redirect to business insights dashboard
        setTimeout(() => {
          router.push('/business-insights');
        }, 1500);
      } else {
        message.error(`Onboarding failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      message.error('Onboarding failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) {
    return <div>Loading...</div>;
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
      
      {/* Neural Network Lines */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          linear-gradient(45deg, transparent 40%, rgba(0, 255, 255, 0.1) 50%, transparent 60%),
          linear-gradient(-45deg, transparent 40%, rgba(255, 0, 255, 0.1) 50%, transparent 60%)
        `,
        backgroundSize: '100px 100px',
        animation: 'pulse 4s ease-in-out infinite',
        zIndex: 4
      }} />
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <Card style={{ 
          marginBottom: '20px', 
          textAlign: 'center', 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)', 
          borderRadius: '10px', 
          padding: '20px'
        }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '8px', color: '#1a1a2e' }}>
            Welcome to R1 AI, {userInfo.fullName}!
          </Title>
          <Paragraph>
            Let's learn about your business to provide you with the best automation solutions.
          </Paragraph>
          <Progress percent={100} showInfo={false} strokeColor="#1890ff" />
        </Card>

        <Card style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)', 
          borderRadius: '10px', 
          padding: '20px'
        }}>
          <Form
            form={form}
            name="business-onboarding"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessType"
                  label="Business Type"
                  rules={[{ required: true, message: 'Please select your business type!' }]}
                >
                  <Select placeholder="Select business type" size="large">
                    {businessTypes.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="industry"
                  label="Industry"
                  rules={[{ required: true, message: 'Please select your industry!' }]}
                >
                  <Select placeholder="Select industry" size="large">
                    {industries.map(industry => (
                      <Option key={industry} value={industry}>{industry}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="companySize"
                  label="Company Size"
                  rules={[{ required: true, message: 'Please select your company size!' }]}
                >
                  <Select placeholder="Select company size" size="large">
                    {companySizes.map(size => (
                      <Option key={size} value={size}>{size}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="annualRevenue"
                  label="Annual Revenue (Optional)"
                >
                  <Select placeholder="Select revenue range" size="large" allowClear>
                    {revenueRanges.map(range => (
                      <Option key={range} value={range}>{range}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="businessGoals"
                  label="What are your main business goals? (Select all that apply)"
                  rules={[{ required: true, message: 'Please select at least one business goal!' }]}
                >
                  <Checkbox.Group>
                    <Row gutter={[8, 8]}>
                      {businessGoals.map(goal => (
                        <Col xs={24} sm={12} md={8} key={goal}>
                          <Checkbox value={goal}>{goal}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="painPoints"
                  label="What are your biggest pain points? (Select all that apply)"
                  rules={[{ required: true, message: 'Please select at least one pain point!' }]}
                >
                  <Checkbox.Group>
                    <Row gutter={[8, 8]}>
                      {painPoints.map(point => (
                        <Col xs={24} sm={12} md={8} key={point}>
                          <Checkbox value={point}>{point}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="currentTools"
                  label="What tools do you currently use? (Select all that apply)"
                >
                  <Checkbox.Group>
                    <Row gutter={[8, 8]}>
                      {currentTools.map(tool => (
                        <Col xs={24} sm={12} md={8} key={tool}>
                          <Checkbox value={tool}>{tool}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="budgetRange"
                  label="Monthly Automation Budget (Optional)"
                >
                  <Select placeholder="Select budget range" size="large" allowClear>
                    {budgetRanges.map(range => (
                      <Option key={range} value={range}>{range}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="timeline"
                  label="Implementation Timeline"
                  rules={[{ required: true, message: 'Please select your timeline!' }]}
                >
                  <Select placeholder="Select timeline" size="large">
                    {timelines.map(timeline => (
                      <Option key={timeline} value={timeline}>{timeline}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="additionalInfo"
                  label="Additional Information (Optional)"
                >
                  <TextArea
                    rows={4}
                    placeholder="Tell us anything else that would help us understand your business needs..."
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ textAlign: 'center', marginTop: '30px' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                style={{ minWidth: '200px' }}
              >
                Complete Onboarding
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default BusinessOnboardingPage;
