import fs from 'fs';

const jsonDataPath = 'computers.json';

export default function handler(req, res) {
  const { name, macAddress, ipAddress } = req.body;

  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}.[0-9a-fA-F]{4}.[0-9a-fA-F]{4})$/;

  if (!macRegex.test(macAddress)) {
    return res.json({ error: 'Neplatná MAC Adresa' });
  }

  // Regular expression for validating IPv4 and IPv6 addresses
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (!ipRegex.test(ipAddress)) {
    return res.json({ error: 'Neplatná IP Adresa' });
  }

  const newComputer = { name, macAddress, ipAddress };

  const jsonData = JSON.parse(fs.readFileSync(jsonDataPath, 'utf8'));

  jsonData.push(newComputer);

  fs.writeFileSync(jsonDataPath, JSON.stringify(jsonData, null, 2), 'utf8');

  res.json({ success: true });
}
