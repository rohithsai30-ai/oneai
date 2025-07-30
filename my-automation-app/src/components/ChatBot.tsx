'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Input, Avatar, Typography, Space, Divider } from 'antd';
import { MessageOutlined, SendOutlined, RobotOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages after component mounts to prevent hydration errors
  useEffect(() => {
    setMounted(true);
    setMessages([
      {
        id: 1,
        text: "👋 Hi! I'm R1 AI Assistant. I can help you learn about our automation services, answer questions about pricing, or guide you through getting started. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const predefinedResponses: { [key: string]: string } = {
    'hello': "Hello! Welcome to R1 AI. I'm here to help you automate your business processes. What would you like to know?",
    'hi': "Hi there! 👋 Ready to revolutionize your business with AI automation? Ask me anything!",
    'pricing': "Our pricing is based on IXP credits:\n\n💎 Founder Plan: 1,000 IXP - $99\n🚀 Growth Plan: 5,000 IXP - $399\n⚡ Scale Plan: 15,000 IXP - $999\n\nEach automation service costs different IXP amounts. Would you like to know more about specific services?",
    'services': "We offer two main categories:\n\n🏗️ **Foundation Services:**\n• Expense Tracking (50 IXP)\n• Bookkeeping (100 IXP)\n• Payroll Processing (150 IXP)\n• Tax Return Prep (200 IXP)\n\n🎯 **À La Carte Services:**\n• Marketing Campaigns (75 IXP)\n• Social Media Management (50 IXP)\n• Email Campaigns (25 IXP)\n• SEO Optimization (100 IXP)\n\nWhich category interests you most?",
    'how it works': "R1 AI works in 3 simple steps:\n\n1️⃣ **Onboarding**: Tell us about your business\n2️⃣ **Setup**: We configure automations for your needs\n3️⃣ **Activate**: Your business runs on autopilot!\n\nOur AI analyzes your business and recommends the best automation strategies. Want to get started?",
    'demo': "I'd love to show you a demo! You can:\n\n📝 Fill out our quick onboarding form\n📞 Schedule a personalized call\n🎮 Try our interactive dashboard\n\nWhich option sounds best to you?",
    'support': "I'm here to help! For technical support:\n\n💬 Chat with me for quick questions\n📧 Email: support@r1ai.com\n📞 Call: 1-800-R1-AI-HELP\n🕐 Hours: 24/7 AI support, human support 9AM-6PM EST\n\nWhat specific issue can I help you with?",
    'features': "R1 AI features include:\n\n🤖 **AI-Powered Automation**\n📊 **Business Intelligence Dashboard**\n💰 **IXP Credit System**\n🔗 **Seamless Integrations**\n📈 **Performance Analytics**\n🛡️ **Enterprise Security**\n\nWant details on any specific feature?"
  };

  const getRandomResponse = () => {
    const responses = [
      "That's a great question! Let me connect you with our team for detailed information. You can schedule a call or fill out our onboarding form to get personalized assistance.",
      "I'd be happy to help! For specific questions like this, our human experts can provide the best guidance. Would you like to schedule a consultation?",
      "Thanks for asking! While I can help with general information, our specialists can give you detailed answers. Shall I help you get in touch with them?",
      "Interesting question! For the most accurate and up-to-date information, I recommend speaking with our team directly. Would you like me to help you schedule a call?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Check for exact matches first
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (message.includes(key)) {
        return response;
      }
    }
    
    // Check for common business automation keywords
    if (message.includes('automat') || message.includes('workflow')) {
      return "Automation is our specialty! 🤖 We can automate everything from expense tracking to marketing campaigns. Our AI learns your business patterns and optimizes processes automatically. What specific area would you like to automate?";
    }
    
    if (message.includes('cost') || message.includes('price') || message.includes('expensive')) {
      return predefinedResponses.pricing;
    }
    
    if (message.includes('start') || message.includes('begin') || message.includes('onboard')) {
      return "Getting started is easy! 🚀\n\n1. Sign up for a free account\n2. Complete our 5-minute business assessment\n3. Get personalized automation recommendations\n4. Activate your first automation\n\nReady to begin your automation journey?";
    }
    
    if (message.includes('business') || message.includes('company')) {
      return "We work with businesses of all sizes! 🏢 From startups to enterprises, our AI adapts to your specific needs. We've helped companies save 40+ hours per week through intelligent automation. What type of business are you running?";
    }
    
    if (message.includes('ai') || message.includes('artificial intelligence')) {
      return "Our AI is designed specifically for business automation! 🧠 It learns from your data, predicts needs, and optimizes workflows automatically. Unlike generic AI, R1 AI understands business processes deeply. Want to see it in action?";
    }
    
    return getRandomResponse();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: "💰 View Pricing", action: () => setInputValue("What are your pricing plans?") },
    { text: "🚀 Get Started", action: () => setInputValue("How do I get started?") },
    { text: "🤖 Learn About AI", action: () => setInputValue("Tell me about your AI features") },
    { text: "📞 Schedule Demo", action: () => setInputValue("I want to see a demo") }
  ];

  // Prevent hydration errors by not rendering until mounted
  if (!mounted) {
    return null;
  }

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000
      }}>
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
            border: 'none',
            boxShadow: '0 8px 24px rgba(24, 144, 255, 0.4)',
            animation: 'pulse 2s infinite'
          }}
        />
        <style jsx>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '380px',
      height: '500px',
      zIndex: 1000
    }}>
      <Card
        style={{
          height: '100%',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: 0, height: '100%' }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          color: 'white',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Space>
            <Avatar 
              icon={<RobotOutlined />} 
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }} 
            />
            <div>
              <Text strong style={{ color: 'white', fontSize: '16px' }}>R1 AI Assistant</Text>
              <br />
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                🟢 Online • Typically replies instantly
              </Text>
            </div>
          </Space>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setIsOpen(false)}
            style={{ color: 'white' }}
          />
        </div>

        {/* Messages */}
        <div style={{
          height: 'calc(100% - 140px)',
          overflowY: 'auto',
          padding: '16px',
          background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)'
        }}>
          {messages.map((message) => (
            <div key={message.id} style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                {message.sender === 'bot' && (
                  <Avatar 
                    icon={<RobotOutlined />} 
                    size="small"
                    style={{ 
                      background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                      flexShrink: 0
                    }} 
                  />
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: message.sender === 'user' 
                    ? 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)'
                    : 'rgba(240, 242, 247, 0.8)',
                  color: message.sender === 'user' ? 'white' : '#333',
                  whiteSpace: 'pre-line',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {message.text}
                </div>
                {message.sender === 'user' && (
                  <Avatar 
                    icon={<UserOutlined />} 
                    size="small"
                    style={{ 
                      background: '#52c41a',
                      flexShrink: 0
                    }} 
                  />
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Avatar 
                icon={<RobotOutlined />} 
                size="small"
                style={{ 
                  background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  flexShrink: 0
                }} 
              />
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px',
                background: 'rgba(240, 242, 247, 0.8)',
                fontSize: '14px'
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#1890ff',
                    animation: 'typing 1.4s infinite ease-in-out'
                  }} />
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#1890ff',
                    animation: 'typing 1.4s infinite ease-in-out 0.2s'
                  }} />
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#1890ff',
                    animation: 'typing 1.4s infinite ease-in-out 0.4s'
                  }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div style={{ padding: '8px 16px' }}>
            <Text style={{ fontSize: '12px', color: '#666', marginBottom: '8px', display: 'block' }}>
              Quick actions:
            </Text>
            <Space wrap size={[4, 4]}>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  size="small"
                  onClick={action.action}
                  style={{
                    fontSize: '11px',
                    height: '24px',
                    borderRadius: '12px',
                    background: 'rgba(24, 144, 255, 0.1)',
                    borderColor: 'rgba(24, 144, 255, 0.3)',
                    color: '#1890ff'
                  }}
                >
                  {action.text}
                </Button>
              ))}
            </Space>
            <Divider style={{ margin: '8px 0' }} />
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(240, 242, 247, 0.8)',
          background: 'white'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{
                flex: 1,
                borderRadius: '12px',
                border: '1px solid rgba(240, 242, 247, 0.8)',
                resize: 'none'
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                border: 'none',
                height: '32px'
              }}
            />
          </div>
        </div>
      </Card>

      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
