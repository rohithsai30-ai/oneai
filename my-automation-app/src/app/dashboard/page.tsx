'use client'; // Marks this as a Client Component for useState

// This is a Next.js user dashboard page for authenticated users, built in Windsurf IDE (xAI).
// Accessible at /dashboard after sign-in or sign-up.
// Requires Ant Design: ensure `npm install antd` is run.
// Replace webhook URLs with your actual n8n webhook endpoints (from n8n UI).
// Use Windsurf's Cascade panel to debug fetch issues or add auth (e.g., "Integrate NextAuth.js session check").
// Displays user welcome, recent requests, and automation controls.

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Card, message, Space, Typography, Table, Modal, Form, Radio, DatePicker, TimePicker } from 'antd'; // Added Modal, Form, Radio, DatePicker, TimePicker
import 'antd/dist/reset.css'; // Ant Design CSS for styling (v5+)

const { Title, Paragraph } = Typography;

// Types
interface User {
  name: string;
  email: string;
}

interface Request {
  id: number;
  type: string;
  details: string;
  status: string;
  date: string;
}

// Mock user data (replace with actual auth data, e.g., from NextAuth.js)
const mockUser: User = { name: 'Rohith', email: 'rohith@example.com' };

// Mock recent requests data (replace with API call to your backend or n8n)
const mockRequests = [
  { id: 1, type: 'financial-analysis', details: 'Analyze Q2 finances', status: 'Completed', date: '2025-07-25' },
  { id: 2, type: 'market-research', details: 'Competitor analysis for XYZ', status: 'Pending', date: '2025-07-26' },
];

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [response, setResponse] = useState(null);
  const [user, setUser] = useState<User | null>(null);
  const [onboardingModalVisible, setOnboardingModalVisible] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'choice' | 'call' | 'form'>('choice');
  const [form] = Form.useForm();

  // Replace with your n8n webhook URLs (from n8n's Webhook node)
  const webhookUrls = {
    expenseTracking: 'http://localhost:5678/webhook/expense-tracking', // Example; update with real URLs
    bookkeeping: 'http://localhost:5678/webhook/bookkeeping',
    payroll: 'http://localhost:5678/webhook/payroll',
    requestComposer: 'http://localhost:5678/webhook/request-composer',
  };

  // Check authentication (placeholder; integrate with NextAuth.js or your auth system)
  useEffect(() => {
    // Example: Fetch user session (replace with actual auth logic)
    // e.g., const { data: session } = useSession() from next-auth/react
    setUser(mockUser); // Mock for now
    if (!mockUser) {
      // Redirect to sign-in if no user (use Next.js router or middleware)
      message.error('Please sign in to access the dashboard.');
      window.location.href = '/signin';
    }
  }, []);

  // Trigger a foundation service (automated)
  // In Windsurf, use Cascade to debug (e.g., "Why is my fetch request failing?")
  const triggerFoundationService = async (service: keyof typeof webhookUrls) => {
    setLoading(true);
    try {
      const res = await fetch(webhookUrls[service], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'now', user: user?.email }), // Include user email for tracking
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      message.success(`${service} triggered successfully!`);
      setResponse(data);
    } catch (error) {
      message.error(`Error triggering ${service}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit on-demand growth requests
  // Use Cascade to add features (e.g., "Add file upload to this form")
  const submitGrowthRequest = async () => {
    if (!requestType || !requestDetails) {
      message.warning('Please select type and provide details.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(webhookUrls.requestComposer, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: requestType, details: requestDetails, user: user?.email }),
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      message.success('Request submitted successfully!');
      setResponse(data);
      setRequestDetails('');
    } catch (error) {
      message.error(`Error submitting request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Out (placeholder; integrate with NextAuth.js)
  const handleSignOut = () => {
    message.info('Sign Out clicked! Add sign-out logic (e.g., NextAuth.js signOut).');
    // Example: signOut({ callbackUrl: '/signin' }) from next-auth/react
    window.location.href = '/signin';
  };

  // Handle Start Onboarding Process
  const handleStartOnboarding = () => {
    setOnboardingModalVisible(true);
    setOnboardingStep('choice');
  };

  // Handle Call Scheduling
  const handleScheduleCall = async (values: any) => {
    try {
      // Here you would integrate with a scheduling service like Calendly, Acuity, etc.
      console.log('Call scheduling data:', values);
      message.success('Call scheduled successfully! We will contact you at the scheduled time.');
      setOnboardingModalVisible(false);
      // You could also trigger an email or webhook here
    } catch (error) {
      message.error('Failed to schedule call. Please try again.');
    }
  };

  // Handle Business Form Submission
  const handleBusinessFormSubmit = async (values: any) => {
    try {
      // Here you would send the business information to your backend
      console.log('Business form data:', values);
      message.success('Business information submitted successfully! Our team will review and contact you soon.');
      setOnboardingModalVisible(false);
      form.resetFields();
      // You could trigger a webhook to n8n or your CRM here
    } catch (error) {
      message.error('Failed to submit business information. Please try again.');
    }
  };

  // Table columns for recent requests
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Request Type', dataIndex: 'type', key: 'type' },
    { title: 'Details', dataIndex: 'details', key: 'details' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
  ];

  if (!user) return null; // Prevent rendering until auth check completes

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with Welcome and Sign Out */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Title level={2}>Welcome, {user.name}!</Title>
        <Button type="default" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
      <Button type="primary" onClick={handleStartOnboarding} style={{ marginBottom: '20px' }}>
          Start Onboarding Process
        </Button>
      <Paragraph>Your personal dashboard for managing AI-powered business automations.</Paragraph>

      {/* Recent Requests Section */}
      <Card title="Recent Requests" style={{ marginBottom: '20px' }}>
        <Paragraph>View your recent growth requests and their status.</Paragraph>
        <Table dataSource={mockRequests} columns={columns} rowKey="id" />
      </Card>

         {/* Foundation Services Section */}
            <Card title="Foundation Services (Automated Tasks)" style={{ marginBottom: '20px' }}>
            
              <Button onClick={() => triggerFoundationService('expenseTracking')} loading={loading} style={{ marginRight: '10px' }}>
                Trigger Expense Tracking and Reporting
              </Button>
              <Button onClick={() => triggerFoundationService('bookkeeping')} loading={loading} style={{ marginRight: '10px' }}>
                Trigger Monthly Bookkeeping
              </Button>
              <Button onClick={() => triggerFoundationService('payroll')} loading={loading}>
                Trigger Basic Payroll Processing
              </Button>
              <Button onClick={() => triggerFoundationService('tax')} loading={loading}>
                Trigger Basic Tax Return Preparation
              </Button>
            </Card>
      
            {/* A La Carte Services Section */}
            <Card title="A La Carte Services (On-Demand)" style={{ marginBottom: '20px' }}>
              <Button onClick={() => triggerFoundationService('expenseTracking')} loading={loading} style={{ marginRight: '10px' }}>
                Trigger Marketing Campaign
              </Button>
              <Button onClick={() => triggerFoundationService('bookkeeping')} loading={loading} style={{ marginRight: '10px' }}>
                Trigger Social Media Management
              </Button>
              <Button onClick={() => triggerFoundationService('payroll')} loading={loading}>
                Trigger Email Campaign
              </Button>
              <Button onClick={() => triggerFoundationService('tax')} loading={loading}>
                Trigger SEO Optimization
              </Button>
            </Card>

      {/* Growth Services Section */}
      <Card title="Growth Services (On-Demand Requests)" style={{ marginBottom: '20px' }}>
        <Paragraph>Submit requests for advanced tasks like financial analysis or market research.</Paragraph>
        <Select
          placeholder="Select Request Type"
          onChange={(value) => setRequestType(value)}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          <Select.Option value="financial-analysis">Financial Analysis</Select.Option>
          <Select.Option value="cash-flow-forecast">Cash Flow Forecasting</Select.Option>
          <Select.Option value="market-research">Market Research</Select.Option>
          <Select.Option value="seo-audit">Website SEO Audit</Select.Option>
          <Select.Option value="process-automation">Business Process Automation</Select.Option>
        </Select>
        <Input.TextArea
          placeholder="Provide details for your request (e.g., 'Analyze Q2 finances for trends')"
          value={requestDetails}
          onChange={(e) => setRequestDetails(e.target.value)}
          rows={4}
          style={{ marginBottom: '10px' }}
        />
        <Button type="primary" onClick={submitGrowthRequest} loading={loading}>
          Submit Request
        </Button>
      </Card>

      {/* Response Display */}
      {response && (
        <Card title="Response from Automation">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </Card>
      )}

      {/* Onboarding Modal */}
      <Modal
        title="Welcome to R1 AI - Let's Get Started!"
        open={onboardingModalVisible}
        onCancel={() => setOnboardingModalVisible(false)}
        footer={null}
        width={600}
      >
        {onboardingStep === 'choice' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Title level={3}>How would you like to proceed?</Title>
            <Paragraph>Choose the option that works best for you to help us understand your business needs.</Paragraph>
            
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card 
                hoverable 
                onClick={() => setOnboardingStep('call')}
                style={{ cursor: 'pointer', border: '2px solid #f0f0f0' }}
              >
                <Title level={4}>📞 Schedule a Call</Title>
                <Paragraph>Speak directly with our team to discuss your business needs and get personalized recommendations.</Paragraph>
                <Button type="primary" size="large">Schedule Call</Button>
              </Card>
              
              <Card 
                hoverable 
                onClick={() => setOnboardingStep('form')}
                style={{ cursor: 'pointer', border: '2px solid #f0f0f0' }}
              >
                <Title level={4}>📝 Fill Out Business Form</Title>
                <Paragraph>Complete a detailed form about your business so we can tailor our services to your specific needs.</Paragraph>
                <Button type="default" size="large">Fill Form</Button>
              </Card>
            </Space>
          </div>
        )}

        {onboardingStep === 'call' && (
          <div>
            <Title level={3}>Schedule Your Consultation Call</Title>
            <Paragraph>Choose a convenient time for a 30-minute consultation call with our team.</Paragraph>
            
            <Form onFinish={handleScheduleCall} layout="vertical">
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter your name' }]}
              >
                <Input placeholder="Enter your full name" />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter your email address" />
              </Form.Item>
              
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input placeholder="Enter your phone number" />
              </Form.Item>
              
              <Form.Item
                name="preferredDate"
                label="Preferred Date"
                rules={[{ required: true, message: 'Please select a date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="preferredTime"
                label="Preferred Time"
                rules={[{ required: true, message: 'Please select a time' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
              
              <Form.Item
                name="timezone"
                label="Timezone"
                rules={[{ required: true, message: 'Please select your timezone' }]}
              >
                <Select placeholder="Select your timezone">
                  <Select.Option value="EST">Eastern Time (EST)</Select.Option>
                  <Select.Option value="CST">Central Time (CST)</Select.Option>
                  <Select.Option value="MST">Mountain Time (MST)</Select.Option>
                  <Select.Option value="PST">Pacific Time (PST)</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button onClick={() => setOnboardingStep('choice')}>Back</Button>
                  <Button type="primary" htmlType="submit">Schedule Call</Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}

        {onboardingStep === 'form' && (
          <div>
            <Title level={3}>Tell Us About Your Business</Title>
            <Paragraph>Help us understand your business so we can provide the best automation solutions.</Paragraph>
            
            <Form form={form} onFinish={handleBusinessFormSubmit} layout="vertical">
              <Form.Item
                name="companyName"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter your company name' }]}
              >
                <Input placeholder="Enter your company name" />
              </Form.Item>
              
              <Form.Item
                name="industry"
                label="Industry"
                rules={[{ required: true, message: 'Please select your industry' }]}
              >
                <Select placeholder="Select your industry">
                  <Select.Option value="technology">Technology</Select.Option>
                  <Select.Option value="healthcare">Healthcare</Select.Option>
                  <Select.Option value="finance">Finance</Select.Option>
                  <Select.Option value="retail">Retail</Select.Option>
                  <Select.Option value="manufacturing">Manufacturing</Select.Option>
                  <Select.Option value="consulting">Consulting</Select.Option>
                  <Select.Option value="real-estate">Real Estate</Select.Option>
                  <Select.Option value="other">Other</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="companySize"
                label="Company Size"
                rules={[{ required: true, message: 'Please select your company size' }]}
              >
                <Radio.Group>
                  <Radio value="1-10">1-10 employees</Radio>
                  <Radio value="11-50">11-50 employees</Radio>
                  <Radio value="51-200">51-200 employees</Radio>
                  <Radio value="200+">200+ employees</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                name="currentChallenges"
                label="What are your biggest business challenges?"
                rules={[{ required: true, message: 'Please describe your challenges' }]}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="e.g., Manual bookkeeping, time-consuming expense tracking, payroll management..."
                />
              </Form.Item>
              
              <Form.Item
                name="servicesInterested"
                label="Which services are you most interested in?"
                rules={[{ required: true, message: 'Please select at least one service' }]}
              >
                <Select mode="multiple" placeholder="Select services you're interested in">
                  <Select.Option value="expense-tracking">Expense Tracking & Reporting</Select.Option>
                  <Select.Option value="bookkeeping">Monthly Bookkeeping</Select.Option>
                  <Select.Option value="payroll">Payroll Processing</Select.Option>
                  <Select.Option value="tax-preparation">Tax Return Preparation</Select.Option>
                  <Select.Option value="marketing">Marketing Campaigns</Select.Option>
                  <Select.Option value="social-media">Social Media Management</Select.Option>
                  <Select.Option value="email-campaigns">Email Campaigns</Select.Option>
                  <Select.Option value="seo">SEO Optimization</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="monthlyBudget"
                label="What's your monthly budget for automation services?"
                rules={[{ required: true, message: 'Please select a budget range' }]}
              >
                <Radio.Group>
                  <Radio value="under-500">Under $500</Radio>
                  <Radio value="500-1500">$500 - $1,500</Radio>
                  <Radio value="1500-5000">$1,500 - $5,000</Radio>
                  <Radio value="5000+">$5,000+</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                name="timeline"
                label="When would you like to get started?"
                rules={[{ required: true, message: 'Please select a timeline' }]}
              >
                <Radio.Group>
                  <Radio value="immediately">Immediately</Radio>
                  <Radio value="within-month">Within a month</Radio>
                  <Radio value="within-quarter">Within 3 months</Radio>
                  <Radio value="just-exploring">Just exploring options</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                name="additionalInfo"
                label="Additional Information (Optional)"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Any specific requirements, questions, or additional information you'd like to share..."
                />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button onClick={() => setOnboardingStep('choice')}>Back</Button>
                  <Button type="primary" htmlType="submit">Submit Information</Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;
