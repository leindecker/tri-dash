'use client';

import { Card, Table, Tag, Typography, Empty } from 'antd';
import { SPORTS, DAYS, fmtTime, fmtPaceOrSpeed } from '@/lib/constants';

const { Text } = Typography;

export default function SessionsList({ sessions }) {
  const sorted = [...sessions].sort((a, b) => a.day - b.day);

  const columns = [
    {
      title: 'Dia',
      dataIndex: 'day',
      key: 'day',
      width: 48,
      render: d => <Text type="secondary" style={{ fontSize: 11, fontFamily: 'DM Mono, monospace' }}>{DAYS[d]}</Text>,
    },
    {
      title: 'Treino',
      key: 'treino',
      render: (_, s) => {
        const sp = SPORTS[s.sport] || SPORTS.run;
        return (
          <div>
            <div style={{ fontSize: 13 }}>{s.desc || sp.label}</div>
            <Tag
              style={{
                background: sp.light, color: sp.color,
                border: 'none', fontSize: 9, fontWeight: 500,
                padding: '1px 6px', marginTop: 2,
              }}
            >
              {s.source === 'strava' ? '⚡ ' : ''}{sp.label}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Duração',
      key: 'dur',
      align: 'right',
      width: 72,
      render: (_, s) => (
        <Text style={{ fontSize: 12, fontFamily: 'DM Mono, monospace' }}>{fmtTime(s.mins)}</Text>
      ),
    },
    {
      title: 'Dist / TSS',
      key: 'meta',
      align: 'right',
      width: 140,
      render: (_, s) => {
        const pace = fmtPaceOrSpeed(s.sport, s.avgSpeed);
        return (
          <div style={{ textAlign: 'right', minWidth: 120 }}>
            {/* Single-line: distance - TSS */}
            <div style={{ textAlign: 'right', minWidth: 120 }}>
              <div style={{ fontSize: 13, fontFamily: 'DM Mono, monospace', color: 'var(--ant-color-text)' }}>
                {s.dist > 0 ? `${s.dist.toFixed(1)}km` : '—'} - {s.tss} TSS
              </div>

              {/* NP line (normalized power) */}
              {s.sport === 'bike' && s.normPower && (
                <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>
                  NP - <strong style={{ color: 'var(--ant-color-text)' }}>{Math.round(s.normPower)}</strong>
                </div>
              )}

              {/* Average speed */}
              <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>
                {pace ? `Vel. média - ${pace}` : ''}
              </div>
            </div>
          </div>
        );
      },
    },
    // removed manual delete action column
  ];

  return (
    <Card
      title={<span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Treinos da semana</span>}
      size="small"
      style={{ marginBottom: 14 }}
      styles={{ body: { padding: 0 } }}
    >
      {sorted.length === 0 ? (
        <div style={{ padding: '24px 16px' }}>
          <Empty description="Nenhum treino. Sincronize o Strava." image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : (
        <Table
          dataSource={sorted}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          showHeader={false}
        />
      )}
      {sessions.some(s => s.source === 'strava') && (
        <div style={{ padding: '8px 16px', fontSize: 11, opacity: 0.45, borderTop: '0.5px solid rgba(128,128,128,0.15)' }}>
          * TSS estimado por duração — a API pública do Strava não expõe TSS real.
        </div>
      )}
    </Card>
  );
}
