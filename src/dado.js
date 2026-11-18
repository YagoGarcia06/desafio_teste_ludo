const FACES = 6;

function validarFace(valor) {
  if (!Number.isInteger(valor) || valor < 1 || valor > FACES) {
    throw new Error(`valor do dado inválido: ${valor} (use 1 a 6)`);
  }
}

function criarDadoSequencia(valores) {
  if (!Array.isArray(valores) || valores.length === 0) {
    throw new Error('sequência do dado inválida: informe uma lista não vazia');
  }
  valores.forEach(validarFace);
  const fila = [...valores];
  let indice = 0;

  return {
    rolar() {
      if (indice >= fila.length) {
        throw new Error('sequência do dado esgotada');
      }
      return fila[indice++];
    },
  };
}

function criarDadoAleatorio(rng) {
  if (typeof rng !== 'function') {
    throw new Error('rng inválido: informe uma função que gere números em [0, 1)');
  }
  return {
    rolar() {
      return Math.floor(rng() * FACES) + 1;
    },
  };
}

module.exports = { FACES, criarDadoSequencia, criarDadoAleatorio };
