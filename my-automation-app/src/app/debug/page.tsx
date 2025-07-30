'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Alert, Divider, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { supabaseHelpers } from '../../lib/supabase';

const { Title, Text, Paragraph } = Typography;

const DebugPage = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Check localStorage user data
      const userStr = localStorage.getItem('r1ai_user');
      results.localStorage = {
        exists: !!userStr,
        data: userStr ? JSON.parse(userStr) : null
      };

      if (userStr) {
        const userData = JSON.parse(userStr);
        
        // Check if user exists in Supabase
        try {
          const userResult = await supabaseHelpers.getUserByEmail(userData.email);
          results.userInDatabase = {
            success: userResult.success,
            found: !!userResult.data,
            data: userResult.data,
            error: userResult.error
          };
        } catch (error) {
          results.userInDatabase = {
            success: false,
            error: 'Failed to query users table - table might not exist'
          };
        }

        // Check if business onboarding data exists
        try {
          const onboardingResult = await supabaseHelpers.getBusinessOnboarding(userData.id);
          results.businessOnboarding = {
            success: onboardingResult.success,
            found: !!onboardingResult.data,
            data: onboardingResult.data,
            error: onboardingResult.error
          };
        } catch (error) {
          results.businessOnboarding = {
            success: false,
            error: 'Failed to query business_onboarding table - table might not exist'
          };
        }

        // Test database connection
        try {
          const testResult = await supabaseHelpers.getAllData();
          results.databaseConnection = {
            success: testResult.success,
            error: testResult.error
          };
        } catch (error) {
          results.databaseConnection = {
            success: false,
            error: 'Database connection failed'
          };
        }
      }

    } catch (error) {
      results.error = error;
    }

    setDebugInfo(results);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px', 
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <Card style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Title level={2} style={{ color: '#1a1a2e', textAlign: 'center' }}>
            <InfoCircleOutlined style={{ marginRight: '12px' }} />
            R1 AI Debug Dashboard
          </Title>
          
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Button 
              type="primary" 
              loading={loading} 
              onClick={runDiagnostics}
              style={{ width: '100%' }}
            >
              Run Diagnostics
            </Button>

            {debugInfo.localStorage && (
              <Card size="small" title={
                <span>
                  {getStatusIcon(debugInfo.localStorage.exists)} 
                  {' '}LocalStorage User Data
                </span>
              }>
                {debugInfo.localStorage.exists ? (
                  <div>
                    <Text strong>User ID:</Text> {debugInfo.localStorage.data?.id}<br/>
                    <Text strong>Name:</Text> {debugInfo.localStorage.data?.fullName}<br/>
                    <Text strong>Email:</Text> {debugInfo.localStorage.data?.email}
                  </div>
                ) : (
                  <Alert type="error" message="No user data in localStorage. Please sign up/sign in first." />
                )}
              </Card>
            )}

            {debugInfo.userInDatabase && (
              <Card size="small" title={
                <span>
                  {getStatusIcon(debugInfo.userInDatabase.success && debugInfo.userInDatabase.found)} 
                  {' '}User in Database
                </span>
              }>
                {debugInfo.userInDatabase.success ? (
                  debugInfo.userInDatabase.found ? (
                    <div>
                      <Alert type="success" message="User found in Supabase database!" />
                      <Divider />
                      <Text strong>Database User ID:</Text> {debugInfo.userInDatabase.data?.id}<br/>
                      <Text strong>Full Name:</Text> {debugInfo.userInDatabase.data?.full_name}<br/>
                      <Text strong>Email:</Text> {debugInfo.userInDatabase.data?.email}<br/>
                      <Text strong>Business Name:</Text> {debugInfo.userInDatabase.data?.business_name}
                    </div>
                  ) : (
                    <Alert type="error" message="User not found in database. Please sign up again." />
                  )
                ) : (
                  <Alert type="error" message={`Database error: ${debugInfo.userInDatabase.error}`} />
                )}
              </Card>
            )}

            {debugInfo.businessOnboarding && (
              <Card size="small" title={
                <span>
                  {getStatusIcon(debugInfo.businessOnboarding.success && debugInfo.businessOnboarding.found)} 
                  {' '}Business Onboarding Data
                </span>
              }>
                {debugInfo.businessOnboarding.success ? (
                  debugInfo.businessOnboarding.found ? (
                    <div>
                      <Alert type="success" message="Business onboarding data found!" />
                      <Divider />
                      <Text strong>Business Type:</Text> {debugInfo.businessOnboarding.data?.business_type}<br/>
                      <Text strong>Industry:</Text> {debugInfo.businessOnboarding.data?.industry}<br/>
                      <Text strong>Company Size:</Text> {debugInfo.businessOnboarding.data?.company_size}<br/>
                      <Text strong>Revenue:</Text> {debugInfo.businessOnboarding.data?.annual_revenue}<br/>
                      <Text strong>Completed:</Text> {debugInfo.businessOnboarding.data?.onboarding_completed ? 'Yes' : 'No'}
                    </div>
                  ) : (
                    <Alert type="warning" message="No business onboarding data found. Please complete the onboarding form." />
                  )
                ) : (
                  <Alert type="error" message={`Database error: ${debugInfo.businessOnboarding.error}`} />
                )}
              </Card>
            )}

            {debugInfo.databaseConnection && (
              <Card size="small" title={
                <span>
                  {getStatusIcon(debugInfo.databaseConnection.success)} 
                  {' '}Database Connection
                </span>
              }>
                {debugInfo.databaseConnection.success ? (
                  <Alert type="success" message="Database connection successful!" />
                ) : (
                  <Alert type="error" message={`Connection failed: ${debugInfo.databaseConnection.error}`} />
                )}
              </Card>
            )}

            <Divider />
            
            <Alert
              type="info"
              message="Troubleshooting Steps"
              description={
                <div>
                  <Paragraph>
                    <Text strong>If you see errors above:</Text>
                  </Paragraph>
                  <ol>
                    <li><Text strong>Database tables missing:</Text> Run the SQL from COMPLETE_SUPABASE_SETUP.sql in your Supabase dashboard</li>
                    <li><Text strong>User not found:</Text> Sign up again to create a proper user account</li>
                    <li><Text strong>No onboarding data:</Text> Complete the onboarding form after signing up</li>
                    <li><Text strong>Connection failed:</Text> Check your .env.local file has correct Supabase credentials</li>
                  </ol>
                </div>
              }
            />
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default DebugPage;
