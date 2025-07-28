'use client'; // Marks this as a Client Component for useState

// This is a Next.js page for a frontend dashboard interfacing with n8n workflows.
// Built in Windsurf IDE (xAI) for AI-powered coding assistance.
// Requires Ant Design: run `npm install antd` in Windsurf’s terminal.
// Replace webhook URLs with your actual n8n webhook endpoints (get from n8n UI).
// Use Windsurf’s Cascade panel to debug fetch issues or add auth (e.g., “Add NextAuth.js to this page”).
// Includes Sign In and Sign Up buttons in a header at the top.

import React, { useState } from 'react';
import { Button, Input, Select, Card, message, Space } from 'antd'; // Added Space for header layout
import 'antd/dist/reset.css'; // Ant Design CSS for styling (v5+)
import { Typography } from 'antd';
import { useRouter } from 'next/navigation';
const { Title, Paragraph } = Typography;

const DashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [response, setResponse] = useState(null);

  // Replace with your n8n webhook URLs (from n8n’s Webhook node)
  const webhookUrls = {
    expenseTracking: 'http://localhost:5678/webhook/expense-tracking', // Example; update with real URLs
    bookkeeping: 'http://localhost:5678/webhook/bookkeeping',
    payroll: 'http://localhost:5678/webhook/payroll',
    requestComposer: 'http://localhost:5678/webhook/request-composer',
  };

  // Trigger a foundation service (automated)
  // In Windsurf, use Cascade to debug fetch errors (e.g., “Why is my fetch request failing?”)
  const triggerFoundationService = async (service) => {
    setLoading(true);
    try {
      const res = await fetch(webhookUrls[service], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'now' }), // Customize payload as needed
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      message.success(`${service} triggered successfully!`);
      setResponse(data);
    } catch (error) {
      message.error(`Error triggering ${service}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit on-demand growth requests (like Request Composer)
  // Use Cascade to add features (e.g., “Add file upload to this form”)
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
        body: JSON.stringify({ type: requestType, details: requestDetails }),
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      message.success('Request submitted successfully!');
      setResponse(data);
      setRequestDetails('');
    } catch (error) {
      message.error(`Error submitting request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign In button click
  const handleSignIn = () => {
    router.push('/signin');
  };

  // Handle Sign Up button click
  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
 {/* Header with Sign In and Sign Up buttons */}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>R1 AI</h2>
        <Space>
          <Button type="default" onClick={handleSignIn}>
            Sign In
          </Button>
          <Button type="primary" onClick={handleSignUp}>
            Sign Up
          </Button>
        </Space>
      </div>
    
      <center><p>Welcome to your AI-powered business ops interface, inspired by Innorve.ai services.</p></center>

  

    <p></p>

      {/* Foundation Services Section */}
      <Card title="Foundation Services (Automated Tasks) 350 usd for 1 month" style={{ marginBottom: '20px' }}>
      
        <Button onClick={() => triggerFoundationService('expenseTracking')} loading={loading} style={{ marginRight: '10px' }}>
          Expense Tracking and Reporting
        </Button>
        <Button onClick={() => triggerFoundationService('bookkeeping')} loading={loading} style={{ marginRight: '10px' }}>
          Monthly Bookkeeping
        </Button>
        <Button onClick={() => triggerFoundationService('payroll')} loading={loading}>
          Basic Payroll Processing
        </Button>
        <Button onClick={() => triggerFoundationService('tax')} loading={loading}>
          Basic Tax Return Preparation
        </Button>
      </Card>

      {/* A La Carte Services Section */}
      <Card title="A La Carte Services (On-Demand) 75 IXP per month" style={{ marginBottom: '20px' }}>
        <Button onClick={() => triggerFoundationService('expenseTracking')} loading={loading} style={{ marginRight: '10px' }}>
          Marketing Campaign
        </Button>
        <Button onClick={() => triggerFoundationService('bookkeeping')} loading={loading} style={{ marginRight: '10px' }}>
          Social Media Management
        </Button>
        <Button onClick={() => triggerFoundationService('payroll')} loading={loading}>
          Email Campaign
        </Button>
        <Button onClick={() => triggerFoundationService('tax')} loading={loading}>
          SEO Optimization
        </Button>
      </Card>


      {/* How Innorve Works Section */}
      <Card title="How R1 AI Works" style={{ marginBottom: '20px' }}>
        <Paragraph>
          From signup to growth in three simple steps. Get your foundation covered, then tackle any business challenge with our AI-powered request system.
        </Paragraph>
        <div style={{ marginTop: '20px' }}>
          <Title level={4}>STEP 1: Sign Up & Onboard</Title>
          <Paragraph>
            AI analyzes your business from just your name, business name, and website. Get instant insights and personalized recommendations in minutes, not weeks.
          </Paragraph>
          <Title level={4}>STEP 2: Secure Your Foundation</Title>
          <Paragraph>
            Core bookkeeping, monthly financial statements, and tax prep are handled automatically. Your financial foundation is covered so you can focus on growth.
          </Paragraph>
          <Title level={4}>STEP 3: Request & Grow</Title>
          <Paragraph>
            Use our Intelligent Request Composer and IXP credits for any growth task. From market research to financial modeling—just ask and we'll deliver.
          </Paragraph>
        </div>
      </Card>

      {/* Response Display */}
      {response && (
        <Card title="Response from Automation">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;