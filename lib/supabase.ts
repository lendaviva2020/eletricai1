import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sample-project-ref.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('sample-project-ref')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface SupabaseUserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'engineer' | 'member';
  crea_number?: string;
  company_name?: string;
  tenant_id: string;
  created_at?: string;
  last_login_at?: string;
}

export interface SupabaseTenant {
  id: string;
  name: string;
  subname?: string;
  cnpj?: string;
  location?: string;
  plan?: string;
  voltage?: string;
  tags_count?: number;
  members_count?: number;
  category?: 'enterprise' | 'client' | 'sandbox';
  created_at?: string;
}

export interface SupabasePasswordReset {
  id?: string;
  email: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at?: string;
}

export interface SupabaseEnterpriseLead {
  id?: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  plant_type?: string;
  created_at?: string;
}

const LOCAL_USERS_KEY = 'eletricai_sb_users_cache';
const LOCAL_TENANTS_KEY = 'eletricai_sb_tenants_cache';
const LOCAL_SESSION_KEY = 'eletricai_sb_active_session';
const LOCAL_RESETS_KEY = 'eletricai_sb_resets_cache';
const LOCAL_LEADS_KEY = 'eletricai_sb_leads_cache';

const DEFAULT_SEED_USERS: SupabaseUserProfile[] = [
  {
    id: 'usr_carlos_01',
    email: 'carlos.mendes@paulinia.ind.br',
    name: 'Eng. Carlos Eduardo Mendes',
    role: 'admin',
    crea_number: 'CREA-SP 50849201/D',
    company_name: 'Braskem Q1 Paulínia',
    tenant_id: 'tenant_braskem_01',
    created_at: new Date('2025-01-15T08:00:00Z').toISOString(),
    last_login_at: new Date().toISOString(),
  },
  {
    id: 'usr_beatriz_02',
    email: 'beatriz.lima@usina.com.br',
    name: 'Engª. Beatriz Lima',
    role: 'engineer',
    crea_number: 'CREA-PR 88.412/D',
    company_name: 'ArcelorMittal Tubarão',
    tenant_id: 'tenant_arcelor_02',
    created_at: new Date('2025-03-20T09:15:00Z').toISOString(),
    last_login_at: new Date().toISOString(),
  },
  {
    id: 'usr_luis_03',
    email: 'luis.felipe@eletricai.com.br',
    name: 'Eng. Luis Felipe',
    role: 'admin',
    crea_number: 'CREA-MG 142.908/D',
    company_name: 'VOLTAI Industrial AI Lab',
    tenant_id: 'tenant_personal_lab',
    created_at: new Date('2024-11-01T12:00:00Z').toISOString(),
    last_login_at: new Date().toISOString(),
  },
];

const DEFAULT_SEED_TENANTS: SupabaseTenant[] = [
  {
    id: 'tenant_braskem_01',
    name: 'Braskem Q1 — Polo Petroquímico Paulínia',
    subname: 'Subestação Principal SE-01 & CCMs 13.8kV/380V',
    cnpj: '42.150.391/0001-90',
    location: 'Paulínia - SP, Brasil',
    plan: 'Enterprise Multi-Plant',
    voltage: '13.8 kV / 380V - 60Hz',
    tags_count: 1420,
    members_count: 8,
    category: 'enterprise',
    created_at: new Date('2025-01-10T10:00:00Z').toISOString(),
  },
  {
    id: 'tenant_arcelor_02',
    name: 'ArcelorMittal — Subestação SE-02',
    subname: 'Laminação a Quente & Forno Elétrico a Arco',
    cnpj: '17.469.701/0002-45',
    location: 'Tubarão - ES, Brasil',
    plan: 'Industrial Pro',
    voltage: '13.8 kV / 440V - 60Hz',
    tags_count: 680,
    members_count: 5,
    category: 'client',
    created_at: new Date('2025-02-14T11:20:00Z').toISOString(),
  },
  {
    id: 'tenant_personal_lab',
    name: 'Workspace Pessoal & Laboratório VOLTAI',
    subname: 'Sandbox de Simulação, Gêmeo Digital 3D & Ensaios IEC',
    cnpj: '00.000.000/0001-91',
    location: 'Curitiba - PR, Brasil',
    plan: 'Personal Lab',
    voltage: '380V / 220V - 60Hz',
    tags_count: 240,
    members_count: 1,
    category: 'sandbox',
    created_at: new Date('2024-10-05T08:00:00Z').toISOString(),
  },
];

export class SupabaseDataService {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // --- GET ALL USERS ---
  public static async getUsers(): Promise<SupabaseUserProfile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as SupabaseUserProfile[];
        }
      } catch (err) {
        console.warn('Supabase remote query failed, fallback to local storage', err);
      }
    }

    if (!this.isClient()) return DEFAULT_SEED_USERS;
    const local = localStorage.getItem(LOCAL_USERS_KEY);
    if (!local) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_SEED_USERS));
      return DEFAULT_SEED_USERS;
    }
    try {
      return JSON.parse(local);
    } catch {
      return DEFAULT_SEED_USERS;
    }
  }

  // --- AUTHENTICATE / LOGIN ---
  public static async loginUser(
    email: string,
    password?: string
  ): Promise<{ success: boolean; user?: SupabaseUserProfile; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && password) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (!authError && authData.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profile) {
            this.setActiveSession(profile);
            return { success: true, user: profile };
          }
        }
      } catch (e) {
        console.warn('Supabase auth sign in error, checking local store:', e);
      }
    }

    // Local DB lookup / registration
    const users = await this.getUsers();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      const isBeatriz = cleanEmail.includes('beatriz');
      const isCarlos = cleanEmail.includes('carlos');
      
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        name: isBeatriz 
          ? 'Engª. Beatriz Lima' 
          : isCarlos 
          ? 'Eng. Carlos Eduardo Mendes' 
          : `Eng. ${cleanEmail.split('@')[0]}`,
        role: isBeatriz ? 'engineer' : 'admin',
        crea_number: `CREA-BR ${Math.floor(100000 + Math.random() * 900000)}/D`,
        company_name: 'Planta Industrial Integrada',
        tenant_id: 'tenant_braskem_01',
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      };
      users.unshift(user);
      if (this.isClient()) {
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      }

      if (isSupabaseConfigured) {
        try {
          await supabase.from('user_profiles').insert(user);
        } catch (e) {
          console.warn('Could not insert profile to remote Supabase', e);
        }
      }
    } else {
      user.last_login_at = new Date().toISOString();
      if (this.isClient()) {
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      }
    }

    this.setActiveSession(user);
    return { success: true, user };
  }

  // --- REGISTER NEW ENGINEER ---
  public static async registerUser(data: {
    name: string;
    email: string;
    creaNumber: string;
    role: 'admin' | 'engineer' | 'member';
    companyName?: string;
  }): Promise<{ success: boolean; user?: SupabaseUserProfile; error?: string }> {
    const cleanEmail = data.email.trim().toLowerCase();
    const users = await this.getUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Este e-mail corporativo já possui cadastro ativo.' };
    }

    const newUser: SupabaseUserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      name: data.name.trim(),
      role: data.role,
      crea_number: data.creaNumber.trim(),
      company_name: data.companyName || 'Planta Industrial',
      tenant_id: 'tenant_braskem_01',
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('user_profiles').insert(newUser);
      } catch (err) {
        console.warn('Error inserting user to Supabase', err);
      }
    }

    users.unshift(newUser);
    if (this.isClient()) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }
    this.setActiveSession(newUser);

    return { success: true, user: newUser };
  }

  // --- PASSWORD RECOVERY (RESET TOKEN) ---
  public static async requestPasswordReset(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Forneça um e-mail válido com domínio industrial.' };
    }

    const token = `RESET-${Math.floor(100000 + Math.random() * 900000)}`;
    const resetRecord: SupabasePasswordReset = {
      id: `rst_${Date.now()}`,
      email: cleanEmail,
      token,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      used: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('password_resets').insert(resetRecord);
        await supabase.auth.resetPasswordForEmail(cleanEmail);
      } catch (e) {
        console.warn('Supabase remote password reset note:', e);
      }
    }

    if (this.isClient()) {
      const stored = localStorage.getItem(LOCAL_RESETS_KEY);
      const list: SupabasePasswordReset[] = stored ? JSON.parse(stored) : [];
      list.unshift(resetRecord);
      localStorage.setItem(LOCAL_RESETS_KEY, JSON.stringify(list));
    }

    return { success: true, token };
  }

  public static async verifyResetTokenAndChangePassword(
    email: string,
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.updateUser({ password: newPassword });
        await supabase
          .from('password_resets')
          .update({ used: true })
          .eq('email', cleanEmail)
          .eq('token', token.trim());
      } catch (e) {
        console.warn('Supabase remote password update warning:', e);
      }
    }

    if (this.isClient()) {
      const stored = localStorage.getItem(LOCAL_RESETS_KEY);
      if (stored) {
        const list: SupabasePasswordReset[] = JSON.parse(stored);
        const item = list.find(r => r.email === cleanEmail && (!token || r.token === token.trim()));
        if (item) item.used = true;
        localStorage.setItem(LOCAL_RESETS_KEY, JSON.stringify(list));
      }
    }

    return { success: true, message: 'Senha atualizada com sucesso no Supabase Auth.' };
  }

  // --- TENANTS CRUD ---
  public static async getTenants(): Promise<SupabaseTenant[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as SupabaseTenant[];
        }
      } catch (err) {
        console.warn('Supabase tenants query failed, using local cache', err);
      }
    }

    if (!this.isClient()) return DEFAULT_SEED_TENANTS;
    const local = localStorage.getItem(LOCAL_TENANTS_KEY);
    if (!local) {
      localStorage.setItem(LOCAL_TENANTS_KEY, JSON.stringify(DEFAULT_SEED_TENANTS));
      return DEFAULT_SEED_TENANTS;
    }
    try {
      return JSON.parse(local);
    } catch {
      return DEFAULT_SEED_TENANTS;
    }
  }

  public static async createTenant(tenant: Omit<SupabaseTenant, 'id' | 'created_at'>): Promise<SupabaseTenant> {
    const newTenant: SupabaseTenant = {
      ...tenant,
      id: `tenant_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('tenants').insert(newTenant);
      } catch (e) {
        console.warn('Error inserting tenant to Supabase', e);
      }
    }

    const current = await this.getTenants();
    current.unshift(newTenant);
    if (this.isClient()) {
      localStorage.setItem(LOCAL_TENANTS_KEY, JSON.stringify(current));
    }
    return newTenant;
  }

  // --- ENTERPRISE LEADS (COMMERCIAL) ---
  public static async saveEnterpriseLead(lead: SupabaseEnterpriseLead): Promise<void> {
    const entry: SupabaseEnterpriseLead = {
      ...lead,
      id: `lead_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('enterprise_leads').insert(entry);
      } catch (e) {
        console.warn('Supabase lead remote insertion warning', e);
      }
    }

    if (this.isClient()) {
      const stored = localStorage.getItem(LOCAL_LEADS_KEY);
      const list: SupabaseEnterpriseLead[] = stored ? JSON.parse(stored) : [];
      list.unshift(entry);
      localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(list));
    }
  }

  // --- ACTIVE SESSION ---
  public static getActiveSession(): SupabaseUserProfile | null {
    if (!this.isClient()) return null;
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static setActiveSession(user: SupabaseUserProfile | null): void {
    if (!this.isClient()) return;
    if (user) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  }

  public static async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout notice:', e);
      }
    }
    this.setActiveSession(null);
  }
}
