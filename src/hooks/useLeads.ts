import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { calculatePriority, calculatePriorityFromBudget, getNextFollowup } from '@/lib/constants';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Lead = Tables<'leads'>;

export function useLeads() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['leads', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Lead;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (lead: Omit<TablesInsert<'leads'>, 'user_id'>) => {
      const value = lead.estimated_value ?? 0;
      const budget = (lead as any).orcamento || '';
      const priority = budget ? calculatePriorityFromBudget(budget) : calculatePriority(value);
      const status = lead.status ?? 'Novo lead';
      const followup = getNextFollowup(status);
      const { data, error } = await supabase.from('leads').insert({
        ...lead,
        user_id: user!.id,
        priority_level: priority,
        status,
        next_followup_at: followup.toISOString(),
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Lead>) => {
      const patch: Record<string, unknown> = { ...updates };
      if (updates.estimated_value != null) {
        patch.priority_level = calculatePriority(updates.estimated_value);
      }
      if ((updates as any).orcamento) {
        patch.priority_level = calculatePriorityFromBudget((updates as any).orcamento);
      }
      if (updates.status) {
        patch.next_followup_at = getNextFollowup(updates.status).toISOString();
      }
      const { data, error } = await supabase.from('leads').update(patch).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead', data.id] });
    },
  });
}

export function useInteractions(leadId: string) {
  return useQuery({
    queryKey: ['interactions', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!leadId,
  });
}

export function useCreateInteraction() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (interaction: Omit<TablesInsert<'interactions'>, 'user_id'>) => {
      const { data, error } = await supabase.from('interactions').insert({
        ...interaction,
        user_id: user!.id,
      }).select().single();
      if (error) throw error;
      await supabase.from('leads').update({ last_interaction_at: new Date().toISOString() }).eq('id', interaction.lead_id);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['interactions', data.lead_id] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead', data.lead_id] });
    },
  });
}
