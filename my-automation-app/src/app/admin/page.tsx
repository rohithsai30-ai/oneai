'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Typography, 
  Statistic, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message,
  Tabs,
  Avatar,
  List,
  Progress,
  DatePicker
} from 'antd';
import { 
  UserOutlined, 
  DollarOutlined, 
  BarChartOutlined, 
  SettingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CrownOutlined,
  TeamOutlined,
  TrophyOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { supabaseHelpers } from '../../lib/supabase';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  business_name: string;
  role: string;
  status: string;
  created_at: string;
  ixp_balance?: number;
  onboarding_completed?: boolean;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalIXPCredits: number;
  completedOnboardings: number;
  activeAutomations: number;
}

const AdminDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalIXPCredits: 0,
    completedOnboardings: 0,
    activeAutomations: 0
  });
  const [adminUser, setAdminUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkAdminAccess();
    }
  }, [mounted]);

  const checkAdminAccess = async () => {
    try {
      const userStr = localStorage.getItem('r1ai_user');
      if (!userStr) {
        // Use setTimeout to avoid hydration issues with message
        setTimeout(() => {
          message.error('Please sign in to access admin panel');
        }, 100);
        router.push('/signin');
        return;
      }

      const userData = JSON.parse(userStr);
      
      // Check if user is admin
      const userResult = await supabaseHelpers.getUserByEmail(userData.email);
      if (!userResult.success || !userResult.data || userResult.data.role !== 'admin') {
        setTimeout(() => {
          message.error('Access denied. Admin privileges required.');
        }, 100);
        router.push('/');
        return;
      }

      setAdminUser(userResult.data);
      loadAdminData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      setTimeout(() => {
        message.error('Failed to verify admin access');
      }, 100);
      router.push('/signin');
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load all users (you'll need to implement this in supabaseHelpers)
      await loadUsers();
      await loadStats();
    } catch (error) {
      console.error('Error loading admin data:', error);
      message.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await supabaseHelpers.getAllUsers();
      if (result.success && result.data) {
        const formattedUsers = result.data.map((user: any) => ({
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          business_name: user.business_name || 'N/A',
          role: user.role,
          status: user.status,
          created_at: new Date(user.created_at).toLocaleDateString(),
          ixp_balance: user.ixp_wallet?.[0]?.balance || 0,
          onboarding_completed: user.business_onboarding?.[0]?.onboarding_completed || false
        }));
        setUsers(formattedUsers);
      } else {
        message.error('Failed to load users: ' + result.error);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      message.error('Failed to load users');
    }
  };

  const loadStats = async () => {
    try {
      const result = await supabaseHelpers.getAdminStats();
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        message.error('Failed to load stats: ' + result.error);
        // Fallback to default stats
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalRevenue: 0,
          totalIXPCredits: 0,
          completedOnboardings: 0,
          activeAutomations: 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      message.error('Failed to load stats');
    }
  };

  const handleUserAction = (action: string, user: AdminUser) => {
    setSelectedUser(user);
    if (action === 'view') {
      setUserModalVisible(true);
    } else if (action === 'edit') {
      form.setFieldsValue(user);
      setEditModalVisible(true);
    } else if (action === 'delete') {
      Modal.confirm({
        title: 'Delete User',
        content: `Are you sure you want to delete ${user.full_name}?`,
        okText: 'Delete',
        okType: 'danger',
        onOk: () => deleteUser(user.id)
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const result = await supabaseHelpers.deleteUser(userId);
      if (result.success) {
        message.success('User deleted successfully');
        // Log admin action
        if (adminUser) {
          await supabaseHelpers.logAdminAction(
            adminUser.id,
            'DELETE_USER',
            userId,
            { action: 'User deleted by admin' }
          );
        }
        loadUsers();
      } else {
        message.error('Failed to delete user: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    }
  };

  const updateUser = async (values: any) => {
    try {
      if (!selectedUser) return;
      
      // Update role if changed
      if (values.role !== selectedUser.role) {
        const roleResult = await supabaseHelpers.updateUserRole(selectedUser.id, values.role);
        if (!roleResult.success) {
          message.error('Failed to update user role: ' + roleResult.error);
          return;
        }
      }
      
      // Update status if changed
      if (values.status !== selectedUser.status) {
        const statusResult = await supabaseHelpers.updateUserStatus(selectedUser.id, values.status);
        if (!statusResult.success) {
          message.error('Failed to update user status: ' + statusResult.error);
          return;
        }
      }
      
      // Log admin action
      if (adminUser) {
        await supabaseHelpers.logAdminAction(
          adminUser.id,
          'UPDATE_USER',
          selectedUser.id,
          { changes: values, action: 'User updated by admin' }
        );
      }
      
      message.success('User updated successfully');
      setEditModalVisible(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Failed to update user');
    }
  };

  const userColumns = [
    {
      title: 'User',
      key: 'user',
      render: (record: AdminUser) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.full_name}</Text>
            <br />
            <Text type="secondary">{record.email}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Business',
      dataIndex: 'business_name',
      key: 'business_name'
    },
    {
      title: 'Role',
      key: 'role',
      render: (record: AdminUser) => (
        <Tag color={record.role === 'admin' ? 'gold' : 'blue'}>
          {record.role.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: AdminUser) => (
        <Tag color={record.status === 'active' ? 'green' : 'red'}>
          {record.status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'IXP Balance',
      key: 'ixp_balance',
      render: (record: AdminUser) => (
        <Text strong>{record.ixp_balance || 0} IXP</Text>
      )
    },
    {
      title: 'Onboarding',
      key: 'onboarding',
      render: (record: AdminUser) => (
        <Tag color={record.onboarding_completed ? 'green' : 'orange'}>
          {record.onboarding_completed ? 'Complete' : 'Pending'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: AdminUser) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => handleUserAction('view', record)}
          />
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleUserAction('edit', record)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger 
            onClick={() => handleUserAction('delete', record)}
          />
        </Space>
      )
    }
  ];

  // Prevent hydration errors by not rendering until mounted
  if (!mounted) {
    return null;
  }

  if (!adminUser) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0a 100%)'
      }}>
        <Card style={{ textAlign: 'center' }}>
          <Title level={3}>Checking Admin Access...</Title>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '24px',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0a 100%)',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <Card style={{ 
          marginBottom: '24px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Avatar icon={<CrownOutlined />} style={{ background: '#faad14' }} />
                <div>
                  <Title level={2} style={{ margin: 0, color: '#1a1a2e' }}>
                    R1 AI Admin Dashboard
                  </Title>
                  <Text type="secondary">Welcome back, {adminUser.full_name}</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Button onClick={() => router.push('/')}>
                Back to Main App
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={stats.totalUsers}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Users"
                value={stats.activeUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#faad14' }}
                precision={0}
                formatter={(value) => `$${value}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="IXP Credits"
                value={stats.totalIXPCredits}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Tabs defaultActiveKey="users">
            <TabPane tab={<span><UserOutlined />Users</span>} key="users">
              <div style={{ marginBottom: '16px' }}>
                <Button type="primary" icon={<PlusOutlined />}>
                  Add New User
                </Button>
              </div>
              <Table
                columns={userColumns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>

            <TabPane tab={<span><BarChartOutlined />Analytics</span>} key="analytics">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="User Growth" size="small">
                    <Progress percent={75} status="active" />
                    <Text type="secondary">75% growth this month</Text>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="Revenue Growth" size="small">
                    <Progress percent={60} status="active" strokeColor="#52c41a" />
                    <Text type="secondary">60% revenue increase</Text>
                  </Card>
                </Col>
                <Col xs={24}>
                  <Card title="Recent Activity" size="small">
                    <List
                      size="small"
                      dataSource={[
                        'New user registered: john@example.com',
                        'Payment processed: $399 (Growth Plan)',
                        'Automation activated: Expense Tracking',
                        'User completed onboarding: jane@example.com'
                      ]}
                      renderItem={item => <List.Item>{item}</List.Item>}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab={<span><SettingOutlined />Settings</span>} key="settings">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="System Settings" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Maintenance Mode</Text>
                        <br />
                        <Button size="small">Enable</Button>
                      </div>
                      <div>
                        <Text strong>Email Notifications</Text>
                        <br />
                        <Button size="small" type="primary">Enabled</Button>
                      </div>
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="IXP Credit Management" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Default Credit Bonus</Text>
                        <br />
                        <Input placeholder="100 IXP" size="small" />
                      </div>
                      <div>
                        <Text strong>Referral Bonus</Text>
                        <br />
                        <Input placeholder="50 IXP" size="small" />
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Card>

        {/* User Detail Modal */}
        <Modal
          title="User Details"
          open={userModalVisible}
          onCancel={() => setUserModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedUser && (
            <div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Name:</Text> {selectedUser.full_name}
                </Col>
                <Col span={12}>
                  <Text strong>Email:</Text> {selectedUser.email}
                </Col>
                <Col span={12}>
                  <Text strong>Business:</Text> {selectedUser.business_name}
                </Col>
                <Col span={12}>
                  <Text strong>Role:</Text> {selectedUser.role}
                </Col>
                <Col span={12}>
                  <Text strong>Status:</Text> {selectedUser.status}
                </Col>
                <Col span={12}>
                  <Text strong>IXP Balance:</Text> {selectedUser.ixp_balance} IXP
                </Col>
                <Col span={24}>
                  <Text strong>Joined:</Text> {selectedUser.created_at}
                </Col>
              </Row>
            </div>
          )}
        </Modal>

        {/* Edit User Modal */}
        <Modal
          title="Edit User"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onOk={() => form.submit()}
          okText="Update"
        >
          <Form form={form} onFinish={updateUser} layout="vertical">
            <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="business_name" label="Business Name">
              <Input />
            </Form.Item>
            <Form.Item name="role" label="Role" rules={[{ required: true }]}>
              <Select>
                <Option value="user">User</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="suspended">Suspended</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;
