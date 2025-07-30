'use client'; // Marks this as a Client Component for useState

// This is a Next.js page for a frontend dashboard interfacing with n8n workflows.
// Built in Windsurf IDE (xAI) for AI-powered coding assistance.
// Requires Ant Design: run `npm install antd` in Windsurf's terminal.
// Replace webhook URLs with your actual n8n webhook endpoints (get from n8n UI).
// Use Windsurf's Cascade panel to debug fetch issues or add auth (e.g., "Add NextAuth.js to this page").
// Includes Sign In and Sign Up buttons in a header at the top.
// Now includes comprehensive data persistence for all user inputs and interactions.

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Card, message, Space, Tabs, List, Row, Col } from 'antd'; // Added Tabs and List for data display
import 'antd/dist/reset.css'; // Ant Design CSS for styling (v5+)
import { Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { dataStorage, localStorage as localStorageUtils, UserSubmission, UserInteraction } from '../utils/dataStorage';
import AutomationTrigger from '../components/AutomationTrigger';
import { DollarOutlined, BookOutlined, TeamOutlined, FileTextOutlined, MailOutlined, GlobalOutlined, FacebookOutlined, SearchOutlined } from '@ant-design/icons';
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const DashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [savedData, setSavedData] = useState<{ submissions: UserSubmission[]; interactions: UserInteraction[] }>({ submissions: [], interactions: [] });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAutomations, setActiveAutomations] = useState<string[]>([]);
  const [automationHistory, setAutomationHistory] = useState<any[]>([]);

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
      
      // Load active automations from localStorage
      const storedAutomations = localStorage.getItem('r1ai_active_automations');
      if (storedAutomations) {
        setActiveAutomations(JSON.parse(storedAutomations));
      }
      
      // Load automation history from interactions
      const automationInteractions = data.interactions.filter(interaction => 
        interaction.action.includes('Automation Configured')
      );
      setAutomationHistory(automationInteractions.map(interaction => ({
        id: interaction.id || Date.now(),
        service: interaction.service,
        title: interaction.action.replace('Automation Configured: ', ''),
        timestamp: interaction.created_at,
        configuration: interaction.response_data?.configuration
      })));
    } catch (error) {
      console.error('Error loading saved data:', error);
      message.error('Failed to load saved data');
    }
  };



  // Submit on-demand growth requests (like Request Composer) with data persistence
  // Use Cascade to add features (e.g., "Add file upload to this form")
  const triggerFoundationService = async (service: string) => {
    // Legacy function - now handled by AutomationTrigger component
    message.info('Please use the Configure button to set up this automation.');
  };

  const triggerALaCarteService = async (service: string) => {
    // Legacy function - now handled by AutomationTrigger component
    message.info('Please use the Configure button to set up this automation.');
  };

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

  const handleAutomationTrigger = async (automationData: any) => {
    setLoading(true);
    try {
      // Save automation configuration
      const interaction = {
        type: 'interaction' as const,
        action: `Automation Configured: ${automationData.title}`,
        service: automationData.service,
        response_data: {
          configuration: automationData.configuration,
          webhookUrl: automationData.webhookUrl,
          status: 'active',
          timestamp: automationData.timestamp
        },
        status: 'success' as const
      };
      
      await dataStorage.saveInteraction(interaction);
      await loadSavedData();
      
      // Update active automations
      setActiveAutomations(prev => {
        if (!prev.includes(automationData.service)) {
          return [...prev, automationData.service];
        }
        return prev;
      });
      
      // Add to automation history
      setAutomationHistory(prev => [{
        id: Date.now(),
        service: automationData.service,
        title: automationData.title,
        timestamp: automationData.timestamp,
        configuration: automationData.configuration
      }, ...prev]);
      
      // Store in localStorage for persistence
      localStorage.setItem('r1ai_active_automations', JSON.stringify([...activeAutomations, automationData.service]));
      
      setResponse(`${automationData.title} automation has been configured and activated!`);
    } catch (error) {
      console.error('Error configuring automation:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const getLastRun = (service: string) => {
    const history = automationHistory.find(item => item.service === service);
    return history ? new Date(history.timestamp).toLocaleDateString() : undefined;
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
      <Card title="Foundation Services (Automated Tasks) - $350/month" style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <AutomationTrigger
              title="Expense Tracking & Reporting"
              description="Automatically sync bank transactions, categorize expenses, and generate monthly reports"
              icon={<DollarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
              serviceType="expenseTracking"
              onTrigger={handleAutomationTrigger}
              isActive={activeAutomations.includes('expenseTracking')}
              lastRun={getLastRun('expenseTracking')}
            />
          </Col>
          <Col xs={24} md={12}>
            <AutomationTrigger
              title="Monthly Bookkeeping"
              description="Automated journal entries, account reconciliation, and financial statement generation"
              icon={<BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
              serviceType="bookkeeping"
              onTrigger={handleAutomationTrigger}
              isActive={activeAutomations.includes('bookkeeping')}
              lastRun={getLastRun('bookkeeping')}
            />
          </Col>
          <Col xs={24} md={12}>
            <AutomationTrigger
              title="Payroll Processing"
              description="Automated payroll calculations, tax withholdings, and direct deposit setup"
              icon={<TeamOutlined style={{ fontSize: '24px', color: '#722ed1' }} />}
              serviceType="payroll"
              onTrigger={handleAutomationTrigger}
              isActive={activeAutomations.includes('payroll')}
              lastRun={getLastRun('payroll')}
            />
          </Col>
          <Col xs={24} md={12}>
            <AutomationTrigger
              title="Tax Return Preparation"
              description="Automated document gathering, form filling, and tax calculation with filing reminders"
              icon={<FileTextOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />}
              serviceType="taxPrep"
              onTrigger={handleAutomationTrigger}
              isActive={activeAutomations.includes('taxPrep')}
              lastRun={getLastRun('taxPrep')}
            />
          </Col>
        </Row>
      </Card>

      {/* A La Carte Services Section */}
      <Card title="A La Carte Services (On-Demand) - $50 per service" style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <AutomationTrigger
              title="Marketing Campaign Setup"
              description="Create targeted marketing campaigns with automated lead tracking and ROI analysis"
              icon={<GlobalOutlined style={{ fontSize: '24px', color: '#eb2f96' }} />}
              serviceType="marketing"
              onTrigger={handleAutomationTrigger}
              isActive={activeAutomations.includes('marketing')}
              lastRun={getLastRun('marketing')}
            />
          </Col>
          <Col xs={24} md={12}>
            <AutomationTrigger
              title="Social Media Management"
              description="Automated posting, engagement tracking, and social media analytics across platforms"
              icon={<FacebookOutlined style={{ fontSize: '24px', color: '#1877f2' }} />}
              serviceType="socialMedia"
              onTrigger={handleAutomationTrigger}
              isActive={activeAutomations.includes('socialMedia')}
              lastRun={getLastRun('socialMedia')}
            />
          </Col>
          <Col xs={24} md={12}>
            <AutomationTrigger
              title="Email Campaign Creation"
              description="Design, send, and track email campaigns with automated follow-ups and analytics"
              icon={<MailOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
              serviceType="emailCampaign"
              onTrigger={handleAutomationTrigger}
              isActive={activeAutomations.includes('emailCampaign')}
              lastRun={getLastRun('emailCampaign')}
            />
          </Col>
          <Col xs={24} md={12}>
            <AutomationTrigger
              title="SEO Optimization"
              description="Automated SEO analysis, keyword tracking, and website optimization recommendations"
              icon={<SearchOutlined style={{ fontSize: '24px', color: '#fa541c' }} />}
              serviceType="seo"
              onTrigger={handleAutomationTrigger}
              isActive={activeAutomations.includes('seo')}
              lastRun={getLastRun('seo')}
            />
          </Col>
        </Row>
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