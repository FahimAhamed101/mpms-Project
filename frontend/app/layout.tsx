'use client';

import { Provider } from 'react-redux';
import { store } from '@/app/lib/store';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          {children}
          <Toaster position="top-right" />
        </Provider>
      </body>
    </html>
  );
}