'use client';

import { Row, Col, Card, Progress, Badge } from 'antd';
import { SPORTS, fmtTime, aggregateSessions } from '@/lib/constants';

export default function SportCards({ sessions }) {
  const agg     = aggregateSessions(sessions);
  const maxMins = Math.max(...Object.values(agg).map(a => a.mins), 1);

  return (
    <Row gutter={[10, 10]} style={{ marginBottom: 14 }}>
      {Object.entries(SPORTS).map(([key, sp]) => {
        const a      = agg[key];
        const isGym  = key === 'gym';
        const primary = isGym ? fmtTime(a.mins) : `${a.dist.toFixed(1)} km`;
        const sub     = isGym
          ? `TSS ${a.tss}`
          : `${fmtTime(a.mins)} · TSS ${a.tss}`;
        const pct = Math.round(a.mins / maxMins * 100);

        return (
          <Col key={key} xs={12} sm={6}>
            <Card size="small" styles={{ body: { padding: '12px 14px' } }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: sp.color, flexShrink: 0, display: 'inline-block'
                }}/>
                <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.6 }}>
                  {sp.label}
                </span>
              </div>
              <div className="kpi-value" style={{ fontSize: 20, marginBottom: 3 }}>{primary}</div>
              <div style={{ fontSize: 11, opacity: 0.5, fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>
                {sub}
              </div>
              <Progress
                percent={pct}
                showInfo={false}
                strokeColor={sp.color}
                trailColor="rgba(128,128,128,0.15)"
                size={['100%', 3]}
                style={{ marginBottom: 8 }}
              />
              <div style={{ fontSize: 10, opacity: 0.5, borderTop: '0.5px solid rgba(128,128,128,0.15)', paddingTop: 7 }}>
                {a.count} sessão{a.count !== 1 ? 'ões' : ''}
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
