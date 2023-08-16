import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [portPaths, setPortPaths] = useState([]);
  const [selectedPort, setSelectedPort] = useState('');

  useEffect(() => {
    async function fetchPortPaths() {
      try {
        const response = await axios.get('http://localhost:3001/serial-ports');
        setPortPaths(response.data);
      } catch (error) {
        console.error('Erro ao encontrar as portas', error);
      }
    }

    fetchPortPaths();
  }, []);

  const handlePortSelect = event => {
    setSelectedPort(event.target.value);
  };

  return (
    <div>
      <h1>Selecione a porta serial</h1>
      <select value={selectedPort} onChange={handlePortSelect}>
        <option value=""></option>
        {portPaths.map((path, index) => (
          <option key={index} value={path}>
            {path}
          </option>
        ))}
      </select>
      <p>Porta Selecionada: {selectedPort}</p>
    </div>
  );
};

export default App;
