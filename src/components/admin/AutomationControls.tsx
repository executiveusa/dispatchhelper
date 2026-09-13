/**
 * Automation Controls Component
 * 
 * Provides dispatcher with visible controls for AI automation:
 * - Kill switch to pause all automations
 * - Mode toggle (suggest_only vs auto_act)
 * - Status indicator
 * 
 * CRITICAL: This gives dispatcher full control over automation
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Pause, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutomationControlsProps {
  tenantId: string;
  userId: string;
}

interface TenantSettings {
  automation_mode?: 'suggest_only' | 'auto_act';
  automation_paused?: boolean;
}

export function AutomationControls({ tenantId, userId }: AutomationControlsProps) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<TenantSettings>({
    automation_mode: 'suggest_only',
    automation_paused: false,
  });
  const { toast } = useToast();

  // Load current settings
  useEffect(() => {
    loadSettings();
  }, [tenantId]);

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', tenantId)
        .single();

      if (error) throw error;

      if (data?.settings) {
        setSettings({
          automation_mode: data.settings.automation_mode || 'suggest_only',
          automation_paused: data.settings.automation_paused || false,
        });
      }
    } catch (error: any) {
      console.error('Error loading automation settings:', error);
    }
  }

  async function updateSettings(newSettings: Partial<TenantSettings>) {
    setLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };

      const { error } = await supabase
        .from('tenants')
        .update({
          settings: updatedSettings,
        })
        .eq('id', tenantId);

      if (error) throw error;

      setSettings(updatedSettings);

      // Log the change as an event
      await supabase.from('events').insert({
        tenant_id: tenantId,
        event_type: 'automation_config_change',
        description: `Automation settings updated by user`,
        metadata: {
          user_id: userId,
          old_settings: settings,
          new_settings: updatedSettings,
          timestamp: new Date().toISOString(),
        },
      });

      toast({
        title: 'Settings updated',
        description: 'Automation settings have been saved.',
      });
    } catch (error: any) {
      console.error('Error updating automation settings:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function togglePause() {
    const newPaused = !settings.automation_paused;
    await updateSettings({ automation_paused: newPaused });

    toast({
      title: newPaused ? 'Automation Paused' : 'Automation Resumed',
      description: newPaused
        ? 'All AI automations are now paused. Only suggestions will be shown.'
        : 'AI automations have been resumed.',
      variant: newPaused ? 'default' : 'default',
    });
  }

  async function toggleMode() {
    const newMode = settings.automation_mode === 'suggest_only' ? 'auto_act' : 'suggest_only';
    await updateSettings({ automation_mode: newMode });

    toast({
      title: 'Mode Changed',
      description: newMode === 'suggest_only'
        ? 'AI will now suggest actions without auto-executing'
        : 'AI can now automatically execute approved actions',
    });
  }

  const isPaused = settings.automation_paused;
  const isAutoAct = settings.automation_mode === 'auto_act';

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Automation Controls
              <Badge variant={isPaused ? 'destructive' : 'default'}>
                {isPaused ? (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Paused
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Active
                  </>
                )}
              </Badge>
            </CardTitle>
            <CardDescription>
              Control AI automation behavior and safety
            </CardDescription>
          </div>
          
          {/* KILL SWITCH - Always visible */}
          <Button
            variant={isPaused ? 'default' : 'destructive'}
            size="lg"
            onClick={togglePause}
            disabled={loading}
            className="font-bold"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume All
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause All
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          {isPaused ? (
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-medium">
              {isPaused ? 'All automations paused' : 'Automations running'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isPaused
                ? 'AI can only make suggestions. No automatic actions will be taken.'
                : isAutoAct
                ? 'AI can automatically execute approved actions.'
                : 'AI will suggest actions for your approval.'}
            </p>
          </div>
        </div>

        {/* Mode Control */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <p className="font-medium">Automation Mode</p>
            <p className="text-sm text-muted-foreground">
              {isAutoAct
                ? 'AI can automatically execute actions'
                : 'AI suggests actions for manual approval'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {isAutoAct ? 'Auto-Act' : 'Suggest Only'}
            </span>
            <Switch
              checked={isAutoAct}
              onCheckedChange={toggleMode}
              disabled={loading || isPaused}
            />
          </div>
        </div>

        {/* Warning Message */}
        {isAutoAct && !isPaused && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <p className="text-sm text-yellow-600">
              <strong>Auto-Act mode enabled:</strong> AI can automatically create loads,
              assign drivers, and update statuses. Use the pause button if you need to
              stop all automations immediately.
            </p>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>• <strong>Suggest Only:</strong> Safe default - AI shows recommendations</p>
          <p>• <strong>Auto-Act:</strong> AI can execute - use after testing</p>
          <p>• <strong>Pause:</strong> Emergency stop - AI can only suggest</p>
        </div>
      </CardContent>
    </Card>
  );
}
