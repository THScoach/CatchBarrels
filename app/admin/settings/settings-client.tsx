'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Settings,
  User,
  Palette,
  Link as LinkIcon,
  Bell,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Upload,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  lastWhopSync: Date | null;
}

interface SettingsClientProps {
  user: User | null;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();

  // Coach Profile State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [orgName, setOrgName] = useState('CatchBarrels');
  const [profileSaving, setProfileSaving] = useState(false);

  // Branding State
  const [accentColor, setAccentColor] = useState('#9D6FDB');
  const [logoUrl, setLogoUrl] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState({
    newUpload: true,
    flaggedSession: true,
    failedAnalysis: true,
  });

  // Whop Integration State
  const [whopSyncing, setWhopSyncing] = useState(false);
  const whopConnected = !!user?.lastWhopSync;

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      // Simulate save (in real app, would update via API)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Profile updated', {
        description: 'Your profile has been saved successfully.',
      });
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleWhopSync = async () => {
    setWhopSyncing(true);
    try {
      const response = await fetch('/api/admin/whop/sync-players', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync');
      }

      const result = await response.json();
      toast.success(`Synced ${result.syncedCount} players from Whop`);
      router.refresh();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync with Whop');
    } finally {
      setWhopSyncing(false);
    }
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
    toast.success('Notification preference updated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#9D6FDB]" />
            Coach & Org Settings
          </h1>
          <p className="text-gray-400 mt-1">
            Configure your profile, branding, and integrations
          </p>
        </div>
      </div>

      {/* Section 1: Coach Profile */}
      <Card className="bg-[#1A1A1A] border-[#9D6FDB]/20">
        <CardHeader className="border-b border-[#9D6FDB]/10">
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-[#9D6FDB]" />
            Coach Profile
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your personal information and organization details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="bg-black border-gray-700 text-white"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="bg-black border-gray-700 text-white"
                placeholder="coach@catchbarrels.app"
              />
            </div>

            {/* Organization */}
            <div className="space-y-2">
              <Label htmlFor="org" className="text-gray-300">
                Organization Name
              </Label>
              <Input
                id="org"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="bg-black border-gray-700 text-white"
                placeholder="CatchBarrels"
              />
            </div>

            {/* Role (Read-only) */}
            <div className="space-y-2">
              <Label className="text-gray-300">Role</Label>
              <div className="px-3 py-2 bg-black border border-gray-700 rounded-lg">
                <Badge className="bg-[#9D6FDB]/20 text-[#9D6FDB] border-[#9D6FDB]/30 capitalize">
                  {user?.role || 'coach'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[#9D6FDB] hover:bg-[#B88EE8] text-white rounded-lg transition disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${profileSaving ? 'animate-spin' : ''}`} />
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Branding */}
      <Card className="bg-[#1A1A1A] border-[#9D6FDB]/20">
        <CardHeader className="border-b border-[#9D6FDB]/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#9D6FDB]" />
            Branding
          </CardTitle>
          <CardDescription className="text-gray-400">
            Customize your coach control room appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Accent Color */}
            <div className="space-y-2">
              <Label htmlFor="accentColor" className="text-gray-300">
                Primary Accent Color
              </Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-700"
                  style={{ backgroundColor: accentColor }}
                />
                <Input
                  id="accentColor"
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="bg-black border-gray-700 text-white"
                  placeholder="#9D6FDB"
                />
              </div>
              <p className="text-xs text-gray-500">Default: Coach Purple (#9D6FDB)</p>
            </div>

            {/* Logo Upload (Placeholder) */}
            <div className="space-y-2">
              <Label className="text-gray-300">Organization Logo</Label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-[#9D6FDB]/30 transition cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                <p className="text-sm text-gray-400">Upload logo (coming soon)</p>
                <p className="text-xs text-gray-600 mt-1">SVG, PNG, or JPG (max 2MB)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Integrations */}
      <Card className="bg-[#1A1A1A] border-[#9D6FDB]/20">
        <CardHeader className="border-b border-[#9D6FDB]/10">
          <CardTitle className="text-white flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-[#9D6FDB]" />
            Integrations
          </CardTitle>
          <CardDescription className="text-gray-400">
            Connect external services for enhanced functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Whop Integration */}
          <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#9D6FDB]/20 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-[#9D6FDB]" />
              </div>
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  Whop
                  {whopConnected ? (
                    <Badge className="bg-green-900/20 text-green-400 border-green-700/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-700/20 text-gray-400 border-gray-700/30">
                      <XCircle className="w-3 h-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-400">
                  Membership management and player sync
                  {user?.lastWhopSync && (
                    <span className="ml-2 text-gray-600">
                      • Last sync: {format(new Date(user.lastWhopSync), 'MMM d, h:mm a')}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleWhopSync}
              disabled={whopSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-[#9D6FDB]/10 hover:bg-[#9D6FDB]/20 text-[#9D6FDB] rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${whopSyncing ? 'animate-spin' : ''}`} />
              {whopSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          {/* Future Integrations (Placeholders) */}
          {[
            {
              name: 'S2 Cognition',
              description: 'Advanced cognitive assessment integration',
              connected: false,
            },
            {
              name: 'Synapse Sport Science',
              description: 'Biomechanics and force plate data',
              connected: false,
            },
            {
              name: 'HitTrax',
              description: 'Ball flight data and metrics',
              connected: false,
            },
          ].map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800 opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-gray-300 font-semibold flex items-center gap-2">
                    {integration.name}
                    <Badge className="bg-gray-700/20 text-gray-400 border-gray-700/30 text-xs">
                      Coming Soon
                    </Badge>
                  </h3>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
              </div>
              <button
                disabled
                className="px-4 py-2 bg-gray-800 text-gray-600 rounded-lg cursor-not-allowed"
              >
                Connect
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 4: Notifications */}
      <Card className="bg-[#1A1A1A] border-[#9D6FDB]/20">
        <CardHeader className="border-b border-[#9D6FDB]/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#9D6FDB]" />
            Notifications
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure email alerts for important events
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[
            {
              key: 'newUpload' as const,
              label: 'New Upload',
              description: 'Notify me when a player uploads a new video',
            },
            {
              key: 'flaggedSession' as const,
              label: 'Flagged Session',
              description: 'Alert me when a session is automatically flagged (low score or drop)',
            },
            {
              key: 'failedAnalysis' as const,
              label: 'Failed Analysis',
              description: 'Notify me when video analysis fails',
            },
          ].map((notif) => (
            <div
              key={notif.key}
              className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-800"
            >
              <div>
                <h3 className="text-white font-medium">{notif.label}</h3>
                <p className="text-sm text-gray-400">{notif.description}</p>
              </div>
              <button
                onClick={() => handleToggleNotification(notif.key)}
                className={`relative w-12 h-6 rounded-full transition ${
                  notifications[notif.key] ? 'bg-[#9D6FDB]' : 'bg-gray-700'
                }`}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{ x: notifications[notif.key] ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
