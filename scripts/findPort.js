const net = require('net');

function testListen(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

async function isPortFree(port) {
  const free127 = await testListen(port, '127.0.0.1');
  if (!free127) return false;
  const free0 = await testListen(port, '0.0.0.0');
  if (!free0) return false;
  return true;
}

async function getAvailablePort(startPort) {
  let port = parseInt(startPort, 10) || 3000;
  while (!(await isPortFree(port))) {
    port++;
  }
  return port;
}

const target = process.argv[2] || 3000;
getAvailablePort(target)
  .then((port) => {
    process.stdout.write(String(port));
    process.exit(0);
  })
  .catch(() => {
    process.stdout.write(String(target));
    process.exit(1);
  });
