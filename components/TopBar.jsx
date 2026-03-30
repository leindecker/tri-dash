'use client';

import { Avatar, Button, Space, Typography, Tooltip } from 'antd';
import { ReloadOutlined, LogoutOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function TopBar({ athlete, syncing, onSync }) {
  const initials = `${athlete.firstname?.[0] || ''}${athlete.lastname?.[0] || ''}`.toUpperCase();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 14px', marginBottom: 18,
      borderRadius: 8, border: '0.5px solid rgba(128,128,128,0.18)',
      background: 'var(--ant-color-bg-container)',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: '#1D9E75', flexShrink: 0, display: 'inline-block',
      }}/>
      <Avatar
        size={28}
        src={athlete.profile}
        style={{ background: '#E1F5EE', color: '#085041', fontSize: 11, fontWeight: 500, flexShrink: 0 }}
      >
        {!athlete.profile && initials}
      </Avatar>
      <Text strong style={{ flex: 1, fontSize: 13 }}>
        {athlete.firstname} {athlete.lastname}
      </Text>
      <Space size={6}>
        <Tooltip title="Sincronizar com Strava">
          <Button
            size="small"
            icon={<ReloadOutlined spin={syncing} />}
            onClick={onSync}
            loading={syncing}
          >
            Sincronizar
          </Button>
        </Tooltip>
        <Tooltip title="Sair">
          <Button
            size="small"
            icon={<LogoutOutlined />}
            href="/api/auth/logout"
            danger
          >
            Sair
          </Button>
        </Tooltip>
      </Space>
    </div>
  );
}
