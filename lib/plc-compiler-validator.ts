import {
  PlcProgramConfiguration,
  PlcDiagnosticIssue,
  PlcCrossReferenceItem,
  PlcLadderElement,
} from '@/types/plc';

export class PlcCompilerAndValidator {
  /**
   * Performs full static analysis, semantic check, and IEC 61131-3:2025 rule checks
   */
  public static validateProgram(program: PlcProgramConfiguration): PlcDiagnosticIssue[] {
    const issues: PlcDiagnosticIssue[] = [];
    const definedVars = new Set<string>();
    const varTypeMap = new Map<string, string>();
    const varAddresses = new Map<string, string>();

    // 1. Check Global Variables
    for (const v of program.globalVariables) {
      if (definedVars.has(v.name)) {
        issues.push({
          id: `diag_dup_${v.name}`,
          severity: 'CRITICAL',
          code: 'IEC-E101',
          title: `TAG Duplicada: ${v.name}`,
          description: `A variável global '${v.name}' foi declarada mais de uma vez na tabela de símbolos.`,
          variableName: v.name,
          suggestion: 'Renomeie ou remova uma das declarações da variável.',
        });
      }
      definedVars.add(v.name);
      varTypeMap.set(v.name, v.dataType);

      // Check duplicate physical address
      if (v.address) {
        if (varAddresses.has(v.address)) {
          issues.push({
            id: `diag_dup_addr_${v.address}`,
            severity: 'ERROR',
            code: 'IEC-E102',
            title: `Endereço de Hardware Duplicado: ${v.address}`,
            description: `O endereço IEC '${v.address}' foi mapeado simultaneamente para '${varAddresses.get(v.address)}' e '${v.name}'.`,
            variableName: v.name,
            suggestion: 'Distribua os canais de hardware para bornes ou endereços distintos.',
          });
        } else {
          varAddresses.set(v.address, v.name);
        }
      }
    }

    // 2. Scan POUs and Rungs
    const writtenCoilsInProgram = new Map<string, { pouName: string; rungNumber: number }>();

    for (const pou of program.pous) {
      // Local variables
      for (const lv of pou.localVariables) {
        if (definedVars.has(lv.name)) {
          issues.push({
            id: `diag_shadow_${pou.id}_${lv.name}`,
            severity: 'WARNING',
            code: 'IEC-W103',
            title: `Sombreamento de Variável: ${lv.name}`,
            description: `A variável local '${lv.name}' na POU '${pou.name}' sombreia uma variável global homônima.`,
            pouId: pou.id,
            pouName: pou.name,
            variableName: lv.name,
            suggestion: 'Use um prefixo de escopo local (ex: L_ ou loc_) para evitar ambiguidade.',
          });
        }
        definedVars.add(lv.name);
        varTypeMap.set(lv.name, lv.dataType);
      }

      // Check Rungs
      for (const rung of pou.rungs) {
        if (rung.elements.length === 0) {
          issues.push({
            id: `diag_empty_rung_${rung.id}`,
            severity: 'WARNING',
            code: 'IEC-W201',
            title: `Rung Vazio: Rung ${rung.rungNumber}`,
            description: `O Rung ${rung.rungNumber} na POU '${pou.name}' não contém nenhum elemento lógico ou bobina de terminação.`,
            pouId: pou.id,
            pouName: pou.name,
            rungNumber: rung.rungNumber,
            suggestion: 'Adicione condições e bobina ou exclua o rung vazio.',
          });
          continue;
        }

        const hasOutputCoilOrBlock = rung.elements.some(
          e => e.elementType === 'COIL' || e.elementType === 'TIMER' || e.elementType === 'COUNTER' || e.elementType === 'MATH'
        );

        if (!hasOutputCoilOrBlock && rung.isEnabled) {
          issues.push({
            id: `diag_no_actuator_${rung.id}`,
            severity: 'ERROR',
            code: 'IEC-E202',
            title: `Rung Sem Atuador: Rung ${rung.rungNumber}`,
            description: `O Rung ${rung.rungNumber} possui contatos de entrada, mas não termina em uma Bobina (Coil), Temporizador ou Bloco de Ação.`,
            pouId: pou.id,
            pouName: pou.name,
            rungNumber: rung.rungNumber,
            suggestion: 'Conecte uma bobina —( )— ou bloco funcional na extremidade direita do rung.',
          });
        }

        // Element Level validation
        for (const el of rung.elements) {
          // Check if variable exists
          if (el.variableName && !definedVars.has(el.variableName)) {
            issues.push({
              id: `diag_unbound_${el.id}`,
              severity: 'ERROR',
              code: 'IEC-E301',
              title: `Variável Não Declarada: '${el.variableName}'`,
              description: `O elemento do tipo ${el.elementType} no Rung ${rung.rungNumber} faz referência a uma tag '${el.variableName}' que não existe na tabela de símbolos.`,
              pouId: pou.id,
              pouName: pou.name,
              rungNumber: rung.rungNumber,
              elementId: el.id,
              variableName: el.variableName,
              suggestion: 'Adicione a variável na tabela de Tags ou corrija o nome da associação.',
            });
          }

          // Check Multiple Coil Writes to Same Address (Double Coil Hazard)
          if (el.elementType === 'COIL' && el.coilType === 'COIL_NORMAL') {
            if (writtenCoilsInProgram.has(el.variableName)) {
              const previous = writtenCoilsInProgram.get(el.variableName)!;
              issues.push({
                id: `diag_double_coil_${el.id}`,
                severity: 'CRITICAL',
                code: 'IEC-E302',
                title: `Bobina Duplicada (Double Coil): '${el.variableName}'`,
                description: `A bobina normal '${el.variableName}' foi escrita no Rung ${rung.rungNumber} e também no Rung ${previous.rungNumber} (${previous.pouName}). Isso provoca sobrescrita destrutiva de memória no ciclo de scan.`,
                pouId: pou.id,
                pouName: pou.name,
                rungNumber: rung.rungNumber,
                elementId: el.id,
                variableName: el.variableName,
                suggestion: 'Unifique a lógica em um único Rung com ramos paralelos OR ou utilize instruções SET/RESET —(S)— / —(R)—.',
              });
            } else {
              writtenCoilsInProgram.set(el.variableName, { pouName: pou.name, rungNumber: rung.rungNumber });
            }
          }

          // Type checking
          if (el.elementType === 'CONTACT' || el.elementType === 'COIL') {
            const vType = varTypeMap.get(el.variableName);
            if (vType && vType !== 'BOOL') {
              issues.push({
                id: `diag_type_mismatch_${el.id}`,
                severity: 'ERROR',
                code: 'IEC-E303',
                title: `Incompatibilidade de Tipo: '${el.variableName}'`,
                description: `Contatos e Bobinas requerem tipo de dados BOOL, mas '${el.variableName}' foi declarada como '${vType}'.`,
                pouId: pou.id,
                pouName: pou.name,
                rungNumber: rung.rungNumber,
                elementId: el.id,
                variableName: el.variableName,
                suggestion: 'Altere o tipo da variável para BOOL ou utilize um comparador de bits.',
              });
            }
          }

          // Potential Division by zero
          if (el.elementType === 'MATH' && el.mathOp === 'DIV') {
            if (Number(el.in2Value) === 0) {
              issues.push({
                id: `diag_div_zero_${el.id}`,
                severity: 'CRITICAL',
                code: 'IEC-E304',
                title: `Divisão por Zero no Bloco MATH`,
                description: `O operando divisor IN2 do bloco DIV no Rung ${rung.rungNumber} está configurado como constante 0.`,
                pouId: pou.id,
                pouName: pou.name,
                rungNumber: rung.rungNumber,
                elementId: el.id,
                suggestion: 'Atribua um valor divisor diferente de zero ou proteja o rung com intertravamento.',
              });
            }
          }
        }
      }
    }

    return issues;
  }

  /**
   * Generates complete Cross-Reference Table for every variable in the project
   */
  public static buildCrossReferences(program: PlcProgramConfiguration): PlcCrossReferenceItem[] {
    const list: PlcCrossReferenceItem[] = [];

    for (const pou of program.pous) {
      for (const rung of pou.rungs) {
        for (const el of rung.elements) {
          if (!el.variableName) continue;

          let mode: 'READ' | 'WRITE' | 'READ_WRITE' = 'READ';
          if (el.elementType === 'COIL') {
            mode = 'WRITE';
          } else if (el.elementType === 'MATH' && el.destVariable === el.variableName) {
            mode = 'WRITE';
          } else if (el.elementType === 'COUNTER') {
            mode = 'READ_WRITE';
          }

          list.push({
            variableName: el.variableName,
            address: el.address,
            pouName: pou.name,
            rungNumber: rung.rungNumber,
            elementType: el.elementType,
            elementId: el.id,
            accessMode: mode,
          });
        }
      }
    }

    return list;
  }

  /**
   * Exports project compliant to PLCopen XML standard format (IEC 61131-10)
   */
  public static exportToPlcopenXml(program: PlcProgramConfiguration): string {
    const nowIso = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="utf-8"?>
<project xmlns="http://www.plcopen.org/xml/tc6_0201">
  <fileHeader companyName="EletricAI Industrial" productName="EletricAI PLC Suite" productVersion="2.4" creationDateTime="${nowIso}"/>
  <contentHeader name="${program.projectName}" version="${program.version}">
    <coordinateInfo>
      <fbd><scaling x="10" y="10"/></fbd>
      <ld><scaling x="10" y="10"/></ld>
      <sfc><scaling x="10" y="10"/></sfc>
    </coordinateInfo>
    <addData>
      <data name="standard" value="IEC 61131-3:2025"/>
    </addData>
  </contentHeader>
  <types>
    <dataTypes/>
    <pous>
`;

    for (const pou of program.pous) {
      xml += `      <pou name="${pou.name}" pouType="${pou.type}">
        <interface>
          <localVars>
`;
      for (const lv of pou.localVariables) {
        xml += `            <variable name="${lv.name}">
              <type><${lv.dataType}/></type>
              ${lv.initialValue !== undefined ? `<initialValue><simpleValue value="${lv.initialValue}"/></initialValue>` : ''}
              ${lv.address ? `<address>${lv.address}</address>` : ''}
            </variable>
`;
      }
      xml += `          </localVars>
        </interface>
        <body>
          <LD>
`;
      for (const rung of pou.rungs) {
        xml += `            <!-- Network / Rung ${rung.rungNumber}: ${rung.title} -->
            <comment><content><xhtml xmlns="http://www.w3.org/1999/xhtml">${rung.comment || ''}</xhtml></content></comment>
`;
        for (const el of rung.elements) {
          xml += `            <element type="${el.elementType}" variable="${el.variableName}" col="${el.col}" row="${el.row}" energized="${el.isEnergized}"/>
`;
        }
      }
      xml += `          </LD>
        </body>
      </pou>
`;
    }

    xml += `    </pous>
  </types>
  <instances>
    <configurations>
      <configuration name="Config_CCM01">
        <resource name="Res_CPU_01">
          <task name="FastCyclicTask" interval="PT12MS" priority="1">
            <pouInstance name="MainInstance" typeName="${program.pous[0]?.name || 'Main_Control_Logic'}"/>
          </task>
          <globalVars>
`;

    for (const gv of program.globalVariables) {
      xml += `            <variable name="${gv.name}" ${gv.isRetentive ? 'retain="true"' : ''}>
              <type><${gv.dataType}/></type>
              ${gv.address ? `<address>${gv.address}</address>` : ''}
            </variable>
`;
    }

    xml += `          </globalVars>
        </resource>
      </configuration>
    </configurations>
  </instances>
</project>`;

    return xml;
  }
}
