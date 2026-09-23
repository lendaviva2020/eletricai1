export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TenantRole = 'admin' | 'engineer' | 'member';

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          cnpj: string;
          location: string;
          plan: string;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cnpj: string;
          location: string;
          plan?: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cnpj?: string;
          location?: string;
          plan?: string;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          email: string;
          role: TenantRole;
          role_title: string;
          crea_number: string | null;
          status: 'ONLINE' | 'EM_CAMPO' | 'OFFLINE';
          last_active: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          name: string;
          email: string;
          role?: TenantRole;
          role_title?: string;
          crea_number?: string | null;
          status?: 'ONLINE' | 'EM_CAMPO' | 'OFFLINE';
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          email?: string;
          role?: TenantRole;
          role_title?: string;
          crea_number?: string | null;
          status?: 'ONLINE' | 'EM_CAMPO' | 'OFFLINE';
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          }
        ];
      };
      projects: {
        Row: {
          id: string;
          tenant_id: string;
          code: string;
          name: string;
          type: string;
          type_label: string;
          status: string;
          progress_percent: number;
          nominal_voltage: string;
          normative_standard: string;
          target_tab: string;
          description: string;
          created_by_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          code: string;
          name: string;
          type: string;
          type_label: string;
          status?: string;
          progress_percent?: number;
          nominal_voltage?: string;
          normative_standard?: string;
          target_tab?: string;
          description?: string;
          created_by_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          code?: string;
          name?: string;
          type?: string;
          type_label?: string;
          status?: string;
          progress_percent?: number;
          nominal_voltage?: string;
          normative_standard?: string;
          target_tab?: string;
          description?: string;
          created_by_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          }
        ];
      };
      shared_tags: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          name: string;
          description: string;
          address: string;
          data_type: string;
          direction: string;
          current_value: Json;
          unit: string;
          is_alarm_active: boolean;
          last_updated: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id?: string | null;
          name: string;
          description: string;
          address: string;
          data_type: string;
          direction: string;
          current_value: Json;
          unit?: string;
          is_alarm_active?: boolean;
          last_updated?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          name?: string;
          description?: string;
          address?: string;
          data_type?: string;
          direction?: string;
          current_value?: Json;
          unit?: string;
          is_alarm_active?: boolean;
          last_updated?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'shared_tags_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          }
        ];
      };
      components: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          tag: string;
          name: string;
          type: string;
          voltage: string;
          rated_current: number;
          current: number;
          power_kw: number;
          cable_section_mm2: number;
          status: string;
          is_energized: boolean;
          position_x: number;
          position_y: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id?: string | null;
          tag: string;
          name: string;
          type: string;
          voltage: string;
          rated_current?: number;
          current?: number;
          power_kw?: number;
          cable_section_mm2?: number;
          status?: string;
          is_energized?: boolean;
          position_x?: number;
          position_y?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          tag?: string;
          name?: string;
          type?: string;
          voltage?: string;
          rated_current?: number;
          current?: number;
          power_kw?: number;
          cable_section_mm2?: number;
          status?: string;
          is_energized?: boolean;
          position_x?: number;
          position_y?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'components_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          }
        ];
      };
      alerts: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          title: string;
          description: string;
          severity: string;
          category: string;
          source_tag: string | null;
          component_id: string | null;
          target_tab: string;
          suggested_action: string;
          is_resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id?: string | null;
          title: string;
          description: string;
          severity: string;
          category: string;
          source_tag?: string | null;
          component_id?: string | null;
          target_tab?: string;
          suggested_action: string;
          is_resolved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          title?: string;
          description?: string;
          severity?: string;
          category?: string;
          source_tag?: string | null;
          component_id?: string | null;
          target_tab?: string;
          suggested_action?: string;
          is_resolved?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'alerts_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          }
        ];
      };
      activity_events: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          type: string;
          title: string;
          description: string;
          user_name: string;
          user_role: string;
          badge_color: string;
          target_tab: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id?: string | null;
          type: string;
          title: string;
          description: string;
          user_name: string;
          user_role?: string;
          badge_color?: string;
          target_tab?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          type?: string;
          title?: string;
          description?: string;
          user_name?: string;
          user_role?: string;
          badge_color?: string;
          target_tab?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_events_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_auth_tenant_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_auth_role: {
        Args: Record<PropertyKey, never>;
        Returns: TenantRole;
      };
    };
    Enums: {
      tenant_role: TenantRole;
      project_status: 'EM_EXECUCAO' | 'EM_COMISSIONAMENTO' | 'CONCLUIDO' | 'REVISAO_TECNICA';
      alert_severity: 'CRITICO' | 'ATENCAO' | 'RECOMENDACAO' | 'RESOLVIDO';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
