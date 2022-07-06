// import crypto from 'crypto';

// const CryptoAlgorithm = 'aes-256-cbc';

// export const encrypt = (algorithm, buffer, key, iv) => {
//   // Membuat dan inisialisasi objek cipher
//   const cipher = crypto.createCipheriv(algorithm, key, iv);

//   // Mnggabungkan semua objek buffer dalam array yang diberikan
//   // menjadi satu objek buffer yang terenkripsi
//   const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

//   return encrypted;
// };

// export const decrypt = (algorithm, buffer, key, iv) => {
//   // Membuat dan inisialisasi objek cipher
//   const decipher = crypto.createDecipheriv(algorithm, key, iv);

//   // Mnggabungkan semua objek buffer dalam array yang terenkripsi yang diberikan
//   // menjadi satu objek buffer untuk didekripsi
//   const decrypted = Buffer.concat([decipher.update(buffer), decipher.final()]);

//   return decrypted;
// };

// export const encryptFile = (buffer, key, iv) => {
//   const encrypted = encrypt(CryptoAlgorithm, buffer, key, iv);

//   return encrypted;
// };

// export const decryptFile = (encryptedBuffer, key, iv) => {
//   const decrypted = decrypt(CryptoAlgorithm, encryptedBuffer, key, iv);

//   return decrypted;
// };

// export const encryptString = (CryptoAlgorithm, message, key, iv) => {
//   // Membuat dan inisialisasi objek cipher
//   const encrypter = crypto.createCipheriv(CryptoAlgorithm, key, iv);

//   // Memperbaharui cipher dengan string yang ingin dienkripsi
//   // dengan menggunakan method update()
//   let encryptedMsg = encrypter.update(message, 'utf8', 'hex');

//   // Mendapatkan string yang telah dienkripsi
//   encryptedMsg += encrypter.final('hex');

//   return encryptedMsg;
// };

// export const decryptString = (CryptoAlgorithm, encryptedMessage, key, iv) => {
//   // Membuat dan inisialisasi objek cipher
//   const decrypter = crypto.createDecipheriv(CryptoAlgorithm, key, iv);

//   // Memperbaharui cipher dengan string yang ingin didekripsi
//   // dengan menggunakan method update()
//   let decryptedMsg = decrypter.update(encryptedMessage, 'hex', 'utf8');

//   // Mendapatkan string yang telah dienkripsi
//   decryptedMsg += decrypter.final('utf8');

//   return decryptedMsg;
// };

import crypto from 'crypto';

const CryptoAlgorithm = 'aes-256-cbc';

export const encrypt = (algorithm, buffer, key, iv) => {
  console.log('Encrypt File');
  console.log({ buffer });

  const encrypter = crypto.createCipheriv(algorithm, key, iv);
  console.log({ encrypter });

  const encrypted = Buffer.concat([
    encrypter.update(buffer),
    encrypter.final(),
  ]);

  console.log({ encrypted });

  return encrypted;
};

export const decrypt = (algorithm, buffer, key, iv) => {
  console.log('Decrypt File');
  console.log({ buffer });
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  console.log({ decipher });

  const decrypted = Buffer.concat([decipher.update(buffer), decipher.final()]);
  console.log({ decrypted });

  return decrypted;
};

export const encryptFile = (buffer, key, iv) => {
  console.time('Encrypt File');
  const encrypted = encrypt(CryptoAlgorithm, buffer, key, iv);

  console.timeEnd('Encrypt File');
  return encrypted;
};

export const decryptFile = (encryptedBuffer, key, iv) => {
  console.time('Decrypt File');
  const decrypted = decrypt(CryptoAlgorithm, encryptedBuffer, key, iv);

  console.timeEnd('Decrypt File');
  return decrypted;
};

export const encryptString = (message, key, iv) => {
  console.time('Encrypt String');
  console.log('Encrypt String = ', message);

  const encrypter = crypto.createCipheriv('aes-256-cbc', key, iv);
  console.log({ encrypter });

  let encryptedMsg = encrypter.update(message, 'utf8', 'hex');
  console.log({ encryptedMsg });

  encryptedMsg += encrypter.final('hex');
  console.log('Final encryptedMsg = ', encryptedMsg);
  console.timeEnd('Encrypt String');

  return encryptedMsg;
};

export const decryptString = (encryptedMessage, key, iv) => {
  console.time('Decrypt String');
  console.log('Decrypt String = ', encryptedMessage);

  const decrypter = crypto.createDecipheriv('aes-256-cbc', key, iv);
  console.log({ decrypter });

  let decryptedMsg = decrypter.update(encryptedMessage, 'hex', 'utf8');
  console.log({ decryptedMsg });

  decryptedMsg += decrypter.final('utf8');
  console.log('Final decryptedMsg = ', decryptedMsg);
  console.timeEnd('Decrypt String');

  return decryptedMsg;
};
