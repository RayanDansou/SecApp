import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string>('checking...');
  const [backendVersion, setBackendVersion] = useState<string>('');

  useEffect(() => {
    // Check backend health
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/healthz/`)
      .then((res) => res.json())
      .then((data) => {
        setBackendStatus(data.status || 'unknown');
        setBackendVersion(data.version || 'unknown');
      })
      .catch(() => {
        setBackendStatus('unreachable');
        setBackendVersion('N/A');
      });
  }, []);

  return (
    <>
      <Head>
        <title>SecApp - Security Assessment Platform</title>
        <meta name="description" content="SecApp - Plateforme d'évaluation de sécurité" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-900">
              SecApp
            </h1>
            <p className="text-xl text-gray-600">
              Security Assessment Platform
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-800">
                  It Works!
                </h2>
                <p className="text-green-600 text-sm">
                  Phase 0 - Bootstrap complete
                </p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Frontend Status
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-blue-800 font-medium">Running</span>
              </div>
              <p className="text-xs text-blue-600 mt-2">Version: 1.0.0-phase0</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-purple-900 mb-2">
                Backend Status
              </h3>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    backendStatus === 'healthy'
                      ? 'bg-green-500 animate-pulse'
                      : backendStatus === 'checking...'
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-red-500'
                  }`}
                ></div>
                <span className="text-purple-800 font-medium capitalize">
                  {backendStatus}
                </span>
              </div>
              <p className="text-xs text-purple-600 mt-2">
                Version: {backendVersion || 'N/A'}
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Fonctionnalités à venir
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl mb-2">🔐</div>
                <p className="text-sm font-medium text-gray-700">
                  Authentification JWT
                </p>
                <p className="text-xs text-gray-500 mt-1">Phase 1</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm font-medium text-gray-700">
                  Questionnaires
                </p>
                <p className="text-xs text-gray-500 mt-1">Phase 2-3</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl mb-2">🤖</div>
                <p className="text-sm font-medium text-gray-700">
                  Analyse IA
                </p>
                <p className="text-xs text-gray-500 mt-1">Phase 4</p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
            <p>
              SecApp v1.0.0 - Phase 0 Bootstrap
            </p>
            <p className="text-xs mt-1">
              Next.js + Django + PostgreSQL + Docker
            </p>
          </div>
        </div>
      </main>
    </>
  );
}