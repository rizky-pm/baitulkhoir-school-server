import crypto from 'crypto';

const CryptoAlgorithm = 'aes-256-cbc';

export const encrypt = (algorithm, buffer, key, iv) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return encrypted;
};

export const decrypt = (algorithm, buffer, key, iv) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([decipher.update(buffer), decipher.final()]);

  return decrypted;
};

export const encryptFile = (buffer, key, iv) => {
  const encrypted = encrypt(CryptoAlgorithm, buffer, key, iv);

  return encrypted;
};

export const decryptFile = (encryptedBuffer, key, iv) => {
  const decrypted = decrypt(CryptoAlgorithm, encryptedBuffer, key, iv);

  return decrypted;
};

export const encryptString = (message, key, iv) => {
  const encrypter = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encryptedMsg = encrypter.update(message, 'utf8', 'hex');
  encryptedMsg += encrypter.final('hex');

  return encryptedMsg;
};

export const decryptString = (encryptedMessage, key, iv) => {
  const decrypter = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decryptedMsg = decrypter.update(encryptedMessage, 'hex', 'utf8');
  decryptedMsg += decrypter.final('utf8');

  return decryptedMsg;
};
