// everything mod 128

const generatePrivatekey = () => {
    const randomNumbers = [];
    for (let i = 0; i < 64; i++) {
        randomNumbers.push(Math.floor(Math.random() * 128));
    }
    return randomNumbers;
}

const generatePublickey = (privateKey) => {
    const equations = [];
    for(let i = 0; i < 512; i++){
        const equation = [];
        let offset = 0;
        for(let x = 0; x < 64; x++){
            let coefficient = Math.floor(Math.random() * 128);
            equation.push(coefficient);
            offset += 128 - (coefficient * privateKey[x]) % 128;
        }
        equation.push(offset %= 128);
        equations.push(equation);
    }
    return equations;
}

//message is a single bit
const _encrypt = (message, partialPublickey) => {
    let newEquation = Array(partialPublickey[0].length).fill(0);
    for(let i = 0; i < partialPublickey.length; i++){
        const keyEquation = partialPublickey[i];
        for(let t = 0; t < partialPublickey[0].length; t++){
            newEquation[t] += keyEquation[t];
            if(t == partialPublickey[0].length - 1){
                newEquation[t] += Math.floor(Math.random()*2) - 1;
            }
            newEquation[t] += 128;
            newEquation[t] %= 128;
        }
    }
    let constant = newEquation[newEquation.length-1];
    if(message == 1) {
        if(constant < 32 && constant > 96) {
            newEquation[newEquation.length-1] += 64;
        }
    }
    else{
        if(constant >= 32 && constant <= 96) {
            newEquation[newEquation.length-1] += 64;
        }
    }
    newEquation[newEquation.length-1] += 128;
    newEquation[newEquation.length-1] %= 128;
    return newEquation;
}

const _decrypt = (encrypted, privateKey) => {
    let answer = 0;
    for(i = 0; i < encrypted.length - 1; i++){
        answer += privateKey[i] * encrypted[i];
        answer %= 128;
    }

    let a = Math.min(answer,encrypted[encrypted.length - 1]);
    let b = Math.max(answer,encrypted[encrypted.length - 1]);
    let err = (b-a) % 128;
    console.debug(err);
    console.debug(answer);
    if(answer >= 32 && answer <= 96) {
        console.info(`1`)
        return (err >= 64) ? 0 : 1;
    }
    else {
        console.info(`0`)
        return (err >= 64) ? 1 : 0;
    }
}

const getPartialPublicKey = (publicKey) => {
    const totalRows = 512;
     const indices = Array.from({ length: totalRows }, (_, i) => i);

     for (let i = totalRows - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [indices[i], indices[j]] = [indices[j], indices[i]];
     }
 
     const selectedRows = indices.slice(0, 32).map(index => publicKey[index]);
     return selectedRows;
}

let pr = generatePrivatekey();
let pu = generatePublickey(pr);
let data = Math.floor(Math.random()*2);
let edata = _encrypt(data,getPartialPublicKey(pu));
let ddata = _decrypt(edata,pr);

console.log(`private : ${pr}`);
console.log(`public : ${pu}`)
console.log(`data bit : ${data}`)
console.log(` -> encrypted ${edata}`)
console.log(` -> decrypted ${ddata}`)