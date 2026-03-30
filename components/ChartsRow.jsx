'use client';

import { Card, Row, Col } from 'antd';
import {
  PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import {
  SPORTS, fmtTime, fmtWeekRange, aggregateSessions, getMondayOf, getWeekKey,
} from '@/lib/constants';

function fmtTickTime(mins) {
  if (!mins) return '0';
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}` : `${m}m`;
}

export default function ChartsRow({ sessions, weekOffset, allSessions }) {
  const cur  = sessions;
  const prev = allSessions.filter(s => s.weekKey === getWeekKey(weekOffset - 1));
  const ac   = aggregateSessions(cur);
  const ap   = aggregateSessions(prev);

  const donutData = Object.entries(SPORTS)
    .map(([k, sp]) => ({ name: sp.label, value: ac[k].mins, color: sp.color }))
    .filter(d => d.value > 0);

  const compareData = Object.entries(SPORTS).map(([k, sp]) => ({
    name:     sp.label,
    Atual:    ac[k].mins,
    Anterior: ap[k].mins,
    color:    sp.color,
    mid:      sp.mid,
  }));

  const weeksData = [-3, -2, -1, 0].map(o => {
    const wKey = getWeekKey(weekOffset + o);
    const wMin = allSessions.filter(s => s.weekKey === wKey).reduce((a, s) => a + s.mins, 0);
    return { label: fmtWeekRange(weekOffset + o), mins: wMin, isCurrent: o === 0 };
  });

  const curMins  = weeksData[3].mins;
  const prevMins = weeksData[2].mins;
  const diffMins = curMins - prevMins;
  const nonZero  = weeksData.map(w => w.mins).filter(v => v > 0);
  const range    = nonZero.length > 1 ? Math.max(...nonZero) - Math.min(...nonZero) : 60;
  const pad      = Math.round(range * 0.3) || 30;
  const hMin     = nonZero.length ? Math.max(0, Math.min(...nonZero) - pad) : 0;
  const hMax     = nonZero.length ? Math.max(...nonZero) + pad : 60;

  const cardTitle = (t) => (
    <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t}</span>
  );

  return (
    <Row gutter={[10, 10]} style={{ marginBottom: 14 }}>

      {/* Donut */}
      <Col xs={24} sm={8}>
        <Card title={cardTitle('Distribuição de tempo')} size="small" styles={{ body: { padding: '12px 14px' } }}>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius="60%" outerRadius="85%"
                dataKey="value" paddingAngle={2}>
                {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <RTooltip formatter={(v) => fmtTime(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {donutData.map(d => (
              <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }}/>
                {d.name} {fmtTime(d.value)}
              </span>
            ))}
          </div>
        </Card>
      </Col>

      {/* Compare bar */}
      <Col xs={24} sm={8}>
        <Card title={cardTitle('Atual vs semana anterior')} size="small" styles={{ body: { padding: '12px 14px' } }}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={compareData} barCategoryGap="30%" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtTickTime} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={36} />
              <RTooltip formatter={(v) => fmtTime(v)} />
              <Bar dataKey="Atual" radius={[4, 4, 0, 0]}>
                {compareData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
              <Bar dataKey="Anterior" radius={[4, 4, 0, 0]}>
                {compareData.map((d, i) => <Cell key={i} fill={d.mid + '99'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#555', display: 'inline-block' }}/>Esta semana
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#aaa', display: 'inline-block' }}/>Sem. anterior
            </span>
          </div>
        </Card>
      </Col>

      {/* Weekly hours trend */}
      <Col xs={24} sm={8}>
        <Card title={cardTitle('Total de horas — semanas')} size="small" styles={{ body: { padding: '12px 14px' } }}>
          <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 2 }}>Esta semana</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
            <span className="kpi-value" style={{ fontSize: 20 }}>{fmtTime(curMins)}</span>
            {prevMins > 0 && (
              <span className={diffMins >= 0 ? 'delta-up' : 'delta-dn'}>
                {diffMins >= 0 ? '+' : ''}{fmtTime(Math.abs(diffMins))} vs anterior
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={112}>
            <BarChart data={weeksData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis domain={[hMin, hMax]} tickFormatter={fmtTickTime} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={36} />
              <RTooltip formatter={(v) => fmtTime(v)} />
              <Bar dataKey="mins" radius={[4, 4, 0, 0]}>
                {weeksData.map((w, i) => (
                  <Cell key={i} fill={w.isCurrent ? '#1D9E75' : 'rgba(128,128,128,0.25)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#1D9E75', display: 'inline-block' }}/>Atual
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#aaa', display: 'inline-block' }}/>Anteriores
            </span>
          </div>
        </Card>
      </Col>

    </Row>
  );
}
