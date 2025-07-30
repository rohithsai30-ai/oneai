'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Tag, Progress, List, Modal, Statistic, Row, Col, message } from 'antd';
import { WalletOutlined, PlusOutlined, HistoryOutlined, CreditCardOutlined, TrophyOutlined } from '@ant-design/icons';
import { supabaseHelpers } from '../lib/supabase';

const { Title, Text } = Typography;

interface IXPWalletProps {
  userId: string;
  onPurchaseClick: () => void;
}

const IXPWallet: React.FC<IXPWalletProps> = ({ userId, onPurchaseClick }) => {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyVisible, setHistoryVisible] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, [userId]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      // Get wallet data
      const walletResult = await supabaseHelpers.getIXPWallet(userId);
      if (walletResult.success && walletResult.data) {
        setWallet(walletResult.data);
      } else {
        // Create wallet if it doesn't exist
        const createResult = await supabaseHelpers.createIXPWallet(userId, 'founder');
        if (createResult.success) {
          setWallet(createResult.data);
        }
      }

      // Get transaction history
      const transactionsResult = await supabaseHelpers.getIXPTransactions(userId, 20);
      if (transactionsResult.success) {
        setTransactions(transactionsResult.data || []);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      message.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier: string) => {
    const tierInfo = {
      founder: { name: 'Founder\'s Suite', color: '#52c41a', allowance: 75 },
      growth: { name: 'Growth Partner', color: '#1890ff', allowance: 150 },
      scale: { name: 'Scale OS', color: '#722ed1', allowance: 350 }
    };
    return tierInfo[tier as keyof typeof tierInfo] || tierInfo.founder;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
      case 'allowance':
        return <PlusOutlined style={{ color: '#52c41a' }} />;
      case 'debit':
      case 'purchase':
        return <CreditCardOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <HistoryOutlined />;
    }
  };

  const formatTransactionDescription = (transaction: any) => {
    const amount = transaction.type === 'credit' || transaction.type === 'allowance' ? 
      `+${transaction.amount}` : `-${transaction.amount}`;
    const color = transaction.type === 'credit' || transaction.type === 'allowance' ? 
      '#52c41a' : '#ff4d4f';
    
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text strong>{transaction.description}</Text>
          {transaction.service_type && (
            <div><Text type="secondary">{transaction.service_type}</Text></div>
          )}
          <div><Text type="secondary">{new Date(transaction.created_at).toLocaleDateString()}</Text></div>
        </div>
        <Text strong style={{ color, fontSize: '16px' }}>
          {amount} IXP
        </Text>
      </div>
    );
  };

  if (loading) {
    return (
      <Card loading={true} style={{ marginBottom: '20px' }}>
        <div style={{ height: '200px' }} />
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <WalletOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4}>Wallet Not Found</Title>
          <Button type="primary" onClick={loadWalletData}>
            Create Wallet
          </Button>
        </div>
      </Card>
    );
  }

  const tierInfo = getTierInfo(wallet.subscription_tier);
  const balancePercentage = (wallet.balance / wallet.monthly_allowance) * 100;

  return (
    <>
      <Card 
        title={
          <Space>
            <WalletOutlined />
            <span>IXP Wallet</span>
            <Tag color={tierInfo.color}>{tierInfo.name}</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button 
              type="text" 
              icon={<HistoryOutlined />}
              onClick={() => setHistoryVisible(true)}
            >
              History
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={onPurchaseClick}
            >
              Buy IXP
            </Button>
          </Space>
        }
        style={{ marginBottom: '20px' }}
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Current Balance"
              value={wallet.balance}
              suffix="IXP"
              valueStyle={{ color: '#1890ff', fontSize: '28px' }}
              prefix={<TrophyOutlined />}
            />
            <Progress 
              percent={Math.min(balancePercentage, 100)} 
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              format={() => `${wallet.balance}/${wallet.monthly_allowance}`}
            />
          </Col>
          
          <Col xs={24} sm={8}>
            <Statistic
              title="Total Earned"
              value={wallet.total_earned}
              suffix="IXP"
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary">Monthly Allowance: {wallet.monthly_allowance} IXP</Text>
          </Col>
          
          <Col xs={24} sm={8}>
            <Statistic
              title="Total Spent"
              value={wallet.total_spent}
              suffix="IXP"
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Text type="secondary">
              Last Allowance: {new Date(wallet.last_allowance_date).toLocaleDateString()}
            </Text>
          </Col>
        </Row>

        {wallet.balance < 10 && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: '#fff2e8', 
            border: '1px solid #ffbb96',
            borderRadius: '6px'
          }}>
            <Text type="warning">
              ⚠️ Low IXP balance! Consider purchasing more credits or upgrading your plan.
            </Text>
          </div>
        )}
      </Card>

      <Modal
        title="IXP Transaction History"
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={transactions}
          renderItem={(transaction) => (
            <List.Item>
              <List.Item.Meta
                avatar={getTransactionIcon(transaction.type)}
                description={formatTransactionDescription(transaction)}
              />
            </List.Item>
          )}
          locale={{ emptyText: 'No transactions yet' }}
        />
      </Modal>
    </>
  );
};

export default IXPWallet;
