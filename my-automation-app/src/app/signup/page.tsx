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
        localStorage.setItem('r1ai_user', JSON.stringify({
          id: result.data?.id,
          fullName: values.fullName,
          email: values.email,
          businessName: values.businessName
        }));
        
        // Redirect to dashboard after successful signup
        setTimeout(() => {
          router.push('/onboarding');
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card style={{ width: '100%', maxWidth: '500px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
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
