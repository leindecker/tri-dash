'use client';

import { Card, Button, Typography, Space } from 'antd';

const { Title, Text } = Typography;

export default function AuthCard() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Card style={{ width: 380, textAlign: 'center' }} styles={{ body: { padding: '40px 32px' } }}>
        <Title level={2} style={{ marginBottom: 6, fontWeight: 500 }}>Tri Dash</Title>
        <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 32, lineHeight: 1.6 }}>
          Conecte sua conta do Strava para carregar seus treinos automaticamente.
        </Text>
        <Button
          type="primary"
          size="large"
          href="/api/auth/login"
          style={{ background: '#FC4C02', borderColor: '#FC4C02', width: '100%' }}
          icon={
            <svg viewBox="0 0 24 24" width={16} height={16} fill="#fff" style={{ verticalAlign: 'middle', marginRight: 4 }}>
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
            </svg>
          }
        >
          Conectar com Strava
        </Button>
      </Card>
    </div>
  );
}
