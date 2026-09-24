'use client';

import {
  supabase,
  isSupabaseConfigured,
  SupabaseDataService,
  SupabaseUserProfile,
  SupabaseTenant,
  SupabasePasswordReset,
  SupabaseEnterpriseLead,
} from '@/lib/supabase';

export interface PersistentUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'engineer' | 'member';
  creaNumber?: string;
  tenantId: string;
  createdAt: string;
  lastLoginAt: string;
  passwordHash?: string;
}

export interface PersistentTenant {
  id: string;
  name: string;
  subname: string;
  cnpj: string;
  location: string;
  plan: string;
  voltage: string;
  tagsCount: number;
  membersCount: number;
  category: 'enterprise' | 'client' | 'sandbox';
  createdAt: string;
}

export interface PasswordResetRecord {
  id: string;
  email: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

const USERS_STORAGE_KEY = 'eletricai_db_users_v2';
const TENANTS_STORAGE_KEY = 'eletricai_db_tenants_v2';
const SESSIONS_STORAGE_KEY = 'eletricai_db_current_session_v2';
const RESETS_STORAGE_KEY = 'eletricai_db_resets_v2';
const LEADS_STORAGE_KEY = 'eletricai_db_enterprise_leads_v2';

export const INITIAL_DATABASE_USERS: PersistentUser[] = [
  {
    id: 'usr_carlos_01',
    email: 'carlos.mendes@paulinia.ind.br',
    name: 'Eng. Carlos Eduardo Mendes',
    role: 'admin',
    creaNumber: 'CREA-SP 50849201/D',
    tenantId: 'tenant_braskem_01',
    createdAt: '2025-01-15T08:00:00Z',
    lastLoginAt: '2026-09-23T10:30:00Z',
  },
  {
    id: 'usr_beatriz_02',
    email: 'beatriz.lima@usina.com.br',
    name: 'Engª. Beatriz Lima',
    role: 'engineer',
    creaNumber: 'CREA-PR 88.412/D',
    tenantId: 'tenant_arcelor_02',
    createdAt: '2025-03-20T09:15:00Z',
    lastLoginAt: '2026-09-23T09:45:00Z',
  },
  {
    id: 'usr_luis_03',
    email: 'luis.felipe@eletricai.com.br',
    name: 'Eng. Luis Felipe',
    role: 'admin',
    creaNumber: 'CREA-MG 142.908/D',
    tenantId: 'tenant_personal_lab',
    createdAt: '2024-11-01T12:00:00Z',
    lastLoginAt: '2026-09-23T14:10:00Z',
  },
];

export const INITIAL_DATABASE_TENANTS: PersistentTenant[] = [
  {
    id: 'tenant_braskem_01',
    name: 'Braskem Q1 — Polo Petroquímico Paulínia',
    subname: 'Subestação Principal SE-01 & CCMs 13.8kV/380V',
    cnpj: '42.150.391/0001-90',
    location: 'Paulínia - SP, Brasil',
    plan: 'Enterprise Multi-Plant',
    voltage: '13.8 kV / 380V - 60Hz',
    tagsCount: 1420,
    membersCount: 8,
    category: 'enterprise',
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'tenant_arcelor_02',
    name: 'ArcelorMittal — Subestação SE-02',
    subname: 'Laminação a Quente & Forno Elétrico a Arco',
    cnpj: '17.469.701/0002-45',
    location: 'Tubarão - ES, Brasil',
    plan: 'Industrial Pro',
    voltage: '13.8 kV / 440V - 60Hz',
    tagsCount: 680,
    membersCount: 5,
    category: 'client',
    createdAt: '2025-02-14T11:20:00Z',
  },
  {
    id: 'tenant_personal_lab',
    name: 'Workspace Pessoal & Laboratório VOLTAI',
    subname: 'Sandbox de Simulação, Gêmeo Digital 3D & Ensaios IEC',
    cnpj: '00.000.000/0001-91',
    location: 'Curitiba - PR, Brasil',
    plan: 'Personal Lab',
    voltage: '380V / 220V - 60Hz',
    tagsCount: 240,
    membersCount: 1,
    category: 'sandbox',
    createdAt: '2024-10-05T08:00:00Z',
  },
];

export class DatabaseAuthService {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // Map SupabaseUserProfile to PersistentUser
  private static toPersistentUser(sbUser: SupabaseUserProfile): PersistentUser {
    return {
      id: sbUser.id,
      email: sbUser.email,
      name: sbUser.name,
      role: sbUser.role,
      creaNumber: sbUser.crea_number,
      tenantId: sbUser.tenant_id,
      createdAt: sbUser.created_at || new Date().toISOString(),
      lastLoginAt: sbUser.last_login_at || new Date().toISOString(),
    };
  }

  // Map SupabaseTenant to PersistentTenant
  private static toPersistentTenant(sbTenant: SupabaseTenant): PersistentTenant {
    return {
      id: sbTenant.id,
      name: sbTenant.name,
      subname: sbTenant.subname || '',
      cnpj: sbTenant.cnpj || '',
      location: sbTenant.location || '',
      plan: sbTenant.plan || 'Industrial Pro',
      voltage: sbTenant.voltage || '13.8 kV / 380V - 60Hz',
      tagsCount: sbTenant.tags_count ?? 500,
      membersCount: sbTenant.members_count ?? 1,
      category: sbTenant.category || 'client',
      createdAt: sbTenant.created_at || new Date().toISOString(),
    };
  }

  // USERS
  public static getUsers(): PersistentUser[] {
    if (!this.isClient()) return INITIAL_DATABASE_USERS;
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_DATABASE_USERS));
      return INITIAL_DATABASE_USERS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_DATABASE_USERS;
    }
  }

  public static async getUsersAsync(): Promise<PersistentUser[]> {
    const sbUsers = await SupabaseDataService.getUsers();
    return sbUsers.map(u => this.toPersistentUser(u));
  }

  public static saveUsers(users: PersistentUser[]) {
    if (!this.isClient()) return;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  // TENANTS
  public static getTenants(): PersistentTenant[] {
    if (!this.isClient()) return INITIAL_DATABASE_TENANTS;
    const stored = localStorage.getItem(TENANTS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(INITIAL_DATABASE_TENANTS));
      return INITIAL_DATABASE_TENANTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_DATABASE_TENANTS;
    }
  }

  public static async getTenantsAsync(): Promise<PersistentTenant[]> {
    const sbTenants = await SupabaseDataService.getTenants();
    return sbTenants.map(t => this.toPersistentTenant(t));
  }

  public static saveTenants(tenants: PersistentTenant[]) {
    if (!this.isClient()) return;
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
  }

  public static addTenant(newTenant: Omit<PersistentTenant, 'id' | 'createdAt'>): PersistentTenant {
    const tenants = this.getTenants();
    const created: PersistentTenant = {
      ...newTenant,
      id: `tenant_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    tenants.unshift(created);
    this.saveTenants(tenants);

    // Sync to Supabase in background
    if (isSupabaseConfigured) {
      SupabaseDataService.createTenant({
        name: newTenant.name,
        subname: newTenant.subname,
        cnpj: newTenant.cnpj,
        location: newTenant.location,
        plan: newTenant.plan,
        voltage: newTenant.voltage,
        tags_count: newTenant.tagsCount,
        members_count: newTenant.membersCount,
        category: newTenant.category,
      }).catch(err => console.warn('Supabase tenant sync notice:', err));
    }

    return created;
  }

  // AUTHENTICATION OPERATIONS
  public static loginWithCredentials(
    emailOrTag: string,
    password?: string
  ): { success: boolean; user?: PersistentUser; error?: string } {
    const users = this.getUsers();
    const normalizedInput = emailOrTag.trim().toLowerCase();

    // Find by exact email or prefix name
    let user = users.find(u => u.email.toLowerCase() === normalizedInput);
    if (!user) {
      user = users.find(u => u.email.toLowerCase().includes(normalizedInput));
    }

    if (!user) {
      // If new email provided, register new engineer dynamically
      const isBeatriz = normalizedInput.includes('beatriz');
      const newUser: PersistentUser = {
        id: `usr_${Date.now()}`,
        email: emailOrTag.includes('@') ? emailOrTag.trim() : `${normalizedInput}@empresa.ind.br`,
        name: isBeatriz ? 'Engª. Beatriz Lima' : `Eng. ${emailOrTag.split('@')[0]}`,
        role: 'engineer',
        creaNumber: `CREA-BR ${Math.floor(100000 + Math.random() * 900000)}/D`,
        tenantId: 'tenant_braskem_01',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      users.push(newUser);
      this.saveUsers(users);
      user = newUser;

      // Sync user profile to Supabase
      if (isSupabaseConfigured) {
        Promise.resolve(
          supabase
            .from('user_profiles')
            .insert({
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              role: newUser.role,
              crea_number: newUser.creaNumber,
              tenant_id: newUser.tenantId,
            })
        ).catch(e => console.warn('Supabase user insert note:', e));
      }
    } else {
      user.lastLoginAt = new Date().toISOString();
      this.saveUsers(users);
    }

    this.setCurrentSession(user);

    // Call Supabase login service in parallel
    if (isSupabaseConfigured) {
      SupabaseDataService.loginUser(emailOrTag, password).catch(e =>
        console.warn('Supabase remote session sync note:', e)
      );
    }

    return { success: true, user };
  }

  public static async loginWithCredentialsAsync(
    emailOrTag: string,
    password?: string
  ): Promise<{ success: boolean; user?: PersistentUser; error?: string }> {
    const res = await SupabaseDataService.loginUser(emailOrTag, password);
    if (res.user) {
      const pUser = this.toPersistentUser(res.user);
      this.setCurrentSession(pUser);
      return { success: true, user: pUser };
    }
    return this.loginWithCredentials(emailOrTag, password);
  }

  public static registerNewUser(data: {
    name: string;
    email: string;
    creaNumber: string;
    role: 'admin' | 'engineer' | 'member';
    tenantName?: string;
  }): { success: boolean; user?: PersistentUser; error?: string } {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      return { success: false, error: 'Este e-mail já está cadastrado no sistema industrial.' };
    }

    const newUser: PersistentUser = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      creaNumber: data.creaNumber.trim(),
      role: data.role,
      tenantId: 'tenant_braskem_01',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentSession(newUser);

    if (isSupabaseConfigured) {
      SupabaseDataService.registerUser({
        name: data.name,
        email: data.email,
        creaNumber: data.creaNumber,
        role: data.role,
        companyName: data.tenantName,
      }).catch(err => console.warn('Supabase user registration notice:', err));
    }

    return { success: true, user: newUser };
  }

  public static getCurrentSession(): PersistentUser | null {
    if (!this.isClient()) return null;
    const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  public static setCurrentSession(user: PersistentUser | null) {
    if (!this.isClient()) return;
    if (user) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(user));
      SupabaseDataService.setActiveSession({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        crea_number: user.creaNumber,
        tenant_id: user.tenantId,
        created_at: user.createdAt,
        last_login_at: user.lastLoginAt,
      });
    } else {
      localStorage.removeItem(SESSIONS_STORAGE_KEY);
      SupabaseDataService.setActiveSession(null);
    }
  }

  // PASSWORD RECOVERY WITH REAL AUDIT TOKEN
  public static requestPasswordReset(email: string): { success: boolean; token?: string; error?: string } {
    if (!email.trim() || !email.includes('@')) {
      return { success: false, error: 'Informe um e-mail corporativo válido.' };
    }

    const token = `RESET-${Math.floor(100000 + Math.random() * 900000)}`;
    const record: PasswordResetRecord = {
      id: `reset_${Date.now()}`,
      email: email.trim().toLowerCase(),
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      used: false,
    };

    if (this.isClient()) {
      const stored = localStorage.getItem(RESETS_STORAGE_KEY);
      const list: PasswordResetRecord[] = stored ? JSON.parse(stored) : [];
      list.push(record);
      localStorage.setItem(RESETS_STORAGE_KEY, JSON.stringify(list));
    }

    if (isSupabaseConfigured) {
      SupabaseDataService.requestPasswordReset(email).catch(e =>
        console.warn('Supabase password reset token dispatch notice:', e)
      );
    }

    return { success: true, token };
  }

  // ENTERPRISE LEADS REGISTRATION
  public static registerEnterpriseLead(lead: {
    name: string;
    email: string;
    company: string;
    phone?: string;
    plantType?: string;
  }) {
    if (!this.isClient()) return;
    const stored = localStorage.getItem(LEADS_STORAGE_KEY);
    const list = stored ? JSON.parse(stored) : [];
    list.push({
      ...lead,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(list));

    if (isSupabaseConfigured) {
      SupabaseDataService.saveEnterpriseLead({
        name: lead.name,
        email: lead.email,
        company: lead.company,
        phone: lead.phone,
        plant_type: lead.plantType,
      }).catch(err => console.warn('Supabase lead record sync warning:', err));
    }
  }
}
