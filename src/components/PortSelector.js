import { useState } from 'react';
import { useSerialDevices } from '../hooks/index.js';

export const PortSelector = () => {
    const devices = useSerialDevices();
    const [selectedPort, setSelectedPort] = useState('');
    const handlePortSelect = event => {
        setSelectedPort(event.target.value);
    };
    return (
        <div>
            <h1>Selecione a porta serial</h1>
                <select value={selectedPort} onChange={handlePortSelect}>
                    <option value=""></option>
                    {devices.map((device, index) => (
                        <option key={index} value={device.idString}>
                        {device.idString}
                        </option>
                    ))}
                </select>
            <p>Porta Selecionada: {selectedPort}</p>
        </div>
    );
};