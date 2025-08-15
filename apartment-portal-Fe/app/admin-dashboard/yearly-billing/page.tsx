"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/auth/admin-guard';
import { useLanguage } from '@/lib/i18n';
import YearlyBillingForm from '@/components/admin/YearlyBillingForm';
import CurrentBillingConfig from '@/components/admin/CurrentBillingConfig';
import BillingHistoryComponent from '@/components/admin/BillingHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useApartments, Apartment } from '@/hooks/use-apartments';
import { 
  Calculator, 
  Calendar, 
  Building, 
  DollarSign, 
  Info,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function YearlyBillingPage() {
  return (
    <AdminGuard>
      <YearlyBillingPageContent />
    </AdminGuard>
  );
}

function YearlyBillingPageContent() {
  const { t, language } = useLanguage();
  const { apartments, loading, error } = useApartments();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.yearly-billing.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title={`${t('admin.yearly-billing.title')} ${currentYear}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">{t('admin.error.load')}</p>
            <p className="text-gray-600 mt-2">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              {t('admin.action.retry')}
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`${t('admin.yearly-billing.title')} ${currentYear}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              {t('admin.yearly-billing.title')}
            </h2>
            <p className="text-gray-600">
              {t('admin.yearly-billing.subtitle')}
            </p>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('admin.yearly-billing.scope')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12 {t('admin.yearly-billing.months')}</p>
              <p className="text-xs text-gray-500">{t('admin.yearly-billing.year')}: {currentYear}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                {t('admin.apartments.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{apartments.length}</p>
              <p className="text-xs text-gray-500">{t('admin.yearly-billing.allApartments')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('admin.yearly-billing.feeConfig')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-gray-500">{t('admin.invoices.feeType.SERVICE_FEE')}, {t('admin.invoices.feeType.WATER_FEE')}, {t('admin.invoices.feeType.VEHICLE_FEE')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="create">{t('admin.yearly-billing.create')}</TabsTrigger>
              <TabsTrigger value="config">{t('admin.yearly-billing.config')}</TabsTrigger>
              <TabsTrigger value="history">{t('admin.yearly-billing.history')}</TabsTrigger>
              <TabsTrigger value="info">{t('admin.yearly-billing.info')}</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <YearlyBillingForm apartments={apartments} />
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <CurrentBillingConfig year={currentYear} month={currentMonth} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <BillingHistoryComponent />
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* How it works */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    {t('admin.yearly-billing.info')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary" className="mt-1">1</Badge>
                      <div>
                        <p className="font-medium">{t('admin.yearly-billing.step1.title')}</p>
                        <p className="text-sm text-gray-600">{t('admin.yearly-billing.step1.description').replace('{year}', currentYear.toString())}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary" className="mt-1">2</Badge>
                      <div>
                        <p className="font-medium">{t('admin.yearly-billing.step2.title')}</p>
                        <p className="text-sm text-gray-600">{t('admin.yearly-billing.step2.description')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary" className="mt-1">3</Badge>
                      <div>
                        <p className="font-medium">{t('admin.yearly-billing.step3.title')}</p>
                        <p className="text-sm text-gray-600">{t('admin.yearly-billing.step3.description')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fee calculation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    {t('admin.yearly-billing.feeSummary')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-3">
                      <p className="font-medium text-sm">{t('admin.invoices.feeType.SERVICE_FEE')}</p>
                      <p className="text-xs text-gray-600">{t('admin.yearly-billing.feeCalculation.service')}</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-3">
                      <p className="font-medium text-sm">{t('admin.invoices.feeType.WATER_FEE')}</p>
                      <p className="text-xs text-gray-600">{t('admin.yearly-billing.feeCalculation.water')}</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-3">
                      <p className="font-medium text-sm">{t('admin.invoices.feeType.VEHICLE_FEE')}</p>
                      <p className="text-xs text-gray-600">{t('admin.yearly-billing.feeCalculation.vehicle')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Important notes */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {t('admin.yearly-billing.importantNotes')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{t('admin.yearly-billing.note1.title')}</p>
                          <p className="text-xs text-gray-600">{t('admin.yearly-billing.note1.description')}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{t('admin.yearly-billing.note2.title')}</p>
                          <p className="text-xs text-gray-600">{t('admin.yearly-billing.note2.description')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{t('admin.yearly-billing.note3.title')}</p>
                          <p className="text-xs text-gray-600">{t('admin.yearly-billing.note3.description')}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{t('admin.yearly-billing.note4.title')}</p>
                          <p className="text-xs text-gray-600">{t('admin.yearly-billing.note4.description')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* API Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t('admin.yearly-billing.apiInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-sm">{t('admin.yearly-billing.api.mainEndpoint')}:</p>
                      <code className="text-xs text-blue-600">POST /api/admin/yearly-billing/generate-current-year</code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-sm">{t('admin.yearly-billing.api.feeConfig')}:</p>
                      <code className="text-xs text-blue-600">POST /api/admin/yearly-billing/fee-config</code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-sm">{t('admin.yearly-billing.api.updateMonth')}:</p>
                      <code className="text-xs text-blue-600">PUT /api/admin/yearly-billing/config/{'{year}'}/{'{month}'}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 