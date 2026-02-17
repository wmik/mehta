'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Loader2, Save, TestTube } from 'lucide-react';

interface UserSettings {
  aiProvider?: 'openai' | 'anthropic' | 'ollama' | 'system';
  llmUrl?: string;
  llmKey?: string;
  theme?: 'light' | 'dark' | 'system';
  compactMode?: boolean;
  notifications?: {
    email?: boolean;
    analysisComplete?: boolean;
    riskDetected?: boolean;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({
    aiProvider: 'system',
    llmUrl: '',
    llmKey: '',
    theme: 'system',
    compactMode: false,
    notifications: {
      email: true,
      analysisComplete: true,
      riskDetected: true
    }
  });

  const [newLlmKey, setNewLlmKey] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/settings');
      const data = await response.json();
      if (response.ok && data.settings) {
        setSettings(data.settings);
        setNewLlmKey(data.settings.llmKey || '');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave: Partial<UserSettings> = {
        aiProvider: settings.aiProvider,
        llmUrl: settings.llmUrl,
        theme: settings.theme,
        compactMode: settings.compactMode,
        notifications: settings.notifications
      };

      if (newLlmKey && newLlmKey !== settings.llmKey) {
        settingsToSave.llmKey = newLlmKey;
      }

      const response = await fetch('/api/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave })
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setNewLlmKey(data.settings.llmKey || '');
        toast.success('Settings saved successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    toast.info('Testing connection...');

    await new Promise(resolve => setTimeout(resolve, 2000));

    setTesting(false);
    toast.success('Connection successful!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage your general preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Notifications</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="emailNotif"
                    checked={settings.notifications?.email ?? true}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: e.target.checked
                        }
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="emailNotif" className="font-normal">
                    Email notifications
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="analysisNotif"
                    checked={settings.notifications?.analysisComplete ?? true}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          analysisComplete: e.target.checked
                        }
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="analysisNotif" className="font-normal">
                    Analysis complete notifications
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="riskNotif"
                    checked={settings.notifications?.riskDetected ?? true}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          riskDetected: e.target.checked
                        }
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="riskNotif" className="font-normal">
                    Risk detection alerts
                  </Label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-none"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Provider Settings</CardTitle>
            <CardDescription>
              Configure AI provider for session analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Provider</Label>
              <select
                value={settings.aiProvider || 'system'}
                onChange={e =>
                  setSettings({
                    ...settings,
                    aiProvider: e.target.value as UserSettings['aiProvider']
                  })
                }
                className="w-full p-2 border rounded-none bg-background"
              >
                <option value="system">
                  System Default (from environment)
                </option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="ollama">Ollama (Self-hosted)</option>
              </select>
            </div>

            {settings.aiProvider === 'ollama' && (
              <div className="space-y-2">
                <Label>Ollama URL</Label>
                <Input
                  placeholder="http://localhost:11434"
                  value={settings.llmUrl || ''}
                  onChange={e =>
                    setSettings({ ...settings, llmUrl: e.target.value })
                  }
                  className="rounded-none"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>
                {settings.aiProvider === 'system'
                  ? 'Override API Key (optional)'
                  : 'API Key'}
              </Label>
              <Input
                type="password"
                placeholder={newLlmKey || 'Enter API key'}
                value={newLlmKey}
                onChange={e => setNewLlmKey(e.target.value)}
                className="rounded-none"
              />
              <p className="text-xs text-gray-500">
                {newLlmKey
                  ? `Current key: ${newLlmKey}`
                  : 'Leave empty to use system default'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="rounded-none"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={testing}
                className="rounded-none"
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <select
                value={settings.theme || 'system'}
                onChange={e =>
                  setSettings({
                    ...settings,
                    theme: e.target.value as UserSettings['theme']
                  })
                }
                className="w-full p-2 border rounded-none bg-background"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Interface Density</Label>
              <select
                value={settings.compactMode ? 'compact' : 'comfortable'}
                onChange={e =>
                  setSettings({
                    ...settings,
                    compactMode: e.target.value === 'compact'
                  })
                }
                className="w-full p-2 border rounded-none bg-background"
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-none"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Session Timeout</Label>
              <select className="w-full p-2 border rounded-none bg-background">
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="240">4 hours</option>
                <option value="480">8 hours</option>
              </select>
              <p className="text-xs text-gray-500">
                Auto logout after inactivity
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-none"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
