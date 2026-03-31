'use client';

import { useState, useEffect, useCallback } from 'react';
import { Layout, Typography, Button, Space, Alert, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import AuthCard       from '@/components/AuthCard';
import TopBar         from '@/components/TopBar';
import KpiGrid        from '@/components/KpiGrid';
import SportCards     from '@/components/SportCards';
import ChartsRow      from '@/components/ChartsRow';
import SessionsList   from '@/components/SessionsList';

import { getWeekKey, fmtWeekRange } from '@/lib/constants';

const { Content } = Layout;
const { Text } = Typography;

const STORAGE_KEY = 'tri_next_v1';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function persist(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export default function DashboardPage() {
  const [athlete,     setAthlete]     = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncing,     setSyncing]     = useState(false);
  const [weekOffset,  setWeekOffset]  = useState(0);
  const [allSessions, setAllSessions] = useState([]);
  const [alert,       setAlert]       = useState(null);

  const showAlert = useCallback((type, msg, duration = 5000) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), duration);
  }, []);

  useEffect(() => {
    setAllSessions(load());

    const params = new URLSearchParams(location.search);
    if (params.get('auth') === 'ok')   showAlert('success', 'Conectado com sucesso!');
    if (params.get('logout') === 'ok') showAlert('info',    'Sessão encerrada.');
    if (params.get('error'))           showAlert('error',   'Erro ao conectar: ' + params.get('error'));
    history.replaceState({}, '', '/');

    fetch('/api/me')
      .then(r => r.json())
      .then(data => {
        setAthlete(data.athlete);
        setAuthLoading(false);
        if (data.athlete) syncStrava(data.athlete);
      })
      .catch(() => setAuthLoading(false));
  }, []);

  const syncStrava = useCallback(async () => {
    setSyncing(true);
    showAlert('info', 'Buscando atividades do Strava...', 60000);
    try {
      const res  = await fetch('/api/activities?weeks=4');
      if (res.status === 401) { location.href = '/api/auth/login'; return; }
      const data = await res.json();
      if (!data.activities) throw new Error(data.error || 'Resposta inválida');

      setAllSessions(data.activities);
      persist(data.activities);
      showAlert('success', `${data.activities.length} atividade(s) sincronizada(s).`);
    } catch (err) {
      showAlert('error', 'Erro ao sincronizar: ' + err.message);
    } finally {
      setSyncing(false);
    }
  }, [showAlert]);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!athlete) return <Layout style={{ minHeight: '100vh', padding: '28px 20px' }}><Content><AuthCard /></Content></Layout>;

  const curKey  = getWeekKey(weekOffset);
  const prevKey = getWeekKey(weekOffset - 1);
  const cur     = allSessions.filter(s => s.weekKey === curKey);
  const prev    = allSessions.filter(s => s.weekKey === prevKey);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px 60px', width: '100%' }}>

        <TopBar athlete={athlete} syncing={syncing} onSync={syncStrava} />

        {alert && (
          <Alert
            type={alert.type}
            message={alert.msg}
            showIcon
            closable
            onClose={() => setAlert(null)}
            style={{ marginBottom: 14 }}
          />
        )}

        {/* Week header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.09em', opacity: 0.5 }}>
            Triathlon · Weekly Load
          </Text>
          <Space size={6}>
            <Button size="small" icon={<LeftOutlined />}  onClick={() => setWeekOffset(w => w - 1)} />
            <Text style={{ fontSize: 11, fontWeight: 500, minWidth: 160, textAlign: 'center', fontFamily: 'DM Mono, monospace' }}>
              {fmtWeekRange(weekOffset)}
            </Text>
            <Button size="small" icon={<RightOutlined />} onClick={() => setWeekOffset(w => w + 1)} />
          </Space>
        </div>

        <KpiGrid cur={cur} prev={prev} />
        <SportCards sessions={cur} />
        <ChartsRow sessions={cur} weekOffset={weekOffset} allSessions={allSessions} />
        <SessionsList sessions={cur} />

      </Content>
    </Layout>
  );
}
