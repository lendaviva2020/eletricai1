-- ============================================================================
-- ELETRICAI / VOLTAI INDUSTRIAL OS - INITIAL SEED DATA
-- Plant: Copacol Agroindústria — Planta Cafelândia (PR)
-- ============================================================================

-- 1. Initial Tenant
INSERT INTO public.tenants (id, name, cnpj, location, plan, currency)
VALUES (
  'tenant_copacol_01',
  'Copacol Agroindústria — Planta Cafelândia',
  '76.093.738/0001-88',
  'Cafelândia - PR, Brasil',
  'Enterprise Multi-Plant',
  'BRL'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location;

-- 2. Initial User Profile
INSERT INTO public.profiles (id, tenant_id, name, email, role, role_title, crea_number, status, last_active)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'tenant_copacol_01',
  'Eng. Luis Felipe',
  'luis.felipe@copacol.ind.br',
  'admin',
  'Engenheiro Eletricista Sênior',
  'CREA-PR 88.412/D',
  'ONLINE',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Initial Industrial Projects
INSERT INTO public.projects (
  id, tenant_id, code, name, type, type_label, status, progress_percent, nominal_voltage, normative_standard, target_tab, description
) VALUES
(
  'proj_ccm_01',
  'tenant_copacol_01',
  'EAI-PRJ-2024-001',
  'CCM-01 Planta Moagem & Compressão',
  'CCM_BT',
  'Centro de Controle de Motores (BT)',
  'EM_EXECUCAO',
  85,
  '380V / 220V - 60 Hz',
  'ABNT NBR 5410',
  'unifilar',
  'Painel TTA/PTTA com gavetas para compressores e moinhos de martelo.'
),
(
  'proj_se_02',
  'tenant_copacol_01',
  'EAI-PRJ-2024-002',
  'Subestação SE-02 13.8kV/380V Industrial',
  'SUBESTACAO_MT',
  'Subestação Abrigada MT/BT',
  'EM_COMISSIONAMENTO',
  92,
  '13.8 kV / 380V - 60 Hz',
  'ABNT NBR 14039',
  'unifilar',
  'Transformador a óleo 1500 kVA com proteção de sobrecorrente temporizada 50/51.'
) ON CONFLICT (id) DO NOTHING;

-- 4. Initial Shared Tags
INSERT INTO public.shared_tags (
  id, tenant_id, project_id, name, description, address, data_type, direction, current_value, unit, is_alarm_active
) VALUES
(
  'tag_btn_emerg',
  'tenant_copacol_01',
  'proj_ccm_01',
  'BTN_EMERGENCIA',
  'Botão Cogumelo de Parada de Emergência NR-10/NR-12',
  '%I0.0',
  'BOOL',
  'INPUT',
  'true'::jsonb,
  'State',
  false
),
(
  'tag_ft01_trip',
  'tenant_copacol_01',
  'proj_ccm_01',
  'FT01_TERMIC_COMP',
  'Contato Auxiliar do Relé Térmico Compressor (95-96)',
  '%I0.1',
  'BOOL',
  'INPUT',
  'false'::jsonb,
  'State',
  false
),
(
  'tag_k01_cmd',
  'tenant_copacol_01',
  'proj_ccm_01',
  'K01_CMD_COMPRESSOR',
  'Saída Digital CLP para Bobina Contator K01 (A1-A2)',
  '%Q0.2',
  'BOOL',
  'OUTPUT',
  'true'::jsonb,
  'State',
  false
),
(
  'tag_corrente_q02',
  'tenant_copacol_01',
  'proj_ccm_01',
  'I_RMS_COMPRESSOR',
  'Corrente Eficaz Fase R do Compressor 75CV',
  '%IW64',
  'REAL',
  'INPUT',
  '98.4'::jsonb,
  'A',
  false
),
(
  'tag_temp_cubicle',
  'tenant_copacol_01',
  'proj_ccm_01',
  'TEMP_GAVETA_Q02',
  'Sensor PT100 no Cubículo da Gaveta do Compressor',
  '%IW66',
  'REAL',
  'INPUT',
  '48.5'::jsonb,
  '°C',
  false
) ON CONFLICT (id) DO NOTHING;

-- 5. Initial Components
INSERT INTO public.components (
  id, tenant_id, project_id, tag, name, type, voltage, rated_current, current, power_kw, cable_section_mm2, status, is_energized, position_x, position_y
) VALUES
(
  'comp_q01',
  'tenant_copacol_01',
  'proj_ccm_01',
  'Q01_GERAL',
  'Disjuntor Caixa Moldada Geral CCM-01 (400A)',
  'disjuntor_mccb',
  '380V',
  400.0,
  312.0,
  185.0,
  185.0,
  'CLOSED',
  true,
  120.0,
  80.0
),
(
  'comp_q02',
  'tenant_copacol_01',
  'proj_ccm_01',
  'Q02_COMPRESSOR',
  'Alimentador Compressor Parafuso 75CV',
  'disjuntor_motor',
  '380V',
  125.0,
  98.4,
  55.0,
  25.0,
  'CLOSED',
  true,
  340.0,
  180.0
) ON CONFLICT (id) DO NOTHING;

-- 6. Initial Alerts
INSERT INTO public.alerts (
  id, tenant_id, project_id, title, description, severity, category, source_tag, component_id, target_tab, suggested_action, is_resolved
) VALUES
(
  'alert_01',
  'tenant_copacol_01',
  'proj_ccm_01',
  'Queda de Tensão Crítica no Alimentador Q02',
  'Queda calculada de 4.8% no circuito do compressor de 75CV excede o limite normativo de 4.0% da NBR 5410.',
  'CRITICO',
  'NBR_5410',
  'Q02_COMPRESSOR',
  'comp_q02',
  'unifilar',
  'Aumentar seção do condutor de 16mm² para 25mm² ou readequar trajeto.',
  false
),
(
  'alert_02',
  'tenant_copacol_01',
  'proj_ccm_01',
  'Dispositivo Remoto I/O Subestação Offline',
  'Timeout na resposta Modbus TCP no endereço 192.168.10.45 após 3 tentativas de varredura.',
  'CRITICO',
  'MODBUS_REDE',
  'RIO_SUBESTACAO',
  NULL,
  'scada',
  'Verificar alimentação 24Vdc da fonte e integridade do cabo de par trançado.',
  false
) ON CONFLICT (id) DO NOTHING;
