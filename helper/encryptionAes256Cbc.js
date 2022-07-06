import aesjs from 'aes-js';

export const encryptAes256cbc = (data, key, iv, fileName = '') => {
  console.time('Encrypt Data');

  // Convert text to bytes (text must be a multiple of 16 bytes)
  const toEncrypt = aesjs.utils.utf8.toBytes(data);
  console.log({ toEncrypt });

  const aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
  console.log({ aesCbc });

  const paddedData = aesjs.padding.pkcs7.pad(toEncrypt);
  console.log({ paddedData });

  const encryptedBytes = aesCbc.encrypt(aesjs.padding.pkcs7.pad(toEncrypt));
  console.log({ encryptedBytes });

  // To print or store the binary data, you may convert it to hex
  const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

  console.log('Encrypted Data = ', fileName);
  console.timeEnd('Encrypt Data');

  return encryptedHex;
};

export const decryptAes256cbc = (data, key, iv, fileName = '') => {
  console.time('Decrypt Data');
  var encryptedBytes = aesjs.utils.hex.toBytes(data);
  console.log({ encryptedBytes });

  // The cipher-block chaining mode of operation maintains internal
  // state, so to decrypt a new instance must be instantiated.
  var aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
  console.log({ aesCbc });

  var decryptedBytes = aesCbc.decrypt(encryptedBytes);
  console.log({ decryptedBytes });

  const paddedData = aesjs.padding.pkcs7.strip(decryptedBytes);
  console.log({ paddedData });

  // Convert our bytes back into text
  var decryptedText = aesjs.utils.utf8.fromBytes(
    aesjs.padding.pkcs7.strip(decryptedBytes)
  );

  console.log('Decrypted Data = ', fileName);
  console.timeEnd('Decrypt Data');

  return decryptedText;
};
