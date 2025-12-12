// app/test-env/page.tsx
export default function TestEnvPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Environment Variables Test</h1>
      <pre>
        NEXT_backend_URL: {process.env.NEXT_backend_URL || 'NOT FOUND'}
      </pre>
      <pre>
        NODE_ENV: {process.env.NODE_ENV}
      </pre>
    </div>
  );
}