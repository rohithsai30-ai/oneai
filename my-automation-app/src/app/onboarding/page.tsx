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

      // Save to Supabase
      const result = await supabaseHelpers.insertBusinessOnboarding(onboardingData);

      if (result.success) {
        message.success('Business onboarding completed successfully! Welcome to R1 AI!');
        
        // Update user info in localStorage
        const updatedUser = {
          ...userInfo,
          onboardingCompleted: true
        };
        localStorage.setItem('r1ai_user', JSON.stringify(updatedUser));
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card style={{ marginBottom: '20px', textAlign: 'center' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            Welcome to R1 AI, {userInfo.fullName}!
          </Title>
          <Paragraph>
            Let's learn about your business to provide you with the best automation solutions.
          </Paragraph>
          <Progress percent={100} showInfo={false} strokeColor="#1890ff" />
        </Card>

        <Card>
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
