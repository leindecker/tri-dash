'use client';

import { ConfigProvider, theme as antTheme, App } from 'antd';
import { useEffect, useState } from 'react';
import ptBR from 'antd/locale/pt_BR';
import './globals.css';

const SWIM  = '#1D9E75';
const BIKE  = '#185FA5';
const RUN   = '#D85A30';

export default function RootLayout({ children }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    setDark(mq.matches);
    mq.addEventListener('change', e => setDark(e.matches));
  }, []);

  return (
    <html lang="pt-BR">
      <body>
        <ConfigProvider
          locale={ptBR}
          theme={{
            algorithm: dark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
            token: {
              colorPrimary:   SWIM,
              colorInfo:      BIKE,
              colorWarning:   RUN,
              borderRadius:   8,
              fontFamily:     "'DM Sans', system-ui, sans-serif",
              fontFamilyCode: "'DM Mono', monospace",
            },
            components: {
              Card:   { paddingLG: 16 },
              Statistic: { contentFontSize: 22 },
            },
          }}
        >
          <App>{children}</App>
        </ConfigProvider>
      </body>
    </html>
  );
}
