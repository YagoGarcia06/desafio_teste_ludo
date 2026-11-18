const tabuleiro = require('./tabuleiro');

const BASE = null;
const VALOR_SAIDA = 6;
const SEIS = 6;
const LIMITE_SEIS_SEGUIDOS = 3;

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
    this._seisSeguidos = 0;
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
    this._seisSeguidos = valor === SEIS ? this._seisSeguidos + 1 : 0;

    if (this._seisSeguidos === LIMITE_SEIS_SEGUIDOS) {
      this._passarVez();
      return this._resultadoRolagem(valor, 'terceiro-seis', []);
    }

    const movimentos = this._movimentosPara(jogador, valor);
    if (movimentos.length === 0) {
      if (valor !== SEIS) {
        this._passarVez();
      }
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
    const valor = this._valorPendente;
    const destino = this._destino(jogador, peao, valor);
    if (destino === null) {
      throw new Error(`movimento inválido para o peão ${peao} com o valor ${valor}`);
    }

    const de = this._peoes[jogador][peao];
    this._peoes[jogador][peao] = destino;
    this._valorPendente = null;
    const capturado = this._capturar(jogador, destino);
    const rolaDeNovo = valor === SEIS || capturado !== null;
    if (!rolaDeNovo) {
      this._passarVez();
    }

    return {
      peao,
      de,
      para: destino,
      capturado,
      rolaDeNovo,
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
    this._seisSeguidos = 0;
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
      return valor === VALOR_SAIDA && !this._temBloqueioAdversario(jogador, 0) ? 0 : null;
    }
    const destino = atual + valor;
    for (let passos = atual + 1; passos <= destino; passos += 1) {
      if (this._temBloqueioAdversario(jogador, passos)) {
        return null;
      }
    }
    return destino;
  }

  // Índices dos peões do adversário que estão na mesma casa do percurso que o passo informado.
  _adversariosNaCasa(jogador, passos) {
    const casa = tabuleiro.casaDoPasso(jogador, passos);
    if (casa === null) {
      return [];
    }
    const adversario = 1 - jogador;
    return this._peoes[adversario]
      .map((posicao, peao) => ({ posicao, peao }))
      .filter(({ posicao }) => posicao !== BASE && tabuleiro.casaDoPasso(adversario, posicao) === casa)
      .map(({ peao }) => peao);
  }

  _temBloqueioAdversario(jogador, passos) {
    return this._adversariosNaCasa(jogador, passos).length >= 2;
  }

  _capturar(jogador, passos) {
    const casa = tabuleiro.casaDoPasso(jogador, passos);
    if (casa === null || tabuleiro.ehCasaSegura(casa)) {
      return null;
    }
    const alvos = this._adversariosNaCasa(jogador, passos);
    if (alvos.length !== 1) {
      return null;
    }
    const adversario = 1 - jogador;
    this._peoes[adversario][alvos[0]] = BASE;
    return { jogador: adversario, peao: alvos[0] };
  }
}

module.exports = { Partida, BASE };
