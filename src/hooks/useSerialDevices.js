import { useState, useEffect } from 'react';

export const useSerialDevices = () => {
    const [serialDevices, setSerialDevices] = useState([]);
    // const filters = [
    //     { usbVendorId: 0x2341, usbProductId: 0x0043 },
    //     { usbVendorId: 0x2341, usbProductId: 0x0001 }
    // ];
    useEffect(() => {
        const fetchSerialDevices = async () => {
            try {
                const ports = await navigator.serial.getPorts();
                const devices = ports.map(port => {
                    const portInfo = port.getInfo();
                    return {
                        idString:   "vendorID: " + portInfo.usbVendorId.toString(16) +
                                    " - productID: " + " " + portInfo.usbProductId.toString(16),
                        vendorId: portInfo.usbVendorId,
                        productId: portInfo.usbProductId,
                        instance: port
                    }
                });
                setSerialDevices(devices);
            } catch (err) {
                alert('Ocorreu um erro na busca serial ' + err.message);
            }
        };
        fetchSerialDevices();
    }, []);
    return serialDevices;
}
