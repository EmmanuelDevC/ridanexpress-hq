// src/polyfills.js
if (typeof global === 'undefined') {
  window.global = window;
}

if (typeof crypto === 'undefined') {
  window.crypto = {
    subtle: {
      importKey: (format, keyData, algorithm, extractable, keyUsages) => {
        return new Promise((resolve, reject) => {
          if (window.msCrypto) {
            resolve(window.msCrypto.subtle.importKey(format, keyData, algorithm, extractable, keyUsages));
          } else if (window.crypto) {
            resolve(window.crypto.subtle.importKey(format, keyData, algorithm, extractable, keyUsages));
          } else {
            reject(new Error('Web Crypto API not supported'));
          }
        });
      },
      sign: (algorithm, key, data) => {
        return new Promise((resolve, reject) => {
          if (window.msCrypto) {
            resolve(window.msCrypto.subtle.sign(algorithm, key, data));
          } else if (window.crypto) {
            resolve(window.crypto.subtle.sign(algorithm, key, data));
          } else {
            reject(new Error('Web Crypto API not supported'));
          }
        });
      }
    }
  };
}