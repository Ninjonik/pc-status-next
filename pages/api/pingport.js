import net from 'net';

export default function handler(req, res) {
  const { ipAddress, port } = req.query;
  const timeout = 2000;

  const client = new net.Socket();

  const timeoutId = setTimeout(() => {
    client.destroy();
    res.status(200).json({ status: 'error' });
  }, timeout);

  client.connect(port, ipAddress, () => {
    clearTimeout(timeoutId);
    client.destroy();
    res.status(200).json({ status: 'success' });
  });

  client.on('error', (error) => {
    clearTimeout(timeoutId);
    res.status(200).json({ status: 'error' });
  });
}
