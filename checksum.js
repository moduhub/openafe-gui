function calculateChecksumOfString(string) {
    let checksum = 0;
    for (let i = 0; i < string.length; i++) {
        checksum ^= string.charCodeAt(i);
    }
    return checksum;
}

// let command = "CMD,CUR,4500";
// let command = "CMD,CUR,100";
// let command = "CVW,1000,-1000,250,2,1";
// let command = "CVW,500,-500,250,2,1";
let command = "CVW,0,0,0,0,0,0";
/* let command = "DPV,1000,-100,500,100,2,10,20,1,2"; */

let checksum = calculateChecksumOfString(command);
let checksumString = checksum.toString(16).toUpperCase().padStart(2, '0');
let fullCommand = "$" + command + "*" + checksumString;
console.log("full command: ", fullCommand);
