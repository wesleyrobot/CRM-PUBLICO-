'use client';

import { ReactNode } from 'react';
import Script from 'next/script';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      {children}
      <Script
        type="module"
        src="https://unpkg.com/@splinetool/viewer@1.9.98/build/spline-viewer.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
