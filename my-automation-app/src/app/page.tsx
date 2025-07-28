'use client'; // Marks this as a Client Component for useState

// This is a Next.js page for a frontend dashboard interfacing with n8n workflows.
// Built in Windsurf IDE (xAI) for AI-powered coding assistance.
// Requires Ant Design: run `npm install antd` in Windsurf's terminal.
// Replace webhook URLs with your actual n8n webhook endpoints (get from n8n UI).
// Use Windsurf's Cascade panel to debug fetch issues or add auth (e.g., "Add NextAuth.js to this page").
// Includes Sign In and Sign Up buttons in a header at the top.
// Now includes comprehensive data persistence for all user inputs and interactions.

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Card, message, Space, Tabs, List } from 'antd'; // Added Tabs and List for data display
import 'antd/dist/reset.css'; // Ant Design CSS for styling (v5+)
import { Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { dataStorage, localStorage as localStorageUtils, UserSubmission, UserInteraction } from '../utils/dataStorage';
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const DashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [response, setResponse] = useState(null);
  const [savedData, setSavedData] = useState<{ submissions: UserSubmission[]; interactions: UserInteraction[] }>({ submissions: [], interactions: [] });
  const [activeTab, setActiveTab] = useState('dashboard');

  // Replace with your n8n webhook URLs (from n8n's Webhook node)
  const webhookUrls = {
    expenseTracking: 'http://localhost:5678/webhook/expense-tracking', // Example; update with real URLs
    bookkeeping: 'http://localhost:5678/webhook/bookkeeping',
    payroll: 'http://localhost:5678/webhook/payroll',
    requestComposer: 'http://localhost:5678/webhook/request-composer',
    tax: 'http://localhost:5678/webhook/tax',
  };

  // Load saved data and draft on component mount
  useEffect(() => {
    // Load draft data from localStorage
    const draft = localStorageUtils.loadDraft();
    if (draft.requestType) setRequestType(draft.requestType);
    if (draft.requestDetails) setRequestDetails(draft.requestDetails);

    // Load all saved data
    loadSavedData();
  }, []);

  // Auto-save draft data when inputs change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorageUtils.saveDraft({ requestType, requestDetails });
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [requestType, requestDetails]);

  // Load saved data from Supabase and localStorage
  const loadSavedData = async () => {
    try {
      const data = await dataStorage.getData();
      setSavedData(data);
    } catch (error) {
      console.error('Error loading saved data:', error);
      message.error('Failed to load saved data');
    }
  };

  // Trigger a foundation service (automated) with data persistence
  // In Windsurf, use Cascade to debug fetch errors (e.g., "Why is my fetch request failing?")
  const triggerFoundationService = async (service: keyof typeof webhookUrls) => {
    setLoading(true);
    let interactionData = null;
    
    try {
      const res = await fetch(webhookUrls[service], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'now' }), // Customize payload as needed
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      
      // Save successful interaction
      interactionData = {
        type: 'interaction' as const,
        action: 'foundation_service_trigger',
        service: service,
        response: data,
        status: 'success' as const
      };
      
      message.success(`${service} triggered successfully!`);
      setResponse(data);
    } catch (error) {
      // Save failed interaction
      interactionData = {
        type: 'interaction' as const,
        action: 'foundation_service_trigger',
        service: service,
        response: { error: error instanceof Error ? error.message : String(error) },
        status: 'error' as const
      };
      
      message.error(`Error triggering ${service}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
      
      // Save interaction data
      if (interactionData) {
        const result = await dataStorage.saveInteraction(interactionData);
        if (!result.serverSuccess && result.error) {
          console.warn('Failed to save interaction to server:', result.error);
        }
        // Reload saved data to show the new interaction
        loadSavedData();
      }
    }
  };

  // Submit on-demand growth requests (like Request Composer) with data persistence
  // Use Cascade to add features (e.g., "Add file upload to this form")
  const submitGrowthRequest = async () => {
    if (!requestType || !requestDetails) {
      message.warning('Please select type and provide details.');
      return;
    }
    setLoading(true);
    let submissionData = null;
    
    try {
      const res = await fetch(webhookUrls.requestComposer, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: requestType, details: requestDetails }),
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      
      // Save successful submission
      submissionData = {
        type: 'submission' as const,
        requestType,
        requestDetails,
        service: 'request_composer',
        response: data,
        status: 'success' as const
      };
      
      message.success('Request submitted successfully!');
      setResponse(data);
      setRequestDetails('');
      setRequestType('');
      
      // Clear draft after successful submission
      localStorageUtils.clearDraft();
    } catch (error) {
      // Save failed submission
      submissionData = {
        type: 'submission' as const,
        requestType,
        requestDetails,
        service: 'request_composer',
        response: { error: error instanceof Error ? error.message : String(error) },
        status: 'error' as const
      };
      
      message.error(`Error submitting request: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
      
      // Save submission data
      if (submissionData) {
        const result = await dataStorage.saveSubmission(submissionData);
        if (!result.serverSuccess && result.error) {
          console.warn('Failed to save submission to server:', result.error);
        }
        // Reload saved data to show the new submission
        loadSavedData();
      }
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

      {/* Foundation Services Section */}
      <Card title="Foundation Services (Automated Tasks) 350 usd for 1 month" style={{ marginBottom: '20px' }}>
        <Button onClick={() => triggerFoundationService('expenseTracking')} loading={loading} style={{ marginRight: '10px' }}>
          Expense Tracking and Reporting
        </Button>
        <Button onClick={() => triggerFoundationService('bookkeeping')} loading={loading} style={{ marginRight: '10px' }}>
          Monthly Bookkeeping
        </Button>
        <Button onClick={() => triggerFoundationService('payroll')} loading={loading} style={{ marginRight: '10px' }}>
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
        <Button onClick={() => triggerFoundationService('payroll')} loading={loading} style={{ marginRight: '10px' }}>
          Email Campaign
        </Button>
        <Button onClick={() => triggerFoundationService('tax')} loading={loading}>
          SEO Optimization
        </Button>
      </Card>

      
      {/* How R1 AI Works Section */}
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