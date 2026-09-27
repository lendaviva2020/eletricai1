import { render, screen, fireEvent } from '@testing-library/react';
import { AlarmBanner, type ScadaAlarm } from '@/components/scada/AlarmBanner';

const criticalAlarm: ScadaAlarm = {
  id: 'ALM_TEMP_MANCAL_MTR01',
  severity: 'CRITICAL',
  title: 'Temperatura de mancal',
  message: 'Temperatura de Mancal MTR01 acima do limite crítico: 91.2°C!',
  sourceTag: 'TEMP_MANCAL_COMP',
};

const warningAlarm: ScadaAlarm = {
  id: 'ALM_VDROP',
  severity: 'WARNING',
  title: 'Queda de tensão',
  message: 'Queda de tensão do condutor em 4,3%.',
};

describe('AlarmBanner (SCADA — FASE 14)', () => {
  it('mostra o estado nominal quando não há alarmes', () => {
    render(<AlarmBanner alarms={[]} endpoint="SCADA NODE: OPCUA://192.168.10.20:4840" />);

    expect(
      screen.getByText('Sistema operando dentro dos limites nominais da ABNT NBR 5410.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('exibe DADO_NAO_INFORMADO quando o endpoint não é informado', () => {
    render(<AlarmBanner alarms={[]} />);

    expect(screen.getByText('DADO_NAO_INFORMADO')).toBeInTheDocument();
  });

  it('renderiza o alarme mais severo primeiro com o rótulo correto', () => {
    render(<AlarmBanner alarms={[warningAlarm, criticalAlarm]} />);

    expect(screen.getByText('[ALARME ALTO]')).toBeInTheDocument();
    expect(screen.getByText(/Temperatura de Mancal MTR01/)).toBeInTheDocument();
    expect(screen.getByText(/\(\+1 outro\(s\) alarme\(s\)\)/)).toBeInTheDocument();
  });

  it('renderiza o rótulo de alerta para severidade WARNING', () => {
    render(<AlarmBanner alarms={[warningAlarm]} />);

    expect(screen.getByText('[ALERTA]')).toBeInTheDocument();
    expect(screen.getByText(/Queda de tensão do condutor/)).toBeInTheDocument();
  });

  it('reconhece o alarme crítico quando o handler é informado', () => {
    const onAcknowledge = jest.fn();
    render(<AlarmBanner alarms={[criticalAlarm]} onAcknowledge={onAcknowledge} />);

    const button = screen.getByRole('button', { name: /Reconhecer/ });
    fireEvent.click(button);

    expect(onAcknowledge).toHaveBeenCalledWith('ALM_TEMP_MANCAL_MTR01');
    expect(screen.getByText('ACK')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reconhecer/ })).not.toBeInTheDocument();
  });

  it('não exibe botão de reconhecimento sem handler', () => {
    render(<AlarmBanner alarms={[criticalAlarm]} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
