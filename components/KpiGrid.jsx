'use client';

import { Row, Col, Card, Statistic } from 'antd';
import { fmtTime } from '@/lib/constants';

function delta(val, prev, fmt) {
  if (!prev) return <span className="delta-nt">—</span>;
  const d = val - prev, p = Math.round(d / prev * 100);
  const cls = d >= 0 ? 'delta-up' : 'delta-dn';
  return <span className={cls}>{d >= 0 ? '+' : ''}{p}% vs anterior</span>;
}

export default function KpiGrid({ cur, prev }) {
  const tM  = cur.reduce((a, s) => a + s.mins, 0);
  const tT  = cur.reduce((a, s) => a + s.tss,  0);
  const tD  = cur.reduce((a, s) => a + s.dist,  0);
  const pM  = prev.reduce((a, s) => a + s.mins, 0);
  const pT  = prev.reduce((a, s) => a + s.tss,  0);
  const pD  = prev.reduce((a, s) => a + s.dist,  0);

  const items = [
    { label: 'Tempo total',  value: fmtTime(tM),          d: delta(tM, pM, fmtTime) },
    { label: 'TSS total',    value: String(tT),            d: delta(tT, pT, String) },
    { label: 'Sessões',      value: String(cur.length),    d: delta(cur.length, prev.length, String) },
    { label: 'Distância',    value: tD.toFixed(1) + ' km', d: delta(tD, pD, v => v.toFixed(1)) },
  ];

  return (
    <Row gutter={[10, 10]} style={{ marginBottom: 14 }}>
      {items.map(item => (
        <Col key={item.label} xs={12} sm={6}>
          <Card size="small" styles={{ body: { padding: '12px 14px' } }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, opacity: 0.5 }}>
              {item.label}
            </div>
            <div className="kpi-value">{item.value}</div>
            <div style={{ marginTop: 4 }}>{item.d}</div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
