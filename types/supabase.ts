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
      connections: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          from_id: string;
          to_id: string;
          from_port: string;
          to_port: string;
          is_energized: boolean;
          voltage_drop_percent: number;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          project_id?: string | null;
          from_id: string;
          to_id: string;
          from_port?: string;
          to_port?: string;
          is_energized?: boolean;
          voltage_drop_percent?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          from_id?: string;
          to_id?: string;
          from_port?: string;
          to_port?: string;
          is_energized?: boolean;
          voltage_drop_percent?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      ladder_rungs: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          rung_index: number;
          comment: string | null;
          is_power_flow_active: boolean;
          elements: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          project_id?: string | null;
          rung_index: number;
          comment?: string | null;
          is_power_flow_active?: boolean;
          elements?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          rung_index?: number;
          comment?: string | null;
          is_power_flow_active?: boolean;
          elements?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_revisions: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string;
          revision_number: number;
          revision_code: string;
          title: string;
          description: string | null;
          snapshot_data: Json;
          components_count: number;
          connections_count: number;
          created_by_id: string | null;
          author_name: string | null;
          crea_art: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id: string;
          revision_number?: number;
          revision_code?: string;
          title?: string;
          description?: string | null;
          snapshot_data: Json;
          components_count?: number;
          connections_count?: number;
          created_by_id?: string | null;
          author_name?: string | null;
          crea_art?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string;
          revision_number?: number;
          revision_code?: string;
          title?: string;
          description?: string | null;
          snapshot_data?: Json;
          components_count?: number;
          connections_count?: number;
          created_by_id?: string | null;
          author_name?: string | null;
          crea_art?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      circuits: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string;
          circuit_number: string;
          name: string;
          panel_tag: string;
          voltage_v: number;
          phases: string;
          power_kw: number;
          power_factor: number;
          ib_amperes: number;
          in_amperes: number;
          cable_section_mm2: number;
          cable_length_m: number;
          cable_insulation: string;
          installation_method: string;
          grouping_factor: number;
          temp_factor: number;
          voltage_drop_percent: number;
          breaker_model: string | null;
          protection_device: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id: string;
          circuit_number: string;
          name: string;
          panel_tag?: string;
          voltage_v?: number;
          phases?: string;
          power_kw?: number;
          power_factor?: number;
          ib_amperes?: number;
          in_amperes?: number;
          cable_section_mm2?: number;
          cable_length_m?: number;
          cable_insulation?: string;
          installation_method?: string;
          grouping_factor?: number;
          temp_factor?: number;
          voltage_drop_percent?: number;
          breaker_model?: string | null;
          protection_device?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string;
          circuit_number?: string;
          name?: string;
          panel_tag?: string;
          voltage_v?: number;
          phases?: string;
          power_kw?: number;
          power_factor?: number;
          ib_amperes?: number;
          in_amperes?: number;
          cable_section_mm2?: number;
          cable_length_m?: number;
          cable_insulation?: string;
          installation_method?: string;
          grouping_factor?: number;
          temp_factor?: number;
          voltage_drop_percent?: number;
          breaker_model?: string | null;
          protection_device?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      symbol_library: {
        Row: {
          id: string;
          tenant_id: string | null;
          category: string;
          subcategory: string | null;
          standard: string;
          name: string;
          description: string | null;
          view_box: string;
          svg_paths: string;
          default_properties: Json;
          connection_points: Json;
          validation_rules: Json;
          manufacturer: string | null;
          model: string | null;
          datasheet_url: string | null;
          is_global: boolean;
          version: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id?: string | null;
          category: string;
          subcategory?: string | null;
          standard?: string;
          name: string;
          description?: string | null;
          view_box?: string;
          svg_paths: string;
          default_properties?: Json;
          connection_points?: Json;
          validation_rules?: Json;
          manufacturer?: string | null;
          model?: string | null;
          datasheet_url?: string | null;
          is_global?: boolean;
          version?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          category?: string;
          subcategory?: string | null;
          standard?: string;
          name?: string;
          description?: string | null;
          view_box?: string;
          svg_paths?: string;
          default_properties?: Json;
          connection_points?: Json;
          validation_rules?: Json;
          manufacturer?: string | null;
          model?: string | null;
          datasheet_url?: string | null;
          is_global?: boolean;
          version?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      engineering_audit_logs: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          user_id: string | null;
          user_name: string;
          action: string;
          target_entity: string;
          entity_id: string | null;
          changes: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id?: string | null;
          user_id?: string | null;
          user_name?: string;
          action: string;
          target_entity: string;
          entity_id?: string | null;
          changes?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          user_id?: string | null;
          user_name?: string;
          action?: string;
          target_entity?: string;
          entity_id?: string | null;
          changes?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      technical_documents: {
        Row: {
          id: string;
          tenant_id: string;
          project_id: string | null;
          name: string;
          file_name: string;
          file_type: string;
          file_size_bytes: number;
          file_sha256: string;
          storage_path: string | null;
          status: string;
          page_count: number;
          manufacturer: string | null;
          equipment_model: string | null;
          equipment_category: string | null;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          project_id?: string | null;
          name: string;
          file_name: string;
          file_type?: string;
          file_size_bytes?: number;
          file_sha256: string;
          storage_path?: string | null;
          status?: string;
          page_count?: number;
          manufacturer?: string | null;
          equipment_model?: string | null;
          equipment_category?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          project_id?: string | null;
          name?: string;
          file_name?: string;
          file_type?: string;
          file_size_bytes?: number;
          file_sha256?: string;
          storage_path?: string | null;
          status?: string;
          page_count?: number;
          manufacturer?: string | null;
          equipment_model?: string | null;
          equipment_category?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      extracted_entities: {
        Row: {
          id: string;
          tenant_id: string;
          document_id: string;
          project_id: string | null;
          entity_type: string;
          property_name: string;
          property_value: string;
          unit: string | null;
          confidence: string;
          page_number: number;
          section_title: string | null;
          table_index: number | null;
          original_snippet: string | null;
          is_verified: boolean;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          document_id: string;
          project_id?: string | null;
          entity_type: string;
          property_name: string;
          property_value: string;
          unit?: string | null;
          confidence?: string;
          page_number?: number;
          section_title?: string | null;
          table_index?: number | null;
          original_snippet?: string | null;
          is_verified?: boolean;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          document_id?: string;
          project_id?: string | null;
          entity_type?: string;
          property_name?: string;
          property_value?: string;
          unit?: string | null;
          confidence?: string;
          page_number?: number;
          section_title?: string | null;
          table_index?: number | null;
          original_snippet?: string | null;
          is_verified?: boolean;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
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
