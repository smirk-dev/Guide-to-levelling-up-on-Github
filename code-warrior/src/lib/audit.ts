import type { SupabaseClient } from '@supabase/supabase-js';

interface AuditEventInput {
  userId: string;
  githubId: string;
  action: string;
  entityType: string;
  entityId?: string;
  xpDelta?: number;
  metadata?: Record<string, unknown>;
}

export async function logAuditEvent(
  supabase: SupabaseClient,
  event: AuditEventInput
): Promise<void> {
  const { error } = await supabase.from('audit_events').insert({
    user_id: event.userId,
    github_id: event.githubId,
    action: event.action,
    entity_type: event.entityType,
    entity_id: event.entityId ?? null,
    xp_delta: event.xpDelta ?? 0,
    metadata: event.metadata ?? {},
  });

  if (error) {
    console.error('Failed to write audit event:', {
      action: event.action,
      error,
    });
  }
}
