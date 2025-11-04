import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Shield,
  DollarSign,
  Users,
  Bell,
  Globe,
  Database,
  Mail,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface PlatformSettings {
  // General Settings
  platformName: string;
  platformDescription: string;
  supportEmail: string;
  supportPhone: string;
  platformAddress: string;
  timezone: string;
  
  // Business Settings
  defaultCommissionRate: number;
  minimumPayoutAmount: number;
  maximumPayoutAmount: number;
  payoutProcessingDays: number;
  
  // User Settings
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
  allowVendorRegistration: boolean;
  requireVendorApproval: boolean;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  
  // System Settings
  maintenanceMode: boolean;
  debugMode: boolean;
  autoBackup: boolean;
  backupFrequency: string;
}

const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: 'Home Bonzenga',
    platformDescription: 'Premium Beauty Services Platform',
    supportEmail: 'support@homebonzenga.com',
    supportPhone: '+243 123 456 789',
    platformAddress: 'Kinshasa, DR Congo',
    timezone: 'Africa/Kinshasa',
    defaultCommissionRate: 15,
    minimumPayoutAmount: 50,
    maximumPayoutAmount: 10000,
    payoutProcessingDays: 7,
    allowUserRegistration: true,
    requireEmailVerification: true,
    allowVendorRegistration: true,
    requireVendorApproval: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    backupFrequency: 'daily'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      } else {
        // Use default settings
        console.log('Using default settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      });

      if (response.ok) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      fetchSettings();
      toast.success('Settings reset to defaults');
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#4e342e]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div {...fadeInUp}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">Platform Settings</h1>
              <p className="text-[#6d4c41]">Configure global platform settings and preferences</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="border-[#4e342e] text-[#4e342e] hover:bg-[#4e342e] hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="bg-[#4e342e] hover:bg-[#6d4c41] text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Settings
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            {/* General Settings */}
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#4e342e] flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="platformName" className="text-[#4e342e] font-medium">Platform Name</Label>
                    <Input
                      id="platformName"
                      value={settings.platformName}
                      onChange={(e) => handleInputChange('platformName', e.target.value)}
                      className="mt-1 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone" className="text-[#4e342e] font-medium">Timezone</Label>
                    <select
                      id="timezone"
                      value={settings.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-[#f8d7da] rounded-md focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                    >
                      <option value="Africa/Kinshasa">Africa/Kinshasa</option>
                      <option value="Africa/Lagos">Africa/Lagos</option>
                      <option value="Africa/Cairo">Africa/Cairo</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="platformDescription" className="text-[#4e342e] font-medium">Platform Description</Label>
                  <Input
                    id="platformDescription"
                    value={settings.platformDescription}
                    onChange={(e) => handleInputChange('platformDescription', e.target.value)}
                    className="mt-1 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="supportEmail" className="text-[#4e342e] font-medium">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                      className="mt-1 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportPhone" className="text-[#4e342e] font-medium">Support Phone</Label>
                    <Input
                      id="supportPhone"
                      value={settings.supportPhone}
                      onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                      className="mt-1 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="platformAddress" className="text-[#4e342e] font-medium">Platform Address</Label>
                    <Input
                      id="platformAddress"
                      value={settings.platformAddress}
                      onChange={(e) => handleInputChange('platformAddress', e.target.value)}
                      className="mt-1 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Settings */}
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#4e342e] flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Business Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="defaultCommissionRate" className="text-[#4e342e] font-medium">Default Commission Rate (%)</Label>
                    <Input
                      id="defaultCommissionRate"
                      type="number"
                      min="0"
                      max="50"
                      value={settings.defaultCommissionRate}
                      onChange={(e) => handleInputChange('defaultCommissionRate', parseFloat(e.target.value))}
                      className="mt-1 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payoutProcessingDays" className="text-[#4e342e] font-medium">Payout Processing Days</Label>
                    <Input
                      id="payoutProcessingDays"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.payoutProcessingDays}
                      onChange={(e) => handleInputChange('payoutProcessingDays', parseInt(e.target.value))}
                      className="mt-1 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="minimumPayoutAmount" className="text-[#4e342e] font-medium">Minimum Payout Amount ($)</Label>
                    <Input
                      id="minimumPayoutAmount"
                      type="number"
                      min="0"
                      value={settings.minimumPayoutAmount}
                      onChange={(e) => handleInputChange('minimumPayoutAmount', parseFloat(e.target.value))}
                      className="mt-1 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maximumPayoutAmount" className="text-[#4e342e] font-medium">Maximum Payout Amount ($)</Label>
                    <Input
                      id="maximumPayoutAmount"
                      type="number"
                      min="0"
                      value={settings.maximumPayoutAmount}
                      onChange={(e) => handleInputChange('maximumPayoutAmount', parseFloat(e.target.value))}
                      className="mt-1 border-[#f8d7da] focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Settings */}
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#4e342e] flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[#4e342e] font-medium">Allow User Registration</Label>
                      <p className="text-sm text-[#6d4c41]">Allow new users to register on the platform</p>
                    </div>
                    <Switch
                      checked={settings.allowUserRegistration}
                      onCheckedChange={(checked) => handleInputChange('allowUserRegistration', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[#4e342e] font-medium">Require Email Verification</Label>
                      <p className="text-sm text-[#6d4c41]">Users must verify their email before accessing the platform</p>
                    </div>
                    <Switch
                      checked={settings.requireEmailVerification}
                      onCheckedChange={(checked) => handleInputChange('requireEmailVerification', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[#4e342e] font-medium">Allow Vendor Registration</Label>
                      <p className="text-sm text-[#6d4c41]">Allow new vendors to register on the platform</p>
                    </div>
                    <Switch
                      checked={settings.allowVendorRegistration}
                      onCheckedChange={(checked) => handleInputChange('allowVendorRegistration', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[#4e342e] font-medium">Require Vendor Approval</Label>
                      <p className="text-sm text-[#6d4c41]">Vendors must be approved by managers before going live</p>
                    </div>
                    <Switch
                      checked={settings.requireVendorApproval}
                      onCheckedChange={(checked) => handleInputChange('requireVendorApproval', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#4e342e] flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[#4e342e] font-medium">Email Notifications</Label>
                      <p className="text-sm text-[#6d4c41]">Send email notifications to users</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[#4e342e] font-medium">SMS Notifications</Label>
                      <p className="text-sm text-[#6d4c41]">Send SMS notifications to users</p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[#4e342e] font-medium">Push Notifications</Label>
                      <p className="text-sm text-[#6d4c41]">Send push notifications to mobile apps</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#4e342e] flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[#4e342e] font-medium">Maintenance Mode</Label>
                      <p className="text-sm text-[#6d4c41]">Put the platform in maintenance mode</p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[#4e342e] font-medium">Debug Mode</Label>
                      <p className="text-sm text-[#6d4c41]">Enable debug logging and detailed error messages</p>
                    </div>
                    <Switch
                      checked={settings.debugMode}
                      onCheckedChange={(checked) => handleInputChange('debugMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[#4e342e] font-medium">Auto Backup</Label>
                      <p className="text-sm text-[#6d4c41]">Automatically backup database and files</p>
                    </div>
                    <Switch
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) => handleInputChange('autoBackup', checked)}
                    />
                  </div>
                </div>
                
                {settings.autoBackup && (
                  <div>
                    <Label htmlFor="backupFrequency" className="text-[#4e342e] font-medium">Backup Frequency</Label>
                    <select
                      id="backupFrequency"
                      value={settings.backupFrequency}
                      onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-[#f8d7da] rounded-md focus:border-[#4e342e] focus:ring-[#4e342e]/20"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
