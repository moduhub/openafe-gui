async function calculateChecksum(input) {
    let checksum = 0;
    // Percorre cada caractere na string de entrada
    for (let i = 0; i < input.length; i++) {
        checksum ^= input.charCodeAt(i); // Faz um XOR com o valor ASCII de cada caractere
    }

    // Converte o resultado para uma representação hexadecimal de dois dígitos
    return checksum.toString(16).toUpperCase().padStart(2, '0');
}