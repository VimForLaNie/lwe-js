const generatePrivateKey = (size) => {
    const modulo = Math.pow(2, Math.ceil(Math.log(((1*size) << 10))/Math.log(2)));
    console.log(`modulo : ${modulo}`);

    const randomNumbers = new Uint16Array(size+1); // Increase size by 1 to include modulo
    window.crypto.getRandomValues(randomNumbers);
    for (let i = 0; i < size; i++) {
        randomNumbers[i] = randomNumbers[i] % modulo;
        // console.log(`appended : ${randomNumbers}`)
    }
    randomNumbers[size] = modulo;

    // console.log(`append mod ${modulo} : ${randomNumbers}`);
    const base64 = btoa(randomNumbers);

    console.log(`vector : ${randomNumbers}\nprivate key: ${base64}`);
    return [base64,modulo];
}

const readPrivateKey = (base64) => {
    const result = atob(base64).split(',').map(x => parseInt(x));
    // console.info(`read private key : ${base64} => ${result}`);
    return result;
}

const generatePublicKey = (size, privateKey) => {
    const modulo = privateKey[privateKey.length - 1];
    // console.log(`read modulo : ${modulo}`)
    // Determine column size by subtracting 1 from the length of the private key
    const col = privateKey.length - 1;
    // generate public key from private key
    const matrix = [];
    for (let i = 0; i < size; i++) {
        const r = [];
        const randomValues = new Uint16Array(col);
        window.crypto.getRandomValues(randomValues);
        for (let j = 0; j < col; j++) {
            // mod with modulo
            const randomValue = randomValues[j] % modulo;
            r.push(randomValue);
        }
        // calculate dot product with private key
        let dotProduct = r.reduce((sum, val, idx) => sum + (val * privateKey[idx]), 0) % modulo;
        // add some errors
        dotProduct += window.crypto.getRandomValues(new Uint16Array(1))[0] % (modulo / 2);
        r.push(dotProduct);
        matrix.push(r);
    }
    // encode to base64
    // const publicKey = btoa(String.fromCharCode.apply(null, matrix.flat()));
    const publicKey = btoa(matrix);
    console.log(`matrix form : ${matrix}\nbase64 : ${publicKey}`);
    return [publicKey,modulo];
}

const readPublicKey = (base64) => {
    // convert to Uint8Array
    const array = atob(base64).split(',').map(x => parseInt(x));
    // console.log(array)
    return array;
}

const encrypt = (publicKey,modulo, message) => {
    const messageArray = btoa(message)
    console.log(`messageArray : ${messageArray}`);
    const publicKeyArray = readPublicKey(publicKey);
    const randomRows = [];
    const randomValues = new Uint16Array(publicKeyArray.length);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < publicKeyArray.length; i++) {
        const randomValue = randomValues[i] % 2;
        if (randomValue === 1) continue;
        randomRows.push(publicKeyArray[i]);
    }
    const level = 1 << 8;
    const error = modulo / level;
    console.log(randomRows);
    const newRow = new Uint16Array(randomRows.length);
    // console.log(newRow);
    for (let row = 0; row < (randomRows.length)/(4+1); row++) {
        for(let i = 0; i < newRow.length; i++){
            newRow[i] = (newRow[i] + randomRows[i + row*randomRows.length]) % modulo;
            // console.log((newRow[i] + randomRows[i + row*randomRows.length]) % modulo);
        }
    }
    console.log(`newRow : ${newRow}`);
}

// Example usage
const [privateKeyBase64,mod] = generatePrivateKey(32); // Generate a private key
const privateKey = readPrivateKey(privateKeyBase64); // Read the private key
const [pub, _] = generatePublicKey(128, privateKey); // Generate the public key matrix
console.log("encryption");
encrypt(pub,mod,"hello");