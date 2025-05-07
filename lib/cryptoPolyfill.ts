/**
 * Polyfill for crypto.getRandomValues
 * This is needed for the uuid package to work in React Native
 */

// Check if crypto is available
if (typeof global.crypto !== 'object') {
  // Create a crypto object if it doesn't exist
  Object.defineProperty(global, 'crypto', {
    value: {},
  });
}

// Check if getRandomValues is available
if (typeof global.crypto.getRandomValues !== 'function') {
  // Implement a simple polyfill for getRandomValues
  Object.defineProperty(global.crypto, 'getRandomValues', {
    value: function(array: Uint8Array) {
      // Fill the array with random values
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
  });
}

export {};
