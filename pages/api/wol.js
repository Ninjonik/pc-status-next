import wol from 'wol';

export default function handler(req, res) {
  const { macAddress } = req.query;

  wol.wake(macAddress, function(err, result) {
    if (err) {
      res.status(200).json({ status: 'error' });
    } else {
      res.status(200).json({ status: 'success' });
    }
  });
}
