"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useYearlyBilling } from '@/hooks/use-yearly-billing';

export default function TestInvoiceAPIPage() {
  const [apartmentId, setApartmentId] = useState('1');
  const [billingPeriod, setBillingPeriod] = useState('2024-12');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const { generateInvoiceForApartment, loading, error, success } = useYearlyBilling();

  const handleTestAPI = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await generateInvoiceForApartment(
        parseInt(apartmentId),
        billingPeriod,
        {
          serviceFeePerM2: 5000,
          waterFeePerM3: 15000,
          motorcycleFee: 50000,
          car4SeatsFee: 200000,
          car7SeatsFee: 250000,
        }
      );

      setTestResult({
        success: !!result,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setTestResult({
        success: false,
        error: err,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test API Tạo Hóa Đơn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="apartmentId">Apartment ID</Label>
              <Input
                id="apartmentId"
                value={apartmentId}
                onChange={(e) => setApartmentId(e.target.value)}
                placeholder="Nhập ID căn hộ"
              />
            </div>
            <div>
              <Label htmlFor="billingPeriod">Billing Period (yyyy-MM)</Label>
              <Input
                id="billingPeriod"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                placeholder="2024-12"
              />
            </div>
          </div>

          <Button 
            onClick={handleTestAPI} 
            disabled={isTesting || loading}
            className="w-full"
          >
            {isTesting || loading ? 'Đang test...' : 'Test API'}
          </Button>

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {testResult && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Kết quả test:</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">API Endpoint:</h4>
            <code className="text-sm text-blue-800">
              POST /api/admin/invoices/generate?apartmentId={apartmentId}&billingPeriod={billingPeriod}
            </code>
            <p className="text-sm text-blue-700 mt-2">
              Body: {JSON.stringify({
                serviceFeePerM2: 5000,
                waterFeePerM3: 15000,
                motorcycleFee: 50000,
                car4SeatsFee: 200000,
                car7SeatsFee: 250000,
              }, null, 2)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 