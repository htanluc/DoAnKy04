"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { vehicleCapacityApi } from '@/lib/api';

export default function VehicleCapacityDebug() {
  const [buildingId, setBuildingId] = useState<number>(1);
  const [configId, setConfigId] = useState<number>(1);
  const [vehicleType, setVehicleType] = useState<string>('CAR_4_SEATS');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (title: string, data: any, isError = false) => {
    setResults(prev => [{
      id: Date.now(),
      title,
      data,
      isError,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const testGetAll = async () => {
    setLoading(true);
    try {
      const result = await vehicleCapacityApi.getAll();
      addResult('GET All Configs', result);
    } catch (error) {
      addResult('GET All Configs Error', error, true);
    } finally {
      setLoading(false);
    }
  };

  const testGetByBuilding = async () => {
    setLoading(true);
    try {
      const result = await vehicleCapacityApi.getByBuilding(buildingId);
      addResult(`GET Config by Building ${buildingId}`, result);
    } catch (error) {
      addResult(`GET Config by Building ${buildingId} Error`, error, true);
    } finally {
      setLoading(false);
    }
  };

  const testCheckCapacity = async () => {
    setLoading(true);
    try {
      const result = await vehicleCapacityApi.checkCapacity(buildingId, vehicleType);
      addResult(`Check Capacity for ${vehicleType}`, result);
    } catch (error) {
      addResult(`Check Capacity Error`, error, true);
    } finally {
      setLoading(false);
    }
  };

  const testToggleActive = async () => {
    setLoading(true);
    try {
      console.log('Testing toggle with:', { id: configId, isActive });
      const result = await vehicleCapacityApi.toggleActive(configId, isActive);
      addResult(`Toggle Active ${configId} to ${isActive}`, result);
    } catch (error) {
      addResult(`Toggle Active Error`, error, true);
      console.error('Toggle error details:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCreateConfig = async () => {
    setLoading(true);
    try {
             const newConfig = {
         buildingId,
         maxCars: 50,
         maxMotorcycles: 100,
         maxTrucks: 0,
         maxVans: 0,
         maxElectricVehicles: 0,
         maxBicycles: 0,
         isActive: true
       };
      const result = await vehicleCapacityApi.create(newConfig);
      addResult('CREATE Config', result);
    } catch (error) {
      addResult('CREATE Config Error', error, true);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateConfig = async () => {
    setLoading(true);
    try {
      const updateData = {
        maxCars: 60,
        maxMotorcycles: 120
      };
      const result = await vehicleCapacityApi.update(configId, updateData);
      addResult(`UPDATE Config ${configId}`, result);
    } catch (error) {
      addResult(`UPDATE Config Error`, error, true);
    } finally {
      setLoading(false);
    }
  };

  const testDeleteConfig = async () => {
    setLoading(true);
    try {
      await vehicleCapacityApi.delete(configId);
      addResult(`DELETE Config ${configId}`, { message: 'Deleted successfully' });
    } catch (error) {
      addResult(`DELETE Config Error`, error, true);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Debug Vehicle Capacity API</CardTitle>
          <CardDescription>
            Test tất cả API endpoints để debug vấn đề
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buildingId">Building ID</Label>
              <Input
                id="buildingId"
                type="number"
                value={buildingId}
                onChange={(e) => setBuildingId(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="configId">Config ID</Label>
              <Input
                id="configId"
                type="number"
                value={configId}
                onChange={(e) => setConfigId(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="CAR_4_SEATS">Ô tô 4 chỗ</SelectItem>
                   <SelectItem value="CAR_7_SEATS">Ô tô 7 chỗ</SelectItem>
                   <SelectItem value="MOTORCYCLE">Xe máy</SelectItem>
                 </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="isActive">Is Active</Label>
              <Select value={isActive.toString()} onValueChange={(v) => setIsActive(v === 'true')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button onClick={testGetAll} disabled={loading}>
              GET All
            </Button>
            <Button onClick={testGetByBuilding} disabled={loading}>
              GET by Building
            </Button>
            <Button onClick={testCheckCapacity} disabled={loading}>
              Check Capacity
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button onClick={testCreateConfig} disabled={loading}>
              CREATE
            </Button>
            <Button onClick={testUpdateConfig} disabled={loading}>
              UPDATE
            </Button>
            <Button onClick={testDeleteConfig} disabled={loading}>
              DELETE
            </Button>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={testToggleActive} 
              disabled={loading}
              variant="destructive"
              className="w-48"
            >
              {loading ? 'Testing...' : 'Test Toggle Active'}
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {loading ? 'Đang test...' : 'Sẵn sàng test'}
            </span>
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Test Results</CardTitle>
          <CardDescription>
            Kết quả test các API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Chưa có kết quả test nào. Hãy click các button test ở trên.
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg border ${
                    result.isError ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{result.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={result.isError ? 'destructive' : 'default'}>
                        {result.isError ? 'Error' : 'Success'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {result.timestamp}
                      </span>
                    </div>
                  </div>
                  <pre className="text-sm overflow-x-auto bg-white p-3 rounded border">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
