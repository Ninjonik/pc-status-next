import fs from 'fs';

const jsonDataPath = 'computers.json';

export default function handler(req, res) {
  const { ipAddress, name } = req.body;

  try {
    const jsonData = JSON.parse(fs.readFileSync(jsonDataPath, 'utf8'));

    const index = jsonData.findIndex((computer) => computer.ipAddress === ipAddress);

    if (index !== -1) {
      jsonData[index].name = name;

      fs.writeFileSync(jsonDataPath, JSON.stringify(jsonData, null, 2), 'utf8');

      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Computer not found.' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
