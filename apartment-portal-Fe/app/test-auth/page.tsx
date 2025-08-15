"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getToken, getCurrentUser, getRoleNames, validateToken, refreshToken, removeTokens } from '@/lib/auth';
import { toast } from '@/components/ui/use-toast';

export default function TestAuthPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAuthInfo();
  }, []);

  const loadAuthInfo = () => {
    const currentToken = getToken();
    const currentUser = getCurrentUser();
    const currentRoles = currentUser ? getRoleNames(currentUser) : [];
    
    setToken(currentToken);
    setUser(currentUser);
    setRoles(currentRoles);
  };

  const handleValidateToken = async () => {
    setLoading(true);
    try {
      const valid = await validateToken();
      setIsValid(valid);
      toast({
        title: valid ? 'Thành công' : 'Thất bại',
        description: valid ? 'Token hợp lệ' : 'Token không hợp lệ',
        variant: valid ? 'default' : 'destructive'
      });
    } catch (error) {
      setIsValid(false);
      toast({
        title: 'Lỗi',
        description: 'Không thể validate token',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    setLoading(true);
    try {
      const refreshed = await refreshToken();
      if (refreshed && refreshed.token) {
        toast({
          title: 'Thành công',
          description: 'Refresh token thành công'
        });
        loadAuthInfo(); // Reload thông tin
      } else {
        toast({
          title: 'Thất bại',
          description: 'Không thể refresh token',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Lỗi khi refresh token',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeTokens();
    loadAuthInfo();
    toast({
      title: 'Thành công',
      description: 'Đã logout'
    });
  };

  const handleTestAdminAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast({
          title: 'Thành công',
          description: 'API admin hoạt động bình thường'
        });
      } else if (response.status === 401) {
        toast({
          title: 'Lỗi 401',
          description: 'Token không hợp lệ hoặc hết hạn',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Lỗi',
          description: `API trả về status: ${response.status}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể gọi API',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Test Authentication</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Token Info */}
        <Card>
          <CardHeader>
            <CardTitle>Token Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Token:</label>
              <div className="bg-gray-100 p-2 rounded text-sm break-all">
                {token ? `${token.substring(0, 50)}...` : 'Không có token'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Token Status:</label>
              <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                isValid === null ? 'bg-gray-100 text-gray-700' :
                isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isValid === null ? 'Chưa kiểm tra' : isValid ? 'Hợp lệ' : 'Không hợp lệ'}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleValidateToken} 
                disabled={loading || !token}
                size="sm"
              >
                Validate Token
              </Button>
              <Button 
                onClick={handleRefreshToken} 
                disabled={loading || !token}
                variant="outline"
                size="sm"
              >
                Refresh Token
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">User:</label>
              <div className="bg-gray-100 p-2 rounded text-sm">
                {user ? JSON.stringify(user, null, 2) : 'Không có user'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Roles:</label>
              <div className="flex flex-wrap gap-1">
                {roles.length > 0 ? (
                  roles.map((role, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">Không có roles</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Is Admin:</label>
              <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                roles.includes('ADMIN') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {roles.includes('ADMIN') ? 'Có' : 'Không'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleTestAdminAPI} 
              disabled={loading || !token}
              variant="outline"
            >
              Test Admin API
            </Button>
            
            <Button 
              onClick={handleLogout} 
              disabled={loading}
              variant="destructive"
            >
              Logout
            </Button>
            
            <Button 
              onClick={loadAuthInfo} 
              disabled={loading}
              variant="outline"
            >
              Reload Info
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Hướng dẫn:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Kiểm tra token có tồn tại không</li>
              <li>Validate token có hợp lệ không</li>
              <li>Refresh token nếu cần</li>
              <li>Test API admin để kiểm tra quyền</li>
              <li>Logout để xóa token</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
