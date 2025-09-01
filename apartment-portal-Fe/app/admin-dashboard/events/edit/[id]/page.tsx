"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle,
  Calendar,
  MapPin,
  FileText,
  Clock,
  Edit,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { eventsApi, Event, EventUpdateRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function EditEventPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const eventId = parseInt(params.id as string);
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EventUpdateRequest>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
  });

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getById(eventId);
      setEvent(data);
      setFormData({
        title: data.title,
        description: data.description,
        startTime: data.startTime.slice(0, 16), // Format for datetime-local input
        endTime: data.endTime.slice(0, 16), // Format for datetime-local input
        location: data.location,
      });
    } catch (error) {
      toast({
        title: t('admin.error.load', 'Error'),
        description: t('admin.events.loadError', 'Cannot load event information'),
        variant: "destructive",
      });
      router.push('/admin-dashboard/events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim() || !formData.description?.trim() || 
        !formData.startTime || !formData.endTime || !formData.location?.trim()) {
      toast({
        title: t('admin.error.validation', 'Error'),
        description: t('validation.required', 'Please fill in all required information'),
        variant: "destructive",
      });
      return;
    }

    // Validate time
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    
    if (startTime >= endTime) {
      toast({
        title: t('admin.error.validation', 'Error'),
        description: t('admin.events.time.invalid', 'End time must be after start time'),
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await eventsApi.update(eventId, formData);
      toast({
        title: t('admin.success.update', 'Success'),
        description: t('admin.events.updateSuccess', 'Event updated successfully'),
      });
      router.push(`/admin-dashboard/events/${eventId}`);
    } catch (error) {
      toast({
        title: t('admin.error.update', 'Error'),
        description: t('admin.events.updateError', 'Cannot update event'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof EventUpdateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  if (loading) {
    return (
      <AdminLayout title={t('admin.events.edit', 'Edit Event')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.loading', 'Loading...')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout title={t('admin.events.notFound', 'Event Not Found')}>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {t('admin.events.notFound', 'Event Not Found')}
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {t('admin.events.notFoundDesc', 'The event you are looking for does not exist or has been deleted.')}
          </p>
          <Link href="/admin-dashboard/events">
            <Button className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('admin.backToList', 'Back to List')}
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.events.edit', 'Edit Event')}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Link href={`/admin-dashboard/events/${event.id}`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4" />
                  {t('admin.action.back', 'Back')}
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Edit className="h-8 w-8 text-blue-600" />
                  {t('admin.events.edit', 'Edit Event')}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t('admin.events.editDesc', 'Update event information')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
              <FileText className="h-6 w-6 text-blue-600" />
              {t('admin.events.eventInfo', 'Event Information')}
            </CardTitle>
            <p className="text-sm text-gray-600 font-normal">
              {t('admin.events.editFormDesc', 'Modify the details below to update your event')}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <Label htmlFor="title" className="text-base font-semibold text-gray-700">
                    {t('admin.events.name', 'Event Name')} *
                  </Label>
                </div>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('admin.events.namePlaceholder', 'Enter event name')}
                  className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <Label htmlFor="description" className="text-base font-semibold text-gray-700">
                    {t('admin.events.description', 'Description')} *
                  </Label>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('admin.events.descriptionPlaceholder', 'Enter event description')}
                  rows={5}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                  required
                />
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <Label htmlFor="location" className="text-base font-semibold text-gray-700">
                    {t('admin.events.location', 'Location')} *
                  </Label>
                </div>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={t('admin.events.locationPlaceholder', 'Enter event location')}
                  className="h-12 text-base border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>

              <Separator className="my-8" />

              {/* Time Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <Label className="text-base font-semibold text-gray-700">
                    {t('admin.events.timeSettings', 'Time Settings')}
                  </Label>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Start Time */}
                  <div className="space-y-3">
                    <Label htmlFor="startTime" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      {t('admin.events.startTime', 'Start Time')} *
                    </Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>

                  {/* End Time */}
                  <div className="space-y-3">
                    <Label htmlFor="endTime" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-600" />
                      {t('admin.events.endTime', 'End Time')} *
                    </Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                {/* Time Validation Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">{t('admin.events.timeValidation.title', 'Time Note')}</p>
                      <p>{t('admin.events.timeValidation.desc', 'End time must be after start time')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Submit Section */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Link href={`/admin-dashboard/events/${event.id}`} className="w-full sm:w-auto">
                  <Button variant="outline" type="button" className="w-full sm:w-auto h-12 px-8 hover:bg-gray-50">
                    {t('admin.action.cancel', 'Cancel')}
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="w-full sm:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('admin.action.saving', 'Saving...')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t('admin.action.saveChanges', 'Save Changes')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 