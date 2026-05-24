import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GlobalDev Agent',
  description: 'From README to Global Launch.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
