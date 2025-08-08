'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'

export default function DebugApartmentsPage() {
  const [apartmentRelations, setApartmentRelations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<any[]>([])

  const loadAllApartmentRelations = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔍 Loading all apartment-resident relations...')
      const response = await apiFetch('/api/apartment-residents')
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 All apartment-resident relations:', data)
        setApartmentRelations(Array.isArray(data) ? data : data.data || [])
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

  const testSpecificUsers = async () => {
    const testIds = [35, 36, 37, 38, 39, 40]
    const results = []
    
    for (const id of testIds) {
      try {
        console.log(`🧪 Testing apartment relations for user ID: ${id}`)
        const response = await apiFetch(`/api/apartment-residents/user/${id}`)
        const status = response.status
        
        if (response.ok) {
          const data = await response.json()
          results.push({ id, status: 'OK', data })
          console.log(`✅ User ${id}: OK`, data)
        } else {
          const errorText = await response.text()
          results.push({ id, status: 'ERROR', error: errorText })
          console.log(`❌ User ${id}: ${status} - ${errorText}`)
        }
      } catch (err) {
        results.push({ id, status: 'EXCEPTION', error: err.toString() })
        console.log(`💥 User ${id}: Exception - ${err}`)
      }
    }
    
    setTestResults(results)
  }

  useEffect(() => {
    loadAllApartmentRelations()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🏠 Debug Apartment-Resident Relations API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={loadAllApartmentRelations} disabled={loading}>
              🔄 Reload All Relations
            </Button>
            <Button onClick={testSpecificUsers} variant="outline">
              🧪 Test User IDs (35-40)
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && <div>⏳ Loading...</div>}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* All Relations */}
            <Card>
              <CardHeader>
                <CardTitle>📋 All Apartment-Resident Relations ({apartmentRelations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {apartmentRelations.length === 0 ? (
                  <div>No relations found</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {apartmentRelations.map((relation, index) => (
                      <div key={index} className="p-2 border rounded">
                        <div className="font-medium">
                          <Link href={`/admin-dashboard/apartments/${relation.apartmentId}`} className="text-blue-600 hover:underline">
                            Apartment: {relation.apartmentId} | User: {relation.userId}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-600">
                          📧 {relation.userEmail || 'N/A'} | 📱 {relation.userPhoneNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Type: {relation.relationType} | Building: {relation.buildingName || 'N/A'} | Unit: {relation.unitNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Move In: {relation.moveInDate} | Move Out: {relation.moveOutDate || 'Still living'}
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
                  <div>Click "Test User IDs" to run tests</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div key={index} className={`p-2 border rounded ${
                        result.status === 'OK' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="font-medium">
                          User ID: {result.id} - {result.status}
                        </div>
                        {result.status === 'OK' && result.data && (
                          <div className="text-sm">
                            ✅ Found {result.data.length} apartment relations
                            {result.data.map((relation: any, idx: number) => (
                              <div key={idx} className="ml-2 text-xs">
                                • Apt {relation.apartmentId} ({relation.buildingName || 'N/A'} - {relation.unitNumber || 'N/A'})
                              </div>
                            ))}
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