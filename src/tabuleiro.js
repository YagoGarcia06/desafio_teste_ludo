const NUM_JOGADORES = 2;
const PEOES_POR_JOGADOR = 4;
const TAMANHO_PERCURSO = 52;
const ULTIMO_PASSO_PERCURSO = 50;
const PASSO_CHEGADA = 56;
const SAIDAS = [0, 26];
const CASAS_SEGURAS = [0, 13, 26, 39, 8, 21, 34, 47];

function validarJogador(jogador) {
  if (!Number.isInteger(jogador) || jogador < 0 || jogador >= NUM_JOGADORES) {
    throw new Error(`jogador inválido: ${jogador} (use 0 ou 1)`);
  }
}

function validarPassos(passos) {
  if (!Number.isInteger(passos) || passos < 0 || passos > PASSO_CHEGADA) {
    throw new Error(`passos inválidos: ${passos} (use um inteiro de 0 a 56)`);
  }
}

// Devolve a casa do percurso comum, ou null se o peão está na reta final ou na chegada.
function casaDoPasso(jogador, passos) {
  validarJogador(jogador);
  validarPassos(passos);
  if (passos > ULTIMO_PASSO_PERCURSO) {
    return null;
  }
  return (SAIDAS[jogador] + passos) % TAMANHO_PERCURSO;
}

function ehCasaSegura(casa) {
  if (!Number.isInteger(casa) || casa < 0 || casa >= TAMANHO_PERCURSO) {
    throw new Error(`casa inválida: ${casa} (use 0 a 51)`);
  }
  return CASAS_SEGURAS.includes(casa);
}

module.exports = {
  NUM_JOGADORES,
  PEOES_POR_JOGADOR,
  TAMANHO_PERCURSO,
  ULTIMO_PASSO_PERCURSO,
  PASSO_CHEGADA,
  SAIDAS,
  CASAS_SEGURAS,
  validarJogador,
  validarPassos,
  casaDoPasso,
  ehCasaSegura,
};
