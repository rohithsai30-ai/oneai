'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Space, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, GlobalOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseHelpers } from '../../lib/supabase';
import bcrypt from 'bcryptjs';

const { Title, Text } = Typography;

const SignUpPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Check if email already exists
      const emailCheck = await supabaseHelpers.checkEmailExists(values.email);
      
      if (!emailCheck.success) {
        message.error('Error checking email. Please try again.');
        return;
      }
      
      if (emailCheck.exists) {
        message.error('An account with this email already exists. Please use a different email.');
        return;
      }
      
      // Hash the password for security
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(values.password, saltRounds);
      
      // Prepare user data for database
      const userData = {
        full_name: values.fullName,
        email: values.email.toLowerCase(),
        business_name: values.businessName,
        website: values.website || null,
        phone: values.phone || null,
        password_hash: passwordHash,
        status: 'active' as const
      };
      
      // Save user to Supabase
      const result = await supabaseHelpers.insertUser(userData);
      
      if (result.success) {
        message.success('Account created successfully! Welcome to R1 AI!');
        
        // Store user info in localStorage for the session
        const userInfo = {
          id: result.data?.id,
          fullName: values.fullName,
          email: values.email
        };
        localStorage.setItem('r1ai_user', JSON.stringify(userInfo));
        
        // Redirect to main dashboard (user can access onboarding from there)
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        message.error(`Account creation failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      message.error('Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: `
        linear-gradient(135deg, rgba(5, 15, 25, 0.98) 0%, rgba(10, 20, 35, 0.98) 50%, rgba(5, 15, 25, 0.98) 100%),
        radial-gradient(circle at 20% 80%, rgba(0, 255, 136, 0.4) 0%, transparent 60%),
        radial-gradient(circle at 80% 20%, rgba(0, 136, 255, 0.4) 0%, transparent 60%),
        radial-gradient(circle at 40% 40%, rgba(136, 0, 255, 0.3) 0%, transparent 60%)
      `,
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
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
        </g>
        
        {/* Processor Chips */}
        <g fill="url(#processorGradient)" opacity="0.8">
          <rect x="100" y="80" width="40" height="40" rx="4">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="250" y="180" width="35" height="35" rx="3">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite" />
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
      <Card style={{ 
        width: '100%', 
        maxWidth: '500px', 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            R1 AI
          </Title>
          <Text type="secondary">Create your account and get started</Text>
        </div>

        <Form
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please input your full name!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your full name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Enter your email"
            />
          </Form.Item>

          <Form.Item
            name="businessName"
            label="Business Name"
            rules={[{ required: true, message: 'Please input your business name!' }]}
          >
            <Input 
              prefix={<GlobalOutlined />} 
              placeholder="Enter your business name"
            />
          </Form.Item>

          <Form.Item
            name="website"
            label="Website (Optional)"
          >
            <Input 
              prefix={<GlobalOutlined />} 
              placeholder="https://yourwebsite.com"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number (Optional)"
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="Enter your phone number"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Create a password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirm your password"
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              { 
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('Please accept the terms and conditions!')),
              },
            ]}
          >
            <Checkbox>
              I agree to the <a href="#" style={{ color: '#1890ff' }}>Terms of Service</a> and{' '}
              <a href="#" style={{ color: '#1890ff' }}>Privacy Policy</a>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%', height: '45px' }}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Space direction="vertical" size="small">
            <Text type="secondary">
              Already have an account?{' '}
              <Link href="/signin" style={{ color: '#1890ff' }}>
                Sign in here
              </Link>
            </Text>
            <Link href="/" style={{ color: '#1890ff' }}>
              ← Back to Home
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default SignUpPage;
