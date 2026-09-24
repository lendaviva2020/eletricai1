// Real AutoCAD ASCII DXF Generator for Electrical CAD Diagrams
import { ElectricalComponent, ElectricalConnection } from '@/types/electrical';

export function generateElectricalDxf(
  projectName: string,
  components: ElectricalComponent[],
  connections: ElectricalConnection[]
): string {
  const lines: string[] = [];

  const add = (group: string, val: string | number) => {
    lines.push(group);
    lines.push(String(val));
  };

  // DXF HEADER
  add('0', 'SECTION');
  add('2', 'HEADER');
  add('9', '$ACADVER');
  add('1', 'AC1009'); // AutoCAD Release 12/2000 compatibility
  add('9', '$INSUNITS');
  add('70', '4'); // Millimeters
  add('0', 'ENDSEC');

  // DXF TABLES & LAYERS
  add('0', 'SECTION');
  add('2', 'TABLES');
  add('0', 'TABLE');
  add('2', 'LAYER');
  add('70', '5');

  const defineLayer = (name: string, color: number) => {
    add('0', 'LAYER');
    add('2', name);
    add('70', '0');
    add('62', color); // 1=Red, 2=Yellow, 3=Green, 4=Cyan, 5=Blue, 7=White
    add('6', 'CONTINUOUS');
  };

  defineLayer('CAMADA_MOLDURA', 7);
  defineLayer('CAMADA_EQUIPAMENTOS', 2); // Yellow
  defineLayer('CAMADA_CONDUTORES', 4);  // Cyan
  defineLayer('CAMADA_TEXTOS', 7);      // White
  defineLayer('CAMADA_BARRAMENTO', 1);  // Red

  add('0', 'ENDTAB');
  add('0', 'ENDSEC');

  // DXF ENTITIES SECTION
  add('0', 'SECTION');
  add('2', 'ENTITIES');

  // 1. Moldura do Selo A3 (420 x 297 mm em escala 1:1)
  const drawRect = (layer: string, x: number, y: number, w: number, h: number) => {
    // 4 lines
    const addLine = (x1: number, y1: number, x2: number, y2: number) => {
      add('0', 'LINE');
      add('8', layer);
      add('10', x1);
      add('20', y1);
      add('30', 0);
      add('11', x2);
      add('21', y2);
      add('31', 0);
    };

    addLine(x, y, x + w, y);
    addLine(x + w, y, x + w, y + h);
    addLine(x + w, y + h, x, y + h);
    addLine(x, y + h, x, y);
  };

  const drawText = (layer: string, x: number, y: number, height: number, text: string) => {
    add('0', 'TEXT');
    add('8', layer);
    add('10', x);
    add('20', y);
    add('30', 0);
    add('40', height);
    add('1', text);
  };

  // Moldura A3 Externa
  drawRect('CAMADA_MOLDURA', 0, 0, 420, 297);
  drawRect('CAMADA_MOLDURA', 10, 10, 400, 277);

  // Bloco de Título / Selo
  drawRect('CAMADA_MOLDURA', 240, 10, 170, 50);
  drawText('CAMADA_TEXTOS', 245, 52, 4.0, `PROJETO: ${projectName}`);
  drawText('CAMADA_TEXTOS', 245, 42, 3.0, 'ELETRICAI - ENGENHARIA ELÉTRICA');
  drawText('CAMADA_TEXTOS', 245, 32, 2.5, 'DIAGRAMA UNIFILAR GERAL QGBT (NBR 5410)');
  drawText('CAMADA_TEXTOS', 245, 22, 2.5, `DATA: ${new Date().toLocaleDateString('pt-BR')} | ESCALA: 1:1`);
  drawText('CAMADA_TEXTOS', 245, 14, 2.0, 'RESP. TÉCNICO: ENG. RESPONSÁVEL CREA ATIVO');

  // 2. Conexões / Fios Elétricos
  connections.forEach(conn => {
    const fromComp = components.find(c => c.id === conn.fromComponentId);
    const toComp = components.find(c => c.id === conn.toComponentId);
    if (!fromComp || !toComp) return;

    // Converter coordenadas CAD da tela para espaço mm do desenho
    const scale = 0.35;
    const x1 = fromComp.x * scale + 20;
    const y1 = 280 - (fromComp.y + fromComp.height) * scale;
    const x2 = toComp.x * scale + 20;
    const y2 = 280 - toComp.y * scale;

    const midY = (y1 + y2) / 2;

    // Segmentos ortogonais
    const addLine = (ax: number, ay: number, bx: number, by: number) => {
      add('0', 'LINE');
      add('8', 'CAMADA_CONDUTORES');
      add('10', ax);
      add('20', ay);
      add('30', 0);
      add('11', bx);
      add('21', by);
      add('31', 0);
    };

    addLine(x1, y1, x1, midY);
    addLine(x1, midY, x2, midY);
    addLine(x2, midY, x2, y2);

    if (conn.wireGauge) {
      drawText('CAMADA_TEXTOS', (x1 + x2) / 2 + 2, midY + 1, 2.0, `${conn.wireGauge}mm2`);
    }
  });

  // 3. Equipamentos Elétricos
  components.forEach(comp => {
    const scale = 0.35;
    const cx = comp.x * scale + 20;
    const cy = 280 - (comp.y + comp.height) * scale;
    const cw = comp.width * scale;
    const ch = comp.height * scale;

    const layer = comp.category === 'BUSBAR' ? 'CAMADA_BARRAMENTO' : 'CAMADA_EQUIPAMENTOS';
    drawRect(layer, cx, cy, cw, ch);

    drawText('CAMADA_TEXTOS', cx + 2, cy + ch - 5, 2.8, comp.tag);
    drawText('CAMADA_TEXTOS', cx + 2, cy + ch - 10, 2.0, `${comp.nominalCurrent}A | ${comp.voltage}V`);
    if (comp.cableCrossSection) {
      drawText('CAMADA_TEXTOS', cx + 2, cy + 3, 1.8, `Cabo: ${comp.cableCrossSection}mm2`);
    }
  });

  add('0', 'ENDSEC');
  add('0', 'EOF');

  return lines.join('\n');
}
