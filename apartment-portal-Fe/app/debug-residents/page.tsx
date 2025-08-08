'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'

export default function DebugResidentsPage() {
  const [residents, setResidents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<any[]>([])

  const loadAllResidents = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔍 Loading all residents...')
      const response = await apiFetch('/api/admin/residents')
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 All residents data:', data)
        setResidents(Array.isArray(data) ? data : data.data || [])
      } else {
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        setError(`API Error: ${response.status} - ${errorText}`)
      }
    } catch (err) {
      console.error('💥 Exception:', err)
      setError(`Exception: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testSpecificResidents = async () => {
    const testIds = [35, 36, 37, 38, 39, 40, 41, 42]
    const results = []
    
    for (const id of testIds) {
      try {
        console.log(`🧪 Testing resident ID: ${id}`)
        const response = await apiFetch(`/api/admin/residents/${id}`)
        const status = response.status
        
        if (response.ok) {
          const data = await response.json()
          results.push({ id, status: 'OK', data })
          console.log(`✅ ID ${id}: OK`, data)
        } else {
          const errorText = await response.text()
          results.push({ id, status: 'ERROR', error: errorText })
          console.log(`❌ ID ${id}: ${status} - ${errorText}`)
        }
      } catch (err) {
        results.push({ id, status: 'EXCEPTION', error: err.toString() })
        console.log(`💥 ID ${id}: Exception - ${err}`)
      }
    }
    
    setTestResults(results)
  }

  useEffect(() => {
    loadAllResidents()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🐛 Debug Residents API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={loadAllResidents} disabled={loading}>
              🔄 Reload All Residents
            </Button>
            <Button onClick={testSpecificResidents} variant="outline">
              🧪 Test Specific IDs (35-42)
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && <div>⏳ Loading...</div>}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* All Residents */}
            <Card>
              <CardHeader>
                <CardTitle>📋 All Residents ({residents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {residents.length === 0 ? (
                  <div>No residents found</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {residents.map((resident, index) => (
                      <div key={resident.id || index} className="p-2 border rounded">
                        <div className="font-medium">
                          <Link href={`/admin-dashboard/residents/${resident.id}`} className="text-blue-600 hover:underline">
                            ID: {resident.id} - {resident.fullName || resident.username}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-600">
                          📧 {resident.email} | 📱 {resident.phoneNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          Roles: {resident.roles?.join(', ') || 'No roles'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
              <CardHeader>
                <CardTitle>🧪 API Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div>Click "Test Specific IDs" to run tests</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div key={index} className={`p-2 border rounded ${
                        result.status === 'OK' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="font-medium">
                          ID: {result.id} - {result.status}
                        </div>
                        {result.status === 'OK' && result.data && (
                          <div className="text-sm">
                            ✅ {result.data.fullName || result.data.username} ({result.data.email})
                          </div>
                        )}
                        {result.status !== 'OK' && (
                          <div className="text-sm text-red-600">
                            ❌ {result.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}