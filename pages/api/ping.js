import ping from 'ping';
import isIP from 'net';

export default async function handler(req, res) {
  const { ipAddress } = req.query;

  try {
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ time: 'timeout' }), 2000);
    });

    const pingPromise = ping.promise.probe(ipAddress);

    const response = await Promise.race([timeoutPromise, pingPromise]);

    if (response.time === 'timeout') {
      res.status(200).json({ status: 'error' });
    } else {
      const status = response.alive ? 'success' : 'error';
      res.status(200).json({ status });
    }
  } catch (error) {
    res.status(200).json({ status: 'error' });
  }
}
