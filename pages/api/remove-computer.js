import fs from 'fs';

const jsonDataPath = 'computers.json';

export default function handler(req, res) {
  const { macAddress } = req.body;

  const jsonData = JSON.parse(fs.readFileSync(jsonDataPath, 'utf8'));

  const index = jsonData.findIndex((computer) => computer.macAddress === macAddress);

  if (index !== -1) {
    jsonData.splice(index, 1);

    fs.writeFileSync(jsonDataPath, JSON.stringify(jsonData, null, 2), 'utf8');

    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Computer not found.' });
  }
}
