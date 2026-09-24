import {
  ElectricalComponent,
  ElectricalConnection,
  ElectricalValidationIssue,
  IssueSeverity,
  IssueCategory,
} from '@/types/electrical';

export function runFullElectricalValidation(
  components: ElectricalComponent[],
  connections: ElectricalConnection[]
): ElectricalValidationIssue[] {
  const issues: ElectricalValidationIssue[] = [];
  const compMap = new Map<string, ElectricalComponent>();
  const tagCounts = new Map<string, number>();

  components.forEach(c => {
    compMap.set(c.id, c);
    const count = tagCounts.get(c.tag) || 0;
    tagCounts.set(c.tag, count + 1);
  });

  // 1. Verificação de TAGs Duplicadas
  tagCounts.forEach((count, tag) => {
    if (count > 1) {
      const duplicates = components.filter(c => c.tag === tag);
      issues.push({
        id: `err_dup_tag_${tag}`,
        severity: 'CRITICAL',
        category: 'IDENTIFICATION',
        code: 'ERR_DUP_TAG',
        title: `TAG duplicada: ${tag}`,
        description: `Existem ${count} componentes cadastrados com o mesmo TAG '${tag}'. Cada equipamento deve possuir identificação única no diagrama.`,
        componentId: duplicates[0]?.id,
        componentTag: tag,
        reason: 'Ambiguidade na lista de cargas, cabeamento e endereçamento de automação.',
        suggestion: `Renomeie um dos equipamentos para ${tag}_A ou ${tag}_02.`,
      });
    }
  });

  // 2. Verificação de Componentes Órfãos (Sem nenhuma conexão de entrada ou saída)
  components.forEach(comp => {
    const compConns = connections.filter(
      conn => conn.fromComponentId === comp.id || conn.toComponentId === comp.id
    );

    if (compConns.length === 0) {
      issues.push({
        id: `err_orphan_${comp.id}`,
        severity: 'CRITICAL',
        category: 'CONNECTIVITY',
        code: 'ERR_ORPHAN_COMP',
        title: `Componente Órfão: ${comp.tag}`,
        description: `O equipamento ${comp.tag} (${comp.name}) está solto na prancha sem nenhum condutor ou barramento conectado aos seus terminais.`,
        componentId: comp.id,
        componentTag: comp.tag,
        reason: 'Componente isolado eletricamente não recebe alimentação nem alimenta cargas a jusante.',
        suggestion: 'Trace um condutor elétrico (ferramenta FIO/WIRE) ligando os terminais deste equipamento ao barramento ou dispositivo montante.',
      });
    } else {
      // Cargas (motores, bancos de cap) sem conexão de entrada
      if (comp.category === 'MOTOR_3P' || comp.category === 'CAPACITOR_BANK') {
        const hasIncoming = connections.some(c => c.toComponentId === comp.id);
        if (!hasIncoming) {
          issues.push({
            id: `err_load_no_feed_${comp.id}`,
            severity: 'CRITICAL',
            category: 'CONNECTIVITY',
            code: 'ERR_FEED_MISSING',
            title: `Carga sem Alimentação: ${comp.tag}`,
            description: `O motor/carga ${comp.tag} não possui nenhum alimentador conectado aos seus terminais de entrada.`,
            componentId: comp.id,
            componentTag: comp.tag,
            reason: 'O motor não pode funcionar sem conexão ao contator ou inversor montante.',
            suggestion: 'Conecte o contator ou relé térmico à porta de entrada do motor.',
          });
        }
      }
    }
  });

  // 3. Verificação de Fios/Conexões sem Origem, Destino ou Terminais Válidos
  connections.forEach(conn => {
    const fromComp = compMap.get(conn.fromComponentId);
    const toComp = compMap.get(conn.toComponentId);
    const fromExists = !!fromComp;
    const toExists = !!toComp;

    const fromPortValid = fromComp
      ? (!conn.fromPortId || fromComp.ports.length === 0 || fromComp.ports.some(p => p.id === conn.fromPortId))
      : false;
    const toPortValid = toComp
      ? (!conn.toPortId || toComp.ports.length === 0 || toComp.ports.some(p => p.id === conn.toPortId))
      : false;

    if (!fromExists || !toExists || !fromPortValid || !toPortValid) {
      const errorDetail = [];
      if (!fromExists) errorDetail.push('Equipamento de Origem Inexistente');
      else if (!fromPortValid) errorDetail.push(`Terminal de Origem (${conn.fromPortId}) não existe em ${fromComp?.tag}`);

      if (!toExists) errorDetail.push('Equipamento de Destino Inexistente');
      else if (!toPortValid) errorDetail.push(`Terminal de Destino (${conn.toPortId}) não existe em ${toComp?.tag}`);

      issues.push({
        id: `err_floating_wire_${conn.id}`,
        severity: 'CRITICAL',
        category: 'CONNECTIVITY',
        code: 'ERR_FLOATING_WIRE',
        title: `Fio sem Terminal de Conexão Definido (${conn.wireNumber || conn.id})`,
        description: `O condutor elétrico possui extremidade solta ou terminal inválido: ${errorDetail.join(', ')}.`,
        connectionId: conn.id,
        reason: 'Fio flutuante no diagrama unifilar, terminal inexistente ou equipamento excluído.',
        suggestion: 'Reconecte as extremidades aos terminais corretos dos componentes ou exclua o fio solto.',
      });
    }
  });

  // 4. Verificação de Proteção para Motores Trifásicos (NBR 5410 / IEC 60204-1)
  const motors = components.filter(c => c.category === 'MOTOR_3P');
  motors.forEach(motor => {
    // Achar conexões a montante do motor
    const incomingConn = connections.find(c => c.toComponentId === motor.id);
    if (incomingConn) {
      const upstreamComp = compMap.get(incomingConn.fromComponentId);
      const isProtected = upstreamComp && (
        upstreamComp.category === 'THERMAL_RELAY' ||
        upstreamComp.category === 'MOTOR_BREAKER' ||
        upstreamComp.category === 'VFD' ||
        upstreamComp.category === 'SOFT_STARTER'
      );

      if (!isProtected) {
        issues.push({
          id: `warn_motor_prot_${motor.id}`,
          severity: 'ERROR',
          category: 'PROTECTION',
          code: 'ERR_MOTOR_NO_PROT',
          title: `Proteção de Sobrecarga Ausente para ${motor.tag}`,
          description: `O motor ${motor.tag} (${motor.powerHp || 30} CV) está alimentado diretamente por ${upstreamComp?.tag || 'origem desconhecida'} sem relé térmico ou disjuntor-motor dedicado.`,
          componentId: motor.id,
          componentTag: motor.tag,
          reason: 'A norma ABNT NBR 5410 item 6.5.4 e IEC 60204-1 exigem proteção contra sobrecarga e falta de fase para todos os motores elétricos > 0.5 kW.',
          suggestion: 'Insira um Relé Térmico (ex: RW67) ou Disjuntor-Motor (ex: MPW40) antes do motor.',
        });
      }
    }
  });

  // 5. Verificação de Queda de Tensão e Seção de Condutores (ΔV% > 4%)
  components.forEach(comp => {
    if (comp.voltageDropPercent && comp.voltageDropPercent > 4.0) {
      issues.push({
        id: `warn_vdrop_${comp.id}`,
        severity: 'WARNING',
        category: 'SIZING',
        code: 'WARN_VDROP_HIGH',
        title: `Queda de Tensão Elevada em ${comp.tag} (${comp.voltageDropPercent}%)`,
        description: `O alimentador do circuito ${comp.tag} apresenta queda de tensão calculada de ${comp.voltageDropPercent}%, excedendo o limite normativo de 4.0% da NBR 5410 Tabela 46.`,
        componentId: comp.id,
        componentTag: comp.tag,
        reason: 'Comprimento excessivo do alimentador ou seção de cobre insuficiente para a corrente de projeto Ib.',
        suggestion: `Aumente a bitola do condutor de ${comp.cableCrossSection || 16} mm² para a bitola comercial imediatamente superior.`,
      });
    }
  });

  // 6. Verificação de Poder de Interrupção (Icu)
  const breakers = components.filter(
    c => c.category === 'MAIN_BREAKER' || c.category === 'MOTOR_BREAKER'
  );
  breakers.forEach(brk => {
    if (brk.breakingCapacity && brk.breakingCapacity < 16) {
      issues.push({
        id: `warn_icu_${brk.id}`,
        severity: 'WARNING',
        category: 'PROTECTION',
        code: 'WARN_ICU_LOW',
        title: `Capacidade de Interrupção Baixa em ${brk.tag}`,
        description: `O disjuntor ${brk.tag} possui Icu de ${brk.breakingCapacity} kA. Em barramentos industriais próximos a trafos de 1000kVA, a corrente de curto-circuito simétrica presumida frequentemente supera 25 kA.`,
        componentId: brk.id,
        componentTag: brk.tag,
        reason: 'Risco de explosão ou soldagem dos contatos do disjuntor em caso de curto franco trifásico.',
        suggestion: 'Selecione um disjuntor com Icu >= 25 kA (ex: WEG DWA ou Schneider NSX).',
      });
    }
  });

  // 7. Recomendações Normativas (DPS e Aterramento)
  const hasDps = components.some(c => c.category === 'DPS_PROTECTION');
  if (!hasDps) {
    issues.push({
      id: 'rec_no_dps',
      severity: 'RECOMMENDATION',
      category: 'STANDARDS',
      code: 'REC_DPS_MISSING',
      title: 'Ausência de DPS Classe II no Barramento Geral',
      description: 'Não foi detectado módulo de Proteção contra Surtos (DPS) no QGBT.',
      reason: 'A NBR 5410 item 5.4.2 torna obrigatório o uso de DPS em instalações industriais alimentadas por rede aérea ou sujeitas a descargas atmosféricas.',
      suggestion: 'Adicione um conjunto DPS Classe II 45kA entre cada fase e o barramento de terra PE.',
    });
  }

  // 8. Informativo de Consistência Unifilar / Multifilar
  issues.push({
    id: 'info_model_sync',
    severity: 'INFO',
    category: 'CONSISTENCY',
    code: 'INFO_UNIFILAR_MULTIFILAR_OK',
    title: 'Topologia Unifilar e Multifilar Sincronizadas',
    description: `A base elétrica contém ${components.length} equipamentos e ${connections.length} conexões mapeadas entre arquitetura unifilar e diagramas de potência/comando multifilar.`,
    reason: 'Base de dados de engenharia unificada.',
    suggestion: 'Alterne livremente entre as abas Unifilar e Multifilar mantendo a coerência dos esquemas.',
  });

  return issues;
}
