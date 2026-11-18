const tabuleiro = require('./tabuleiro');

const BASE = null;
const VALOR_SAIDA = 6;

function validarDado(dado) {
  if (!dado || typeof dado.rolar !== 'function') {
    throw new Error('dado inválido: informe um objeto com a função rolar()');
  }
}

function peoesNaBase() {
  return Array.from({ length: tabuleiro.PEOES_POR_JOGADOR }, () => BASE);
}

function montarPeoes(pecas) {
  if (pecas === undefined) {
    return [peoesNaBase(), peoesNaBase()];
  }
  if (!Array.isArray(pecas) || pecas.length !== tabuleiro.NUM_JOGADORES) {
    throw new Error('estado inicial inválido: informe as posições dos 2 jogadores');
  }
  return pecas.map((lista) => {
    if (!Array.isArray(lista) || lista.length !== tabuleiro.PEOES_POR_JOGADOR) {
      throw new Error('estado inicial inválido: cada jogador tem 4 peões');
    }
    return lista.map((passos) => {
      if (passos !== BASE) {
        tabuleiro.validarPassos(passos);
      }
      return passos;
    });
  });
}

class Partida {
  constructor({ dado, pecas, jogadorInicial = 0 } = {}) {
    validarDado(dado);
    tabuleiro.validarJogador(jogadorInicial);
    this._dado = dado;
    this._peoes = montarPeoes(pecas);
    this._jogadorAtual = jogadorInicial;
    this._valorPendente = null;
  }

  get jogadorAtual() {
    return this._jogadorAtual;
  }

  get valorPendente() {
    return this._valorPendente;
  }

  get vencedor() {
    return null;
  }

  get terminou() {
    return this.vencedor !== null;
  }

  posicoes(jogador) {
    tabuleiro.validarJogador(jogador);
    return [...this._peoes[jogador]];
  }

  movimentosValidos() {
    if (this._valorPendente === null) {
      return [];
    }
    return this._movimentosPara(this._jogadorAtual, this._valorPendente);
  }

  rolar(jogador) {
    this._validarVez(jogador);
    if (this._valorPendente !== null) {
      throw new Error('o dado já foi rolado: mova um peão antes de rolar de novo');
    }
    const valor = this._dado.rolar();
    const movimentos = this._movimentosPara(jogador, valor);

    if (movimentos.length === 0) {
      this._passarVez();
      return this._resultadoRolagem(valor, 'sem-movimento', movimentos);
    }
    this._valorPendente = valor;
    return this._resultadoRolagem(valor, 'aguardando-movimento', movimentos);
  }

  mover(jogador, peao) {
    this._validarVez(jogador);
    if (this._valorPendente === null) {
      throw new Error('role o dado antes de mover');
    }
    if (!Number.isInteger(peao) || peao < 0 || peao >= tabuleiro.PEOES_POR_JOGADOR) {
      throw new Error(`peão inválido: ${peao} (use 0 a 3)`);
    }
    const destino = this._destino(jogador, peao, this._valorPendente);
    if (destino === null) {
      throw new Error(`movimento inválido para o peão ${peao} com o valor ${this._valorPendente}`);
    }

    const de = this._peoes[jogador][peao];
    this._peoes[jogador][peao] = destino;
    this._valorPendente = null;
    this._passarVez();

    return {
      peao,
      de,
      para: destino,
      capturado: null,
      rolaDeNovo: false,
      jogadorAtual: this._jogadorAtual,
    };
  }

  _validarVez(jogador) {
    tabuleiro.validarJogador(jogador);
    if (jogador !== this._jogadorAtual) {
      throw new Error(`não é a vez do jogador ${jogador}`);
    }
  }

  _passarVez() {
    this._jogadorAtual = 1 - this._jogadorAtual;
  }

  _resultadoRolagem(valor, evento, movimentos) {
    return { valor, evento, movimentos, jogadorAtual: this._jogadorAtual };
  }

  _movimentosPara(jogador, valor) {
    return this._peoes[jogador]
      .map((_, peao) => peao)
      .filter((peao) => this._destino(jogador, peao, valor) !== null);
  }

  // Passos de destino do peão com o valor tirado, ou null se o movimento é inválido.
  _destino(jogador, peao, valor) {
    const atual = this._peoes[jogador][peao];
    if (atual === BASE) {
      return valor === VALOR_SAIDA ? 0 : null;
    }
    return atual + valor;
  }
}

module.exports = { Partida, BASE };
