const tabuleiro = require('./tabuleiro');

const BASE = null;
const VALOR_SAIDA = 6;
const PASSO_SAIDA = 0;
const SEIS = 6;
const LIMITE_SEIS_SEGUIDOS = 3;

function validarDado(dado) {
  if (!dado || typeof dado.rolar !== 'function') {
    throw new Error('dado inválido: informe um objeto com a função rolar()');
  }
}

function adversarioDe(jogador) {
  return 1 - jogador;
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
    this._vencedor = this._calcularVencedor();
  }

  get jogadorAtual() {
    return this._jogadorAtual;
  }

  get valorPendente() {
    return this._valorPendente;
  }

  get vencedor() {
    return this._vencedor;
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
    const chegou = destino === tabuleiro.PASSO_CHEGADA;
    this._vencedor = this._calcularVencedor();
    const rolaDeNovo = !this.terminou && (valor === SEIS || capturado !== null || chegou);
    if (!rolaDeNovo && !this.terminou) {
      this._passarVez();
    }

    return {
      peao,
      de,
      para: destino,
      capturado,
      chegou,
      rolaDeNovo,
      vencedor: this._vencedor,
      jogadorAtual: this._jogadorAtual,
    };
  }

  _validarVez(jogador) {
    if (this.terminou) {
      throw new Error(`a partida terminou: o jogador ${this._vencedor} venceu`);
    }
    tabuleiro.validarJogador(jogador);
    if (jogador !== this._jogadorAtual) {
      throw new Error(`não é a vez do jogador ${jogador}`);
    }
  }

  _passarVez() {
    this._jogadorAtual = adversarioDe(this._jogadorAtual);
    this._seisSeguidos = 0;
  }

  _calcularVencedor() {
    const indice = this._peoes.findIndex((lista) => lista.every((passos) => passos === tabuleiro.PASSO_CHEGADA));
    return indice === -1 ? null : indice;
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
      if (valor !== VALOR_SAIDA) {
        return null;
      }
      return this._temBloqueioAdversario(jogador, PASSO_SAIDA) ? null : PASSO_SAIDA;
    }
    const destino = atual + valor;
    if (destino > tabuleiro.PASSO_CHEGADA) {
      return null;
    }
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
    const adversario = adversarioDe(jogador);
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
    const adversario = adversarioDe(jogador);
    this._peoes[adversario][alvos[0]] = BASE;
    return { jogador: adversario, peao: alvos[0] };
  }
}

module.exports = { Partida, BASE };
