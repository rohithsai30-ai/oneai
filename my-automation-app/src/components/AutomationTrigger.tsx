'use client';

import React, { useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, DatePicker, Switch, message, Space, Tag, Progress } from 'antd';
import { PlayCircleOutlined, SettingOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

interface AutomationTriggerProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  serviceType: string;
  onTrigger: (config: any) => void;
  isActive?: boolean;
  lastRun?: string;
}

const AutomationTrigger: React.FC<AutomationTriggerProps> = ({
  title,
  description,
  icon,
  serviceType,
  onTrigger,
  isActive = false,
  lastRun
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const getServiceConfig = (type: string) => {
    switch (type) {
      case 'expenseTracking':
        return {
          fields: [
            { name: 'bankConnection', label: 'Bank Connection', type: 'select', options: ['Chase', 'Bank of America', 'Wells Fargo', 'Manual Upload'] },
            { name: 'categories', label: 'Auto-Categorize', type: 'switch', default: true },
            { name: 'frequency', label: 'Sync Frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly'] },
            { name: 'reportEmail', label: 'Email Reports To', type: 'input' },
            { name: 'threshold', label: 'Alert Threshold ($)', type: 'number' }
          ],
          webhookUrl: 'https://hooks.zapier.com/hooks/catch/expense-tracking'
        };
      case 'bookkeeping':
        return {
          fields: [
            { name: 'accountingSoftware', label: 'Accounting Software', type: 'select', options: ['QuickBooks', 'Xero', 'FreshBooks', 'Manual'] },
            { name: 'autoReconcile', label: 'Auto Reconciliation', type: 'switch', default: true },
            { name: 'reportFrequency', label: 'Report Frequency', type: 'select', options: ['Weekly', 'Monthly', 'Quarterly'] },
            { name: 'backupEnabled', label: 'Auto Backup', type: 'switch', default: true },
            { name: 'notifications', label: 'Notification Email', type: 'input' }
          ],
          webhookUrl: 'https://hooks.zapier.com/hooks/catch/bookkeeping'
        };
      case 'payroll':
        return {
          fields: [
            { name: 'payrollProvider', label: 'Payroll Provider', type: 'select', options: ['ADP', 'Gusto', 'Paychex', 'Manual'] },
            { name: 'payFrequency', label: 'Pay Frequency', type: 'select', options: ['Weekly', 'Bi-weekly', 'Monthly'] },
            { name: 'autoTaxFiling', label: 'Auto Tax Filing', type: 'switch', default: true },
            { name: 'directDeposit', label: 'Direct Deposit', type: 'switch', default: true },
            { name: 'hrEmail', label: 'HR Notification Email', type: 'input' }
          ],
          webhookUrl: 'https://hooks.zapier.com/hooks/catch/payroll'
        };
      case 'taxPrep':
        return {
          fields: [
            { name: 'taxSoftware', label: 'Tax Software', type: 'select', options: ['TurboTax', 'H&R Block', 'TaxAct', 'Manual'] },
            { name: 'autoGather', label: 'Auto Gather Documents', type: 'switch', default: true },
            { name: 'filingType', label: 'Filing Type', type: 'select', options: ['Federal Only', 'Federal + State', 'All'] },
            { name: 'reminderDays', label: 'Reminder Days Before Deadline', type: 'number', default: 30 },
            { name: 'cpaEmail', label: 'CPA Email (Optional)', type: 'input' }
          ],
          webhookUrl: 'https://hooks.zapier.com/hooks/catch/tax-prep'
        };
      default:
        return { fields: [], webhookUrl: '' };
    }
  };

  const handleTrigger = async (values: any) => {
    setLoading(true);
    try {
      const config = getServiceConfig(serviceType);
      
      // Simulate API call to automation service
      const automationData = {
        service: serviceType,
        title,
        configuration: values,
        webhookUrl: config.webhookUrl,
        timestamp: new Date().toISOString(),
        status: 'active'
      };

      // Call the parent trigger function
      await onTrigger(automationData);
      
      message.success(`${title} automation has been configured and activated!`);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to configure automation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const config = getServiceConfig(serviceType);

  const renderField = (field: any) => {
    switch (field.type) {
      case 'select':
        return (
          <Select placeholder={`Select ${field.label}`}>
            {field.options.map((option: string) => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        );
      case 'switch':
        return <Switch defaultChecked={field.default} />;
      case 'number':
        return <Input type="number" placeholder={field.default?.toString()} />;
      case 'input':
      default:
        return <Input placeholder={`Enter ${field.label}`} />;
    }
  };

  return (
    <>
      <Card
        hoverable
        style={{ 
          marginBottom: '16px',
          border: isActive ? '2px solid #52c41a' : '1px solid #d9d9d9'
        }}
        actions={[
          <Button 
            key="configure" 
            type="primary" 
            icon={<SettingOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Configure
          </Button>,
          <Button 
            key="trigger" 
            type={isActive ? "default" : "primary"}
            icon={<PlayCircleOutlined />}
            onClick={() => setModalVisible(true)}
          >
            {isActive ? 'Active' : 'Activate'}
          </Button>
        ]}
      >
        <Card.Meta
          avatar={icon}
          title={
            <Space>
              {title}
              {isActive && <Tag color="green">Active</Tag>}
            </Space>
          }
          description={
            <div>
              <p>{description}</p>
              {lastRun && (
                <p style={{ fontSize: '12px', color: '#666' }}>
                  <ClockCircleOutlined /> Last run: {lastRun}
                </p>
              )}
              {isActive && (
                <Progress 
                  percent={85} 
                  size="small" 
                  status="active"
                  format={() => 'Running'}
                />
              )}
            </div>
          }
        />
      </Card>

      <Modal
        title={`Configure ${title}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleTrigger}
        >
          {config.fields.map((field: any) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              rules={[{ required: field.type !== 'switch', message: `Please provide ${field.label}` }]}
            >
              {renderField(field)}
            </Form.Item>
          ))}
          
          <Form.Item name="notes" label="Additional Notes">
            <TextArea rows={3} placeholder="Any specific requirements or notes..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Activate Automation
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AutomationTrigger;
