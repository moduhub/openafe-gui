export const FinishReading = () => {
  window.electron.sendCommand('$CMD,DIE*2E');
};