const { execSync } = require('child_process');

const targetPorts = [
  5000, 5001, 5002, 5003, 5004, 5005,
  3000, 3001, 3002, 3003, 3004, 3005
];

let stoppedCount = 0;

for (const port of targetPorts) {
  try {
    const netstatOutput = execSync(`netstat -ano -p tcp | findstr /R /C:":${port} "`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const lines = netstatOutput.split(/\r?\n/).filter(line => line.includes('LISTENING'));
    const pids = new Set();

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && !isNaN(Number(pid))) {
        pids.add(pid);
      }
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: ['pipe', 'pipe', 'ignore'] });
        console.log(`Puerto ${port}: Proceso PID ${pid} detenido.`);
        stoppedCount++;
      } catch (err) {
        // Ignorar si el proceso ya terminó
      }
    }
  } catch (err) {
    // No hay procesos escuchando en este puerto
  }
}

if (stoppedCount === 0) {
  console.log('No se encontraron procesos activos en los puertos de backend (5000-5005) ni frontend (3000-3005).');
} else {
  console.log(`Se liberaron los puertos (${stoppedCount} proceso(s) detenido(s)).`);
}
