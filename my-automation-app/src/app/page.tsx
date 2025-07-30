'use client'; // Marks this as a Client Component for useState

// This is a Next.js page for a frontend dashboard interfacing with n8n workflows.
// Built in Windsurf IDE (xAI) for AI-powered coding assistance.
// Requires Ant Design: run `npm install antd` in Windsurf's terminal.
// Replace webhook URLs with your actual n8n webhook endpoints (get from n8n UI).
// Use Windsurf's Cascade panel to debug fetch issues or add auth (e.g., "Add NextAuth.js to this page").
// Includes Sign In and Sign Up buttons in a header at the top.
// Now includes comprehensive data persistence for all user inputs and interactions.

import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Space, Input, Select, message, Modal, Typography, List, Tabs, Tag } from 'antd'; // Added Tabs and List for data display
import 'antd/dist/reset.css'; // Ant Design CSS for styling (v5+)
import { useRouter } from 'next/navigation';
import { dataStorage, localStorage as localStorageUtils, UserSubmission, UserInteraction } from '../utils/dataStorage';
import AutomationTrigger from '../components/AutomationTrigger';
import IXPWallet from '../components/IXPWallet';
import ChatBot from '../components/ChatBot';
import { DollarOutlined, GlobalOutlined, BookOutlined, TeamOutlined, FileTextOutlined, FacebookOutlined, MailOutlined, SearchOutlined } from '@ant-design/icons';
import { supabaseHelpers } from '../lib/supabase';
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
  const [historyVisible, setHistoryVisible] = useState(false);
  const [userWallet, setUserWallet] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

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
    // Get user info for IXP wallet
    const user = localStorage.getItem('r1ai_user');
    if (user) {
      const userData = JSON.parse(user);
      setUserInfo(userData);
      // Check if user has completed onboarding
      checkUserOnboardingStatus(userData.id);
    } else {
      setCheckingOnboarding(false);
    }
  }, []);

  // Auto-save draft data when inputs change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorageUtils.saveDraft({ requestType, requestDetails });
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [requestType, requestDetails]);

  // Check if user has completed onboarding
  const checkUserOnboardingStatus = async (userId: string) => {
    try {
      setCheckingOnboarding(true);
      const result = await supabaseHelpers.getBusinessOnboarding(userId);
      if (result.success && result.data && result.data.onboarding_completed) {
        setHasCompletedOnboarding(true);
      } else {
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setCheckingOnboarding(false);
    }
  };

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
      // Check if user has sufficient IXP balance
      if (userInfo?.id) {
        const walletResult = await supabaseHelpers.getIXPWallet(userInfo.id);
        if (walletResult.success && walletResult.data) {
          const requiredIXP = getServiceIXPCost(automationData.service);
          if (walletResult.data.balance < requiredIXP) {
            message.error(`Insufficient IXP balance. You need ${requiredIXP} IXP to activate this service.`);
            return;
          }
          
          // Deduct IXP for service activation
          await supabaseHelpers.updateIXPBalance(
            userInfo.id,
            requiredIXP,
            'debit',
            `Service Activation: ${automationData.title}`,
            automationData.service
          );
        }
      }

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
  
  const getServiceIXPCost = (serviceType: string) => {
    const costs = {
      expenseTracking: 15,
      bookkeeping: 20,
      payroll: 25,
      taxPrep: 30,
      marketing: 10,
      socialMedia: 8,
      emailCampaign: 12,
      seo: 15
    };
    return costs[serviceType as keyof typeof costs] || 10;
  };
  
  const getLastRun = (service: string) => {
    const history = automationHistory.find(item => item.service === service);
    return history ? new Date(history.timestamp).toLocaleDateString() : undefined;
  };

  // Check if user is logged in
  const isLoggedIn = userInfo !== null;

  if (!isLoggedIn) {
    // Show landing page for non-logged in users
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: `
          linear-gradient(135deg, rgba(5, 15, 25, 0.98) 0%, rgba(10, 20, 35, 0.98) 50%, rgba(5, 15, 25, 0.98) 100%),
          radial-gradient(circle at 20% 80%, rgba(0, 255, 136, 0.4) 0%, transparent 60%),
          radial-gradient(circle at 80% 20%, rgba(0, 136, 255, 0.4) 0%, transparent 60%),
          radial-gradient(circle at 40% 40%, rgba(136, 0, 255, 0.3) 0%, transparent 60%)
        `,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Animated AI Background Elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 48px,
              rgba(0, 255, 136, 0.15) 50px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 48px,
              rgba(0, 136, 255, 0.15) 50px
            )
          `,
          animation: 'gridMove 20s linear infinite'
        }} />
        
        {/* Floating AI Particles */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '4px',
          height: '4px',
          background: '#78dbff',
          borderRadius: '50%',
          boxShadow: '0 0 10px #78dbff',
          animation: 'float1 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '3px',
          height: '3px',
          background: '#ff77c6',
          borderRadius: '50%',
          boxShadow: '0 0 8px #ff77c6',
          animation: 'float2 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '30%',
          left: '20%',
          width: '5px',
          height: '5px',
          background: '#7877c6',
          borderRadius: '50%',
          boxShadow: '0 0 12px #7877c6',
          animation: 'float3 10s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '25%',
          width: '2px',
          height: '2px',
          background: '#78dbff',
          borderRadius: '50%',
          boxShadow: '0 0 6px #78dbff',
          animation: 'float1 7s ease-in-out infinite reverse'
        }} />
        
        {/* AI Processor Circuit Board */}
        <svg style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.6,
          pointerEvents: 'none'
        }}>
          <defs>
            <linearGradient id="processorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="1" />
              <stop offset="50%" stopColor="#0088ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#8800ff" stopOpacity="1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Circuit Board Traces */}
          <g stroke="url(#processorGradient)" strokeWidth="2" fill="none" filter="url(#glow)">
            {/* Horizontal traces */}
            <line x1="0" y1="100" x2="100%" y2="100">
              <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="8s" repeatCount="indefinite" />
            </line>
            <line x1="0" y1="200" x2="100%" y2="200">
              <animate attributeName="stroke-dasharray" values="500,500;0,1000;500,500" dur="6s" repeatCount="indefinite" />
            </line>
            <line x1="0" y1="300" x2="100%" y2="300">
              <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="10s" repeatCount="indefinite" />
            </line>
            <line x1="0" y1="400" x2="100%" y2="400">
              <animate attributeName="stroke-dasharray" values="750,250;0,1000;750,250" dur="7s" repeatCount="indefinite" />
            </line>
            
            {/* Vertical traces */}
            <line x1="150" y1="0" x2="150" y2="100%">
              <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="9s" repeatCount="indefinite" />
            </line>
            <line x1="300" y1="0" x2="300" y2="100%">
              <animate attributeName="stroke-dasharray" values="400,600;0,1000;400,600" dur="5s" repeatCount="indefinite" />
            </line>
            <line x1="450" y1="0" x2="450" y2="100%">
              <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="11s" repeatCount="indefinite" />
            </line>
            <line x1="600" y1="0" x2="600" y2="100%">
              <animate attributeName="stroke-dasharray" values="200,800;0,1000;200,800" dur="6s" repeatCount="indefinite" />
            </line>
          </g>
          
          {/* Processor Chips */}
          <g fill="url(#processorGradient)" opacity="0.8">
            <rect x="100" y="80" width="40" height="40" rx="4">
              <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
            </rect>
            <rect x="250" y="180" width="35" height="35" rx="3">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
            </rect>
            <rect x="400" y="120" width="45" height="45" rx="5">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite" />
            </rect>
            <rect x="550" y="280" width="30" height="30" rx="2">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3.5s" repeatCount="indefinite" />
            </rect>
          </g>
          
          {/* Data Flow Paths */}
          <path d="M 120,100 Q 200,50 300,100 Q 400,150 500,100" stroke="#00ff88" strokeWidth="3" fill="none" opacity="0.9">
            <animate attributeName="stroke-dasharray" values="0,500;500,0;0,500" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M 270,200 Q 350,250 450,200 Q 550,150 650,200" stroke="#0088ff" strokeWidth="3" fill="none" opacity="0.9">
            <animate attributeName="stroke-dasharray" values="250,250;0,500;250,250" dur="5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
          </path>
        </svg>
        
        {/* AI Processing Indicators */}
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          opacity: 1
        }}>
          <div style={{
            width: '80px',
            height: '6px',
            background: 'linear-gradient(90deg, transparent, #00ff88, transparent)',
            animation: 'processingBar1 2s ease-in-out infinite'
          }} />
          <div style={{
            width: '80px',
            height: '6px',
            background: 'linear-gradient(90deg, transparent, #0088ff, transparent)',
            animation: 'processingBar2 2.5s ease-in-out infinite'
          }} />
          <div style={{
            width: '80px',
            height: '6px',
            background: 'linear-gradient(90deg, transparent, #8800ff, transparent)',
            animation: 'processingBar3 3s ease-in-out infinite'
          }} />
        </div>
        
        {/* CPU Core Indicators */}
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          opacity: 1
        }}>
          {[...Array(16)].map((_, i) => (
            <div key={i} style={{
              width: '12px',
              height: '12px',
              background: i % 3 === 0 ? '#00ff88' : i % 3 === 1 ? '#0088ff' : '#8800ff',
              borderRadius: '1px',
              animation: `coreActivity${i % 4} ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`
            }} />)
          )}
        </div>
        
        {/* CSS Animations */}
        <style jsx>{`
          @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(100px, 100px); }
          }
          
          @keyframes float1 {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            33% { transform: translateY(-20px) translateX(10px); }
            66% { transform: translateY(10px) translateX(-5px); }
          }
          
          @keyframes float2 {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(15px) translateX(-10px); }
            50% { transform: translateY(-10px) translateX(15px); }
            75% { transform: translateY(5px) translateX(-5px); }
          }
          
          @keyframes float3 {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-25px) translateX(20px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          
          @keyframes processingBar1 {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
          }
          
          @keyframes processingBar2 {
            0%, 100% { transform: translateX(100%); }
            50% { transform: translateX(-100%); }
          }
          
          @keyframes processingBar3 {
            0%, 100% { transform: translateX(-100%); }
            25% { transform: translateX(0%); }
            75% { transform: translateX(100%); }
          }
          
          @keyframes coreActivity0 {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          
          @keyframes coreActivity1 {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            33% { opacity: 1; transform: scale(1.1); }
            66% { opacity: 0.6; transform: scale(1.3); }
          }
          
          @keyframes coreActivity2 {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            25% { opacity: 0.8; transform: scale(1.4); }
            75% { opacity: 1; transform: scale(1.1); }
          }
          
          @keyframes coreActivity3 {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            40% { opacity: 1; transform: scale(1.2); }
            80% { opacity: 0.7; transform: scale(1.3); }
          }
        `}</style>
        <div style={{ maxWidth: '1200px', width: '100%', padding: '20px', position: 'relative', zIndex: 10 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <Title level={1} style={{ color: 'white', margin: 0 }}>R1 AI</Title>
            <Space>
              <Button size="large" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button type="primary" size="large" onClick={handleSignUp}>
                Sign Up
              </Button>
            </Space>
          </div>

          {/* Hero Section */}
          <Card style={{ 
            textAlign: 'center', 
            marginBottom: '40px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: '16px' }}>
              Stop Managing Tasks, Start Building Your Business
            </Title>
            <Paragraph style={{ fontSize: '18px', marginBottom: '32px' }}>
              Your AI-powered business operations platform. Automate bookkeeping, payroll, 
              expense tracking, and more with our intelligent automation suite.
            </Paragraph>
            
            {/* Process Steps */}
            <div style={{ marginBottom: '32px' }}>
              <Title level={4} style={{ color: '#722ed1' }}>How It Works</Title>
              <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      background: '#1890ff', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      margin: '0 auto 16px'
                    }}>1</div>
                    <Title level={5}>Sign Up & Onboard</Title>
                    <Paragraph>Create your account and complete our quick onboarding process</Paragraph>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      background: '#52c41a', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      margin: '0 auto 16px'
                    }}>2</div>
                    <Title level={5}>Choose Your Services</Title>
                    <Paragraph>Select from Foundation Services or À La Carte options</Paragraph>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      background: '#722ed1', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      margin: '0 auto 16px'
                    }}>3</div>
                    <Title level={5}>Automate & Grow</Title>
                    <Paragraph>Watch your business operations run automatically</Paragraph>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>

          {/* Services Overview */}
          <Title level={3} style={{ textAlign: 'center', marginBottom: '24px', color: '#1890ff' }}>
            Our Services
          </Title>
          
          {/* Foundation Services */}
          <Card title="Foundation Services - $350/month" style={{ 
            marginBottom: '24px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <DollarOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }} />
                  <Title level={5}>Expense Tracking</Title>
                  <Paragraph>Automated expense categorization and reporting</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <BookOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
                  <Title level={5}>Monthly Bookkeeping</Title>
                  <Paragraph>Complete bookkeeping and financial statements</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <TeamOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: '8px' }} />
                  <Title level={5}>Payroll Processing</Title>
                  <Paragraph>Automated payroll and tax calculations</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <FileTextOutlined style={{ fontSize: '32px', color: '#fa8c16', marginBottom: '8px' }} />
                  <Title level={5}>Tax Preparation</Title>
                  <Paragraph>Annual tax return preparation and filing</Paragraph>
                </div>
              </Col>
            </Row>
          </Card>
          
          {/* À La Carte Services */}
          <Card title="À La Carte Services - $50 per service" style={{ 
            marginBottom: '24px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <GlobalOutlined style={{ fontSize: '32px', color: '#eb2f96', marginBottom: '8px' }} />
                  <Title level={5}>Marketing Campaigns</Title>
                  <Paragraph>Targeted marketing with ROI tracking</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <FacebookOutlined style={{ fontSize: '32px', color: '#1877f2', marginBottom: '8px' }} />
                  <Title level={5}>Social Media</Title>
                  <Paragraph>Automated posting and engagement</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <MailOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }} />
                  <Title level={5}>Email Campaigns</Title>
                  <Paragraph>Design and track email marketing</Paragraph>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <SearchOutlined style={{ fontSize: '32px', color: '#fa541c', marginBottom: '8px' }} />
                  <Title level={5}>SEO Optimization</Title>
                  <Paragraph>Website optimization and analysis</Paragraph>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    );
  }

  // Show user dashboard for logged-in users
  return (
    <div style={{ 
      minHeight: '100vh',
      background: `
        linear-gradient(135deg, rgba(5, 15, 25, 0.98) 0%, rgba(10, 20, 35, 0.98) 50%, rgba(5, 15, 25, 0.98) 100%),
        radial-gradient(circle at 20% 80%, rgba(0, 255, 136, 0.4) 0%, transparent 60%),
        radial-gradient(circle at 80% 20%, rgba(0, 136, 255, 0.4) 0%, transparent 60%),
        radial-gradient(circle at 40% 40%, rgba(136, 0, 255, 0.3) 0%, transparent 60%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated AI Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 48px,
            rgba(0, 255, 136, 0.15) 50px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 48px,
            rgba(0, 136, 255, 0.15) 50px
          )
        `,
        animation: 'gridMove 20s linear infinite'
      }} />
      
      {/* Floating AI Particles */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '4px',
        height: '4px',
        background: '#78dbff',
        borderRadius: '50%',
        boxShadow: '0 0 10px #78dbff',
        animation: 'float1 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        width: '3px',
        height: '3px',
        background: '#ff77c6',
        borderRadius: '50%',
        boxShadow: '0 0 8px #ff77c6',
        animation: 'float2 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '30%',
        left: '20%',
        width: '5px',
        height: '5px',
        background: '#7877c6',
        borderRadius: '50%',
        boxShadow: '0 0 12px #7877c6',
        animation: 'float3 10s ease-in-out infinite'
      }} />
      
      {/* AI Processor Circuit Board */}
      <svg style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.6,
        pointerEvents: 'none'
      }}>
        <defs>
          <linearGradient id="dashboardProcessorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="1" />
            <stop offset="50%" stopColor="#0088ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8800ff" stopOpacity="1" />
          </linearGradient>
          <filter id="dashboardGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Circuit Board Traces */}
        <g stroke="url(#dashboardProcessorGradient)" strokeWidth="2" fill="none" filter="url(#dashboardGlow)">
          <line x1="0" y1="100" x2="100%" y2="100">
            <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="8s" repeatCount="indefinite" />
          </line>
          <line x1="0" y1="200" x2="100%" y2="200">
            <animate attributeName="stroke-dasharray" values="500,500;0,1000;500,500" dur="6s" repeatCount="indefinite" />
          </line>
          <line x1="150" y1="0" x2="150" y2="100%">
            <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="9s" repeatCount="indefinite" />
          </line>
          <line x1="300" y1="0" x2="300" y2="100%">
            <animate attributeName="stroke-dasharray" values="400,600;0,1000;400,600" dur="5s" repeatCount="indefinite" />
          </line>
          <line x1="450" y1="0" x2="450" y2="100%">
            <animate attributeName="stroke-dasharray" values="0,1000;1000,0;0,1000" dur="11s" repeatCount="indefinite" />
          </line>
        </g>
        
        {/* Processor Chips */}
        <g fill="url(#dashboardProcessorGradient)" opacity="0.8">
          <rect x="100" y="80" width="40" height="40" rx="4">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="250" y="180" width="35" height="35" rx="3">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite" />
          </rect>
          <rect x="400" y="120" width="45" height="45" rx="5">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2.5s" repeatCount="indefinite" />
          </rect>
        </g>
      </svg>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(100px, 100px); }
        }
        
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-5px); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(15px) translateX(-10px); }
          50% { transform: translateY(-10px) translateX(15px); }
          75% { transform: translateY(5px) translateX(-5px); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-25px) translateX(20px); }
        }
      `}</style>
      
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
      {/* Header with user info and logout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Title level={2} style={{ margin: 0, color: 'white' }}>R1 AI Dashboard</Title>
        <Space>
          <span style={{ color: 'white', fontSize: '16px' }}>Welcome, {userInfo.fullName}!</span>
          <Button onClick={() => {
            localStorage.removeItem('r1ai_user');
            setUserInfo(null);
            message.success('Logged out successfully');
          }}>
            Logout
          </Button>
        </Space>
      </div>

      {/* Main Dashboard Content */}
      <Row gutter={[24, 24]}>
        {/* Left Column - Smart Onboarding/Business Insights */}
        <Col xs={24} lg={12}>
          <Card 
            title={checkingOnboarding ? "Loading..." : hasCompletedOnboarding ? "Business Insights" : "Get Started"} 
            style={{ 
              textAlign: 'center', 
              height: '300px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            {checkingOnboarding ? (
              <div>
                <Title level={3} style={{ color: '#1890ff', marginBottom: '16px' }}>
                  Checking your profile...
                </Title>
                <Paragraph>Please wait while we load your information.</Paragraph>
              </div>
            ) : hasCompletedOnboarding ? (
              <div>
                <Title level={3} style={{ color: '#52c41a', marginBottom: '16px' }}>
                  Welcome Back! 🎯
                </Title>
                <Paragraph style={{ marginBottom: '24px' }}>
                  Your business profile is complete. View your personalized insights and recommendations.
                </Paragraph>
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={() => router.push('/business-insights')}
                  style={{ minWidth: '200px', background: '#52c41a', borderColor: '#52c41a' }}
                >
                  View Business Insights
                </Button>
              </div>
            ) : (
              <div>
                <Title level={3} style={{ color: '#1890ff', marginBottom: '16px' }}>
                  Ready to Automate Your Business?
                </Title>
                <Paragraph style={{ marginBottom: '24px' }}>
                  Let's set up your automation suite. Choose how you'd like to get started:
                </Paragraph>
                <Space direction="vertical" size="large">
                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={() => router.push('/onboarding')}
                    style={{ minWidth: '200px' }}
                  >
                    Fill Out Form
                  </Button>
                  <Button 
                    size="large" 
                    onClick={() => window.open('https://calendly.com/r1ai-onboarding', '_blank')}
                    style={{ minWidth: '200px' }}
                  >
                    Schedule a Call
                  </Button>
                </Space>
              </div>
            )}
          </Card>
        </Col>
        
        {/* Right Column - IXP Wallet */}
        <Col xs={24} lg={12}>
          <Card title="Your IXP Wallet" style={{ 
            height: '300px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Title level={2} style={{ color: '#1890ff', marginBottom: '16px' }}>
                Hey {userInfo.fullName}!
              </Title>
              <Paragraph style={{ fontSize: '18px', marginBottom: '20px' }}>
                You have <strong style={{ color: '#52c41a' }}>975 IXP Credits</strong>
              </Paragraph>
              <Space>
                <Button type="primary" onClick={() => router.push('/payment')}>
                  Buy More Credits
                </Button>
                <Button onClick={() => setHistoryVisible(true)}>
                  View History
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Compact Requests Section */}
      <Card title="Recent Activity" size="small" style={{ 
        marginTop: '24px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <List
          size="small"
          dataSource={[...savedData.interactions, ...savedData.submissions].slice(0, 3)}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={'action' in item ? item.action : item.requestType}
                description={`${'service' in item ? item.service : 'General'} | ${new Date(item.timestamp).toLocaleDateString()}`}
              />
              <Tag color={item.status === 'success' ? 'green' : item.status === 'error' ? 'red' : 'blue'}>
                {item.status}
              </Tag>
            </List.Item>
          )}
          locale={{ emptyText: 'No recent activity' }}
        />
      </Card>
      
      {/* Foundation Services Section */}
      <Card title="Foundation Services (Automated Tasks) - $350/month" style={{ 
        marginTop: '24px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
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
      <Card title="À La Carte Services (On-Demand) - $50 per service" style={{ 
        marginTop: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
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
      


      {/* Intelligent Request Composer */}
      <Card title="Intelligent Request Composer" style={{ 
        marginTop: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Select
              placeholder="Select request type"
              value={requestType}
              onChange={setRequestType}
              style={{ width: '100%', marginBottom: '16px' }}
            >
              <Select.Option value="custom">Custom Request</Select.Option>
              <Select.Option value="analysis">Business Analysis</Select.Option>
              <Select.Option value="research">Market Research</Select.Option>
              <Select.Option value="planning">Strategic Planning</Select.Option>
            </Select>
          </Col>
          <Col xs={24} md={12}>
            <Button 
              type="primary" 
              loading={loading}
              onClick={async () => {
                if (!requestType || !requestDetails.trim()) return;
                setLoading(true);
                try {
                  const submission = {
                    type: 'submission' as const,
                    requestType,
                    requestDetails,
                    status: 'pending' as const
                  };
                  await dataStorage.saveSubmission(submission);
                  await loadSavedData();
                  setRequestType('');
                  setRequestDetails('');
                  message.success('Request submitted successfully!');
                } catch (error) {
                  message.error('Failed to submit request');
                } finally {
                  setLoading(false);
                }
              }}
              style={{ width: '100%' }}
              disabled={!requestType || !requestDetails.trim()}
            >
              Submit Request
            </Button>
          </Col>
        </Row>
        <TextArea
          placeholder="Describe your request in detail..."
          value={requestDetails}
          onChange={(e) => setRequestDetails(e.target.value)}
          rows={3}
          style={{ marginTop: '8px' }}
        />
      </Card>
      
      {/* Hidden - Original Foundation Services Section */}
      <div style={{ display: 'none' }}>
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
      </div>

      {/* Response Display */}
      {response && (
        <Card title="Response from Automation" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </Card>
      )}
    </div>
    </div>
  );

};

export default DashboardPage;