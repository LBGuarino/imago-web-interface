module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Asegúrate de incluir todos los patrones de archivos TypeScript que necesites
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
  };
  