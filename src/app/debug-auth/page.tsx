// Debug page to test authentication and organization fetching
'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { getOrganizationsAction } from '@/lib/actions/organizations';

export default function DebugAuthPage() {
  const { data: session, status } = useSession();
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testOrganizationsAction = async () => {
    console.log('🧪 Testing organizations action...');
    setIsLoading(true);
    setTestResult(null);

    try {
      const result = await getOrganizationsAction({
        page: 1,
        pageSize: 10,
      });

      console.log('📊 Organizations action result:', result);
      setTestResult(result);
    } catch (error) {
      console.error('❌ Error testing action:', error);
      setTestResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">🔧 Debug Authentication & Organizations</h1>
      
      {/* Session Status */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Has Session:</strong> {session ? 'Yes' : 'No'}</p>
          {session && (
            <div>
              <p><strong>User Email:</strong> {session.user?.email}</p>
              <p><strong>User Name:</strong> {session.user?.name}</p>
              <p><strong>Session Expires:</strong> {session.expires}</p>
            </div>
          )}
        </div>
      </div>

      {/* Test Organizations Action */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Organizations Action</h2>
        <button 
          onClick={testOrganizationsAction}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test getOrganizationsAction'}
        </button>
        
        {testResult && (
          <div className="mt-4 bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8">
        <a href="/login" className="text-blue-500 hover:underline mr-4">Go to Login</a>
        <a href="/super/dashboard/organizations" className="text-blue-500 hover:underline">Go to Organizations</a>
      </div>
    </div>
  );
}