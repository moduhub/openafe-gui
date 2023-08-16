const express = require('express');
const {SerialPort} = require('serialport');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors())
app.use(express.json())

app.get('/serial-ports', async (req, res) => {
  try {
    const ports = await SerialPort.list();
    const portPaths = ports.map(port => port.path);
    res.json(portPaths);
  } catch (err) {
    res.status(500).json({ error: err.message });
    alert('Ocorreu um erro na busca serial ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`Rondado na porta ${port}`);
});
