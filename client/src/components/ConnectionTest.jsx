import React, { useState } from 'react';
import axios from 'axios';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [result, setResult] = useState(null);

  const testBackend = async () => {
    try {
      setStatus('Testing backend connection...');
      const response = await axios.get('http://localhost:3000/health');
      setStatus('✅ Backend is connected!');
      setResult(response.data);
    } catch (error) {
      setStatus('❌ Cannot connect to backend');
      setResult({ error: error.message });
    }
  };

  const testRegister = async () => {
    try {
      setStatus('Testing registration...');
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'Test123456'
      });
      setStatus('✅ Registration works!');
      setResult(response.data);
    } catch (error) {
      setStatus('❌ Registration failed');
      setResult({ error: error.response?.data?.message || error.message });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#1f2937' }}>
          Backend Connection Test
        </h2>

        <div style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: status.includes('✅') ? '#d1fae5' : status.includes('❌') ? '#fee2e2' : '#f3f4f6',
          marginBottom: '24px'
        }}>
          <p style={{ fontWeight: '500' }}>{status}</p>
        </div>

        {result && (
          <pre style={{
            background: '#f3f4f6',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '12px',
            overflow: 'auto',
            marginBottom: '24px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}

        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={testBackend}
            style={{
              padding: '10px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Test Backend Connection
          </button>
          <button
            onClick={testRegister}
            style={{
              padding: '10px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Test Registration API
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#6b7280' }}>
          Make sure backend is running on port 3000
        </p>
      </div>
    </div>
  );
};

export default ConnectionTest;