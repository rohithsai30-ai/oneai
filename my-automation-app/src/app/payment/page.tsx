'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Radio, InputNumber, Form, message, Row, Col, Divider, Tag } from 'antd';
import { CreditCardOutlined, TrophyOutlined, CheckCircleOutlined, StarOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { supabaseHelpers } from '../../lib/supabase';

const { Title, Text, Paragraph } = Typography;

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('founder');
  const [customIXP, setCustomIXP] = useState<number>(100);
  const [paymentType, setPaymentType] = useState<'subscription' | 'credits'>('subscription');
  const [userInfo, setUserInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Get user info from localStorage
    const user = localStorage.getItem('r1ai_user');
    if (user) {
      setUserInfo(JSON.parse(user));
    } else {
      router.push('/signup');
    }
  }, [router]);

  const subscriptionPlans = [
    {
      id: 'founder',
      name: 'Founder\'s Suite',
      price: 297,
      ixp: 75,
      color: '#52c41a',
      popular: false,
      features: [
        'Core financial services included',
        '75 IXP monthly allotment',
        'AI-powered request composer',
        'Basic business insights',
        'Email support'
      ]
    },
    {
      id: 'growth',
      name: 'Growth Partner',
      price: 597,
      ixp: 150,
      color: '#1890ff',
      popular: true,
      features: [
        'All Foundation services',
        '150 IXP monthly allotment',
        'Growth services included',
        'Advanced business analytics',
        'Priority support',
        'Quarterly strategy sessions'
      ]
    },
    {
      id: 'scale',
      name: 'Scale OS',
      price: 1197,
      ixp: 350,
      color: '#722ed1',
      popular: false,
      features: [
        'All Growth Partner services',
        '350 IXP monthly allotment',
        'Unlimited à la carte services',
        'Dedicated account manager',
        'Monthly strategy calls',
        'Custom integrations'
      ]
    }
  ];

  const creditPackages = [
    { ixp: 50, price: 49, bonus: 0 },
    { ixp: 100, price: 89, bonus: 10 },
    { ixp: 250, price: 199, bonus: 50 },
    { ixp: 500, price: 349, bonus: 150 }
  ];

  const handleSubscriptionPayment = async (planId: string) => {
    setLoading(true);
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan || !userInfo?.id) {
        message.error('Invalid plan or user information');
        return;
      }

      // Simulate payment processing (replace with actual Stripe integration)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create/update IXP wallet with new subscription
      const walletResult = await supabaseHelpers.getIXPWallet(userInfo.id);
      
      if (walletResult.success && walletResult.data) {
        // Update existing wallet
        await supabaseHelpers.updateIXPBalance(
          userInfo.id,
          plan.ixp,
          'credit',
          `Monthly allowance - ${plan.name}`,
          'subscription'
        );
      } else {
        // Create new wallet
        await supabaseHelpers.createIXPWallet(userInfo.id, plan.id as any);
      }

      // Add payment history
      await supabaseHelpers.addPaymentHistory({
        user_id: userInfo.id,
        amount: plan.price,
        currency: 'USD',
        payment_method: 'credit_card',
        payment_status: 'completed',
        subscription_tier: plan.id,
        description: `${plan.name} subscription`
      });

      message.success(`Successfully subscribed to ${plan.name}!`);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Payment error:', error);
      message.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreditPurchase = async (ixpAmount: number, price: number, bonus: number = 0) => {
    setLoading(true);
    try {
      if (!userInfo?.id) {
        message.error('User information not found');
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const totalIXP = ixpAmount + bonus;

      // Add IXP credits to wallet
      await supabaseHelpers.updateIXPBalance(
        userInfo.id,
        totalIXP,
        'credit',
        `IXP Credit Purchase - ${ixpAmount} IXP${bonus > 0 ? ` + ${bonus} bonus` : ''}`,
        'purchase'
      );

      // Add payment history
      await supabaseHelpers.addPaymentHistory({
        user_id: userInfo.id,
        amount: price,
        currency: 'USD',
        payment_method: 'credit_card',
        payment_status: 'completed',
        ixp_credits_purchased: totalIXP,
        description: `IXP Credits Purchase - ${totalIXP} IXP`
      });

      message.success(`Successfully purchased ${totalIXP} IXP credits!`);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Payment error:', error);
      message.error('Payment failed. Please try again.');
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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card style={{ marginBottom: '20px', textAlign: 'center' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            <CreditCardOutlined /> Choose Your Plan
          </Title>
          <Paragraph>
            Select a subscription plan or purchase IXP credits to power your business automation.
          </Paragraph>
          
          <Radio.Group 
            value={paymentType} 
            onChange={(e) => setPaymentType(e.target.value)}
            style={{ marginBottom: '20px' }}
          >
            <Radio.Button value="subscription">Monthly Subscription</Radio.Button>
            <Radio.Button value="credits">IXP Credits</Radio.Button>
          </Radio.Group>
        </Card>

        {paymentType === 'subscription' ? (
          <Row gutter={[24, 24]}>
            {subscriptionPlans.map((plan) => (
              <Col xs={24} md={8} key={plan.id}>
                <Card
                  hoverable
                  style={{ 
                    height: '100%',
                    border: selectedPlan === plan.id ? `2px solid ${plan.color}` : '1px solid #d9d9d9',
                    position: 'relative'
                  }}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '20px',
                      background: '#ff4d4f',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Title level={3} style={{ color: plan.color, marginBottom: '8px' }}>
                      {plan.name}
                    </Title>
                    <div style={{ marginBottom: '16px' }}>
                      <Text style={{ fontSize: '36px', fontWeight: 'bold' }}>${plan.price}</Text>
                      <Text type="secondary">/month</Text>
                    </div>
                    <Tag color={plan.color} style={{ marginBottom: '16px' }}>
                      <TrophyOutlined /> {plan.ixp} IXP Monthly
                    </Tag>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    {plan.features.map((feature, index) => (
                      <div key={index} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                        <CheckCircleOutlined style={{ color: plan.color, marginRight: '8px' }} />
                        <Text>{feature}</Text>
                      </div>
                    ))}
                  </div>

                  <Button
                    type={selectedPlan === plan.id ? "primary" : "default"}
                    size="large"
                    block
                    loading={loading && selectedPlan === plan.id}
                    onClick={() => handleSubscriptionPayment(plan.id)}
                    style={{ 
                      backgroundColor: selectedPlan === plan.id ? plan.color : undefined,
                      borderColor: plan.color
                    }}
                  >
                    {selectedPlan === plan.id ? 'Subscribe Now' : 'Select Plan'}
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={[24, 24]}>
            {creditPackages.map((pkg, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card
                  hoverable
                  style={{ textAlign: 'center', height: '100%' }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <TrophyOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
                    <Title level={4}>{pkg.ixp + pkg.bonus} IXP</Title>
                    {pkg.bonus > 0 && (
                      <Tag color="gold">
                        <StarOutlined /> +{pkg.bonus} Bonus
                      </Tag>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>${pkg.price}</Text>
                    <div>
                      <Text type="secondary">
                        ${(pkg.price / (pkg.ixp + pkg.bonus)).toFixed(2)} per IXP
                      </Text>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading}
                    onClick={() => handleCreditPurchase(pkg.ixp, pkg.price, pkg.bonus)}
                  >
                    Purchase Credits
                  </Button>
                </Card>
              </Col>
            ))}
            
            <Col xs={24}>
              <Card title="Custom Amount" style={{ textAlign: 'center' }}>
                <Form layout="inline" style={{ justifyContent: 'center' }}>
                  <Form.Item label="IXP Amount">
                    <InputNumber
                      min={10}
                      max={1000}
                      value={customIXP}
                      onChange={(value) => setCustomIXP(value || 100)}
                      style={{ width: '120px' }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      loading={loading}
                      onClick={() => handleCreditPurchase(customIXP, customIXP * 0.99, 0)}
                    >
                      Buy {customIXP} IXP for ${(customIXP * 0.99).toFixed(0)}
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        )}

        <Card style={{ marginTop: '20px', textAlign: 'center' }}>
          <Title level={4}>Secure Payment</Title>
          <Text type="secondary">
            All payments are processed securely. Your card information is never stored on our servers.
            <br />
            30-day money-back guarantee on all subscription plans.
          </Text>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
