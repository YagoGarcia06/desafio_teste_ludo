const { Partida, BASE } = require('../src/partida');
const { criarDadoSequencia } = require('../src/dado');
const { casaDoPasso } = require('../src/tabuleiro');

const B = BASE;

function novaPartida(valores, opcoes = {}) {
  return new Partida({ dado: criarDadoSequencia(valores), ...opcoes });
}

describe('Início da partida', () => {
  test('CT-INICIO-01: partida nova tem todos os peões na base e o jogador 0 começa', () => {
    const partida = novaPartida([1]);
    expect(partida.posicoes(0)).toEqual([B, B, B, B]);
    expect(partida.posicoes(1)).toEqual([B, B, B, B]);
    expect(partida.jogadorAtual).toBe(0);
    expect(partida.vencedor).toBeNull();
    expect(partida.terminou).toBe(false);
    expect(partida.valorPendente).toBeNull();
  });

  test('CT-INICIO-02: estado inicial de peões informado é respeitado', () => {
    const partida = novaPartida([1], { pecas: [[0, 10, B, 56], [B, 25, 50, 51]] });
    expect(partida.posicoes(0)).toEqual([0, 10, B, 56]);
    expect(partida.posicoes(1)).toEqual([B, 25, 50, 51]);
  });

  test('CT-INICIO-03: jogadorInicial 1 faz o jogador 1 começar', () => {
    const partida = novaPartida([1], { jogadorInicial: 1 });
    expect(partida.jogadorAtual).toBe(1);
  });

  test('CT-INICIO-04: posicoes devolve uma cópia que não altera a partida', () => {
    const pecas = [[5, B, B, B], [B, B, B, B]];
    const partida = novaPartida([1], { pecas });
    partida.posicoes(0)[0] = 40;
    pecas[0][0] = 30;
    expect(partida.posicoes(0)).toEqual([5, B, B, B]);
  });

  test('CT-INICIO-05: sem rolar o dado não há movimentos válidos', () => {
    const partida = novaPartida([1], { pecas: [[5, B, B, B], [B, B, B, B]] });
    expect(partida.movimentosValidos()).toEqual([]);
  });
});

describe('Saída da base', () => {
  test('CT-SAIDA-01: com 6 o peão do jogador 0 sai para o passo 0 (casa 0)', () => {
    const partida = novaPartida([6]);
    partida.rolar(0);
    partida.mover(0, 2);
    expect(partida.posicoes(0)).toEqual([B, B, 0, B]);
    expect(casaDoPasso(0, 0)).toBe(0);
  });

  test('CT-SAIDA-02: com 6 o peão do jogador 1 sai para o passo 0 (casa 26)', () => {
    const partida = novaPartida([6], { jogadorInicial: 1 });
    partida.rolar(1);
    partida.mover(1, 0);
    expect(partida.posicoes(1)).toEqual([0, B, B, B]);
    expect(casaDoPasso(1, 0)).toBe(26);
  });

  test('CT-SAIDA-03: sem 6 e com todos na base não há movimento e a vez passa', () => {
    const partida = novaPartida([5]);
    const resultado = partida.rolar(0);
    expect(resultado).toEqual({ valor: 5, evento: 'sem-movimento', movimentos: [], jogadorAtual: 1 });
    expect(partida.jogadorAtual).toBe(1);
    expect(partida.valorPendente).toBeNull();
  });

  test('CT-SAIDA-04: valor 1 (menor face) também não tira peão da base', () => {
    const partida = novaPartida([1]);
    expect(partida.rolar(0).evento).toBe('sem-movimento');
    expect(partida.posicoes(0)).toEqual([B, B, B, B]);
  });

  test('CT-SAIDA-05: com 6 todos os peões da base podem sair', () => {
    const partida = novaPartida([6]);
    const resultado = partida.rolar(0);
    expect(resultado.evento).toBe('aguardando-movimento');
    expect(resultado.movimentos).toEqual([0, 1, 2, 3]);
    expect(partida.movimentosValidos()).toEqual([0, 1, 2, 3]);
  });

  test('CT-SAIDA-06: peão da base não sai com 5 mesmo havendo outro peão em jogo', () => {
    const partida = novaPartida([5], { pecas: [[10, B, B, B], [B, B, B, B]] });
    expect(partida.rolar(0).movimentos).toEqual([0]);
    expect(() => partida.mover(0, 1)).toThrow(/movimento inválido/);
  });

  test('CT-SAIDA-07: o 6 usado para sair não anda casas (de base para passo 0)', () => {
    const partida = novaPartida([6]);
    partida.rolar(0);
    const resultado = partida.mover(0, 0);
    expect(resultado.de).toBeNull();
    expect(resultado.para).toBe(0);
  });
});

describe('Movimento no percurso', () => {
  test('CT-MOV-01: o peão anda exatamente o valor do dado', () => {
    const partida = novaPartida([4], { pecas: [[10, B, B, B], [B, B, B, B]] });
    partida.rolar(0);
    partida.mover(0, 0);
    expect(partida.posicoes(0)).toEqual([14, B, B, B]);
  });

  test('CT-MOV-02: depois de mover com valor diferente de 6 a vez passa', () => {
    const partida = novaPartida([3], { pecas: [[10, B, B, B], [B, B, B, B]] });
    partida.rolar(0);
    const resultado = partida.mover(0, 0);
    expect(resultado.rolaDeNovo).toBe(false);
    expect(resultado.jogadorAtual).toBe(1);
    expect(partida.jogadorAtual).toBe(1);
  });

  test('CT-MOV-03: rolar informa só os peões que podem andar', () => {
    const partida = novaPartida([3], { pecas: [[B, 4, B, 20], [B, B, B, B]] });
    const resultado = partida.rolar(0);
    expect(resultado).toEqual({ valor: 3, evento: 'aguardando-movimento', movimentos: [1, 3], jogadorAtual: 0 });
  });

  test('CT-MOV-04: peão do jogador 1 passa da casa 51 para a casa 0 continuando a contar passos', () => {
    const partida = novaPartida([2], { pecas: [[B, B, B, B], [25, B, B, B]], jogadorInicial: 1 });
    partida.rolar(1);
    partida.mover(1, 0);
    expect(partida.posicoes(1)[0]).toBe(27);
    expect(casaDoPasso(1, 27)).toBe(1);
  });

  test('CT-MOV-05: anda com a menor face (1) e com 5', () => {
    const partida = novaPartida([1, 5], { pecas: [[10, B, B, B], [30, B, B, B]] });
    partida.rolar(0);
    partida.mover(0, 0);
    partida.rolar(1);
    partida.mover(1, 0);
    expect(partida.posicoes(0)[0]).toBe(11);
    expect(partida.posicoes(1)[0]).toBe(35);
  });

  test('CT-MOV-06: mover devolve peão, posição de origem e de destino', () => {
    const partida = novaPartida([2], { pecas: [[B, 7, B, B], [B, B, B, B]] });
    partida.rolar(0);
    const resultado = partida.mover(0, 1);
    expect(resultado).toMatchObject({ peao: 1, de: 7, para: 9, capturado: null });
  });

  test('CT-MOV-07: o valor rolado fica pendente até o movimento', () => {
    const partida = novaPartida([2], { pecas: [[3, B, B, B], [B, B, B, B]] });
    partida.rolar(0);
    expect(partida.valorPendente).toBe(2);
    partida.mover(0, 0);
    expect(partida.valorPendente).toBeNull();
  });
});

describe('Erros de uso', () => {
  test('CT-ERRO-01: criar partida sem dado gera erro', () => {
    expect(() => new Partida()).toThrow(/dado inválido/);
    expect(() => new Partida({})).toThrow(/dado inválido/);
  });

  test('CT-ERRO-02: dado sem função rolar gera erro', () => {
    expect(() => new Partida({ dado: { valor: 6 } })).toThrow(/dado inválido/);
  });

  test('CT-ERRO-03: estado inicial sem exatamente 2 jogadores gera erro', () => {
    expect(() => novaPartida([1], { pecas: [[B, B, B, B]] })).toThrow(/2 jogadores/);
    expect(() => novaPartida([1], { pecas: 'base' })).toThrow(/2 jogadores/);
  });

  test('CT-ERRO-04: estado inicial sem exatamente 4 peões por jogador gera erro', () => {
    expect(() => novaPartida([1], { pecas: [[B, B, B], [B, B, B, B]] })).toThrow(/4 peões/);
    expect(() => novaPartida([1], { pecas: [[B, B, B, B], null] })).toThrow(/4 peões/);
  });

  test('CT-ERRO-05: posição inicial fora de 0 a 56 gera erro (-1, 57, 2.5)', () => {
    expect(() => novaPartida([1], { pecas: [[-1, B, B, B], [B, B, B, B]] })).toThrow(/passos inválidos/);
    expect(() => novaPartida([1], { pecas: [[57, B, B, B], [B, B, B, B]] })).toThrow(/passos inválidos/);
    expect(() => novaPartida([1], { pecas: [[B, B, B, B], [B, 2.5, B, B]] })).toThrow(/passos inválidos/);
  });

  test('CT-ERRO-06: jogadorInicial inválido gera erro', () => {
    expect(() => novaPartida([1], { jogadorInicial: 2 })).toThrow(/jogador inválido/);
  });

  test('CT-ERRO-07: rolar duas vezes sem mover gera erro', () => {
    const partida = novaPartida([6, 6]);
    partida.rolar(0);
    expect(() => partida.rolar(0)).toThrow(/dado já foi rolado/);
  });

  test('CT-ERRO-08: mover sem ter rolado gera erro', () => {
    const partida = novaPartida([1], { pecas: [[5, B, B, B], [B, B, B, B]] });
    expect(() => partida.mover(0, 0)).toThrow(/role o dado antes de mover/);
  });

  test('CT-ERRO-09: rolar fora da vez gera erro', () => {
    const partida = novaPartida([6]);
    expect(() => partida.rolar(1)).toThrow(/não é a vez do jogador 1/);
  });

  test('CT-ERRO-10: mover fora da vez gera erro', () => {
    const partida = novaPartida([3], { pecas: [[5, B, B, B], [5, B, B, B]] });
    partida.rolar(0);
    expect(() => partida.mover(1, 0)).toThrow(/não é a vez do jogador 1/);
  });

  test('CT-ERRO-11: índice de peão fora de 0 a 3 gera erro', () => {
    const partida = novaPartida([6]);
    partida.rolar(0);
    expect(() => partida.mover(0, 4)).toThrow(/peão inválido/);
    expect(() => partida.mover(0, -1)).toThrow(/peão inválido/);
  });

  test('CT-ERRO-12: jogador inexistente ao rolar ou consultar posições gera erro', () => {
    const partida = novaPartida([6]);
    expect(() => partida.rolar(2)).toThrow(/jogador inválido/);
    expect(() => partida.posicoes(-1)).toThrow(/jogador inválido/);
  });

  test('CT-ERRO-13: uma ação recusada não altera a partida nem consome o dado', () => {
    const partida = novaPartida([4], { pecas: [[5, B, B, B], [B, B, B, B]] });
    expect(() => partida.rolar(1)).toThrow(/não é a vez/);
    expect(() => partida.mover(0, 0)).toThrow(/role o dado/);
    expect(partida.rolar(0).valor).toBe(4);
    expect(partida.posicoes(0)).toEqual([5, B, B, B]);
  });
});

describe('Regras do 6', () => {
  test('CT-SEIS-01: mover com 6 dá direito a rolar de novo', () => {
    const partida = novaPartida([6], { pecas: [[10, B, B, B], [B, B, B, B]] });
    partida.rolar(0);
    const resultado = partida.mover(0, 0);
    expect(partida.posicoes(0)[0]).toBe(16);
    expect(resultado.rolaDeNovo).toBe(true);
    expect(partida.jogadorAtual).toBe(0);
  });

  test('CT-SEIS-02: sair da base com 6 também dá direito a rolar de novo', () => {
    const partida = novaPartida([6]);
    partida.rolar(0);
    const resultado = partida.mover(0, 0);
    expect(resultado.rolaDeNovo).toBe(true);
    expect(resultado.jogadorAtual).toBe(0);
  });

  test('CT-SEIS-03: depois do 6, um valor diferente de 6 encerra a vez', () => {
    const partida = novaPartida([6, 3], { pecas: [[10, B, B, B], [B, B, B, B]] });
    partida.rolar(0);
    partida.mover(0, 0);
    partida.rolar(0);
    partida.mover(0, 0);
    expect(partida.posicoes(0)[0]).toBe(19);
    expect(partida.jogadorAtual).toBe(1);
  });

  test('CT-SEIS-04: dois 6 seguidos são usados e o jogador ainda rola (limite)', () => {
    const partida = novaPartida([6, 6], { pecas: [[10, B, B, B], [B, B, B, B]] });
    partida.rolar(0);
    partida.mover(0, 0);
    partida.rolar(0);
    const resultado = partida.mover(0, 0);
    expect(partida.posicoes(0)[0]).toBe(22);
    expect(resultado.rolaDeNovo).toBe(true);
    expect(partida.jogadorAtual).toBe(0);
  });

  test('CT-SEIS-05: o terceiro 6 seguido não é usado e a vez passa', () => {
    const partida = novaPartida([6, 6, 6], { pecas: [[10, B, B, B], [B, B, B, B]] });
    partida.rolar(0);
    partida.mover(0, 0);
    partida.rolar(0);
    partida.mover(0, 0);
    const resultado = partida.rolar(0);
    expect(resultado).toEqual({ valor: 6, evento: 'terceiro-seis', movimentos: [], jogadorAtual: 1 });
    expect(partida.posicoes(0)).toEqual([22, B, B, B]);
    expect(partida.valorPendente).toBeNull();
  });

  test('CT-SEIS-06: a contagem de 6 recomeça no turno seguinte', () => {
    const partida = novaPartida([6, 6, 6, 2, 6], { pecas: [[10, B, B, B], [5, B, B, B]] });
    partida.rolar(0);
    partida.mover(0, 0);
    partida.rolar(0);
    partida.mover(0, 0);
    partida.rolar(0);
    partida.rolar(1);
    partida.mover(1, 0);
    const resultado = partida.rolar(0);
    expect(resultado.evento).toBe('aguardando-movimento');
    expect(partida.mover(0, 0)).toMatchObject({ para: 28, rolaDeNovo: true });
  });

  test('CT-SEIS-07: 6 sem movimento válido não passa a vez: o jogador rola de novo', () => {
    const partida = novaPartida([6], { pecas: [[B, B, B, B], [26, 26, B, B]] });
    const resultado = partida.rolar(0);
    expect(resultado).toEqual({ valor: 6, evento: 'sem-movimento', movimentos: [], jogadorAtual: 0 });
    expect(partida.valorPendente).toBeNull();
  });

  test('CT-SEIS-08: depois de um 6 sem movimento, um não-6 sem movimento passa a vez', () => {
    const partida = novaPartida([6, 2], { pecas: [[B, B, B, B], [26, 26, B, B]] });
    partida.rolar(0);
    const resultado = partida.rolar(0);
    expect(resultado.evento).toBe('sem-movimento');
    expect(partida.jogadorAtual).toBe(1);
  });

  test('CT-SEIS-09: 6 sem movimento conta para os três 6 seguidos', () => {
    const partida = novaPartida([6, 6, 6], { pecas: [[B, B, B, B], [26, 26, B, B]] });
    expect(partida.rolar(0).jogadorAtual).toBe(0);
    expect(partida.rolar(0).jogadorAtual).toBe(0);
    const resultado = partida.rolar(0);
    expect(resultado.evento).toBe('terceiro-seis');
    expect(partida.jogadorAtual).toBe(1);
  });

  test('CT-SEIS-10: um valor diferente de 6 no meio do turno zera a contagem', () => {
    // 6 anda, 3 captura (rola de novo), depois mais dois 6 ainda valem
    const partida = novaPartida([6, 3, 6, 6], { pecas: [[10, B, B, B], [45, B, B, B]] });
    partida.rolar(0);
    partida.mover(0, 0);
    partida.rolar(0);
    partida.mover(0, 0);
    partida.rolar(0);
    partida.mover(0, 0);
    const resultado = partida.rolar(0);
    expect(resultado.evento).toBe('aguardando-movimento');
    expect(partida.posicoes(0)[0]).toBe(25);
  });
});

describe('Captura', () => {
  test('CT-CAPTURA-01: cair na casa de um peão adversário sozinho o manda para a base', () => {
    // jogador 1 no passo 40 está na casa 14
    const partida = novaPartida([4], { pecas: [[10, B, B, B], [40, B, B, B]] });
    partida.rolar(0);
    partida.mover(0, 0);
    expect(partida.posicoes(0)[0]).toBe(14);
    expect(partida.posicoes(1)).toEqual([B, B, B, B]);
  });

  test('CT-CAPTURA-02: quem captura rola de novo, mesmo sem ter tirado 6', () => {
    const partida = novaPartida([4], { pecas: [[10, B, B, B], [40, B, B, B]] });
    partida.rolar(0);
    const resultado = partida.mover(0, 0);
    expect(resultado.rolaDeNovo).toBe(true);
    expect(partida.jogadorAtual).toBe(0);
  });

  test('CT-CAPTURA-03: o resultado do movimento informa o peão capturado', () => {
    const partida = novaPartida([4], { pecas: [[10, B, B, B], [B, 5, 40, B]] });
    partida.rolar(0);
    const resultado = partida.mover(0, 0);
    expect(resultado.capturado).toEqual({ jogador: 1, peao: 2 });
    expect(partida.posicoes(1)).toEqual([B, 5, B, B]);
  });

  test('CT-CAPTURA-04: o jogador 1 também captura (casa 28 → casa 30)', () => {
    const partida = novaPartida([2], { pecas: [[30, B, B, B], [2, B, B, B]], jogadorInicial: 1 });
    partida.rolar(1);
    const resultado = partida.mover(1, 0);
    expect(resultado.capturado).toEqual({ jogador: 0, peao: 0 });
    expect(partida.posicoes(0)).toEqual([B, B, B, B]);
    expect(partida.jogadorAtual).toBe(1);
  });

  test('CT-CAPTURA-05: passar por cima de um adversário sozinho não captura', () => {
    // jogador 1 no passo 38 está na casa 12
    const partida = novaPartida([4], { pecas: [[10, B, B, B], [38, B, B, B]] });
    partida.rolar(0);
    const resultado = partida.mover(0, 0);
    expect(resultado.capturado).toBeNull();
    expect(resultado.rolaDeNovo).toBe(false);
    expect(partida.posicoes(1)).toEqual([38, B, B, B]);
  });

  test('CT-CAPTURA-06: cair na casa de um peão próprio não captura nada', () => {
    const partida = novaPartida([4], { pecas: [[10, 14, B, B], [B, B, B, B]] });
    partida.rolar(0);
    const resultado = partida.mover(0, 0);
    expect(resultado.capturado).toBeNull();
    expect(partida.posicoes(0)).toEqual([14, 14, B, B]);
    expect(partida.jogadorAtual).toBe(1);
  });

  test('CT-CAPTURA-07: o peão capturado fica na base e só volta com 6', () => {
    const partida = novaPartida([4, 2, 5], { pecas: [[10, B, B, B], [40, B, B, B]] });
    partida.rolar(0);
    partida.mover(0, 0);
    partida.rolar(0);
    partida.mover(0, 0);
    const resultado = partida.rolar(1);
    expect(resultado.evento).toBe('sem-movimento');
    expect(partida.jogadorAtual).toBe(0);
  });

  test('CT-CAPTURA-08: capturar com 6 dá direito a só uma rolagem extra', () => {
    const partida = novaPartida([6, 2], { pecas: [[8, B, B, B], [40, B, B, B]] });
    partida.rolar(0);
    expect(partida.mover(0, 0)).toMatchObject({ capturado: { jogador: 1, peao: 0 }, rolaDeNovo: true });
    partida.rolar(0);
    partida.mover(0, 0);
    expect(partida.posicoes(0)[0]).toBe(16);
    expect(partida.jogadorAtual).toBe(1);
  });
});

describe('Casas seguras', () => {
  test('CT-SEGURA-01: nas estrelas 8, 21, 34 e 47 os peões convivem sem captura', () => {
    // passos do jogador 1 que caem em cada estrela
    const estrelas = [[8, 34], [21, 47], [34, 8], [47, 21]];
    estrelas.forEach(([casa, passosAdversario]) => {
      const partida = novaPartida([3], { pecas: [[casa - 3, B, B, B], [passosAdversario, B, B, B]] });
      partida.rolar(0);
      const resultado = partida.mover(0, 0);
      expect(resultado.capturado).toBeNull();
      expect(resultado.rolaDeNovo).toBe(false);
      expect(casaDoPasso(0, partida.posicoes(0)[0])).toBe(casa);
      expect(casaDoPasso(1, partida.posicoes(1)[0])).toBe(casa);
    });
  });

  test('CT-SEGURA-02: nas saídas 13, 26 e 39 os peões convivem sem captura', () => {
    const saidas = [[13, 39], [26, 0], [39, 13]];
    saidas.forEach(([casa, passosAdversario]) => {
      const partida = novaPartida([3], { pecas: [[casa - 3, B, B, B], [passosAdversario, B, B, B]] });
      partida.rolar(0);
      expect(partida.mover(0, 0).capturado).toBeNull();
      expect(partida.posicoes(1)).toEqual([passosAdversario, B, B, B]);
    });
  });

  test('CT-SEGURA-03: na saída 0 o jogador 1 não captura o peão do jogador 0', () => {
    // passo 26 do jogador 1 é a casa 0
    const partida = novaPartida([3], { pecas: [[0, B, B, B], [23, B, B, B]], jogadorInicial: 1 });
    partida.rolar(1);
    expect(partida.mover(1, 0).capturado).toBeNull();
    expect(partida.posicoes(0)).toEqual([0, B, B, B]);
    expect(partida.posicoes(1)[0]).toBe(26);
  });

  test('CT-SEGURA-04: sair da base na saída ocupada por um adversário não captura', () => {
    const partida = novaPartida([6], { pecas: [[B, B, B, B], [26, B, B, B]] });
    partida.rolar(0);
    const resultado = partida.mover(0, 0);
    expect(resultado.capturado).toBeNull();
    expect(partida.posicoes(1)).toEqual([26, B, B, B]);
  });

  test('CT-SEGURA-05: as casas vizinhas das seguras (7 e 9) capturam normalmente', () => {
    // passo 33 do jogador 1 = casa 7; passo 35 = casa 9
    [[4, 33], [6, 35]].forEach(([passos, passosAdversario]) => {
      const partida = novaPartida([3], { pecas: [[passos, B, B, B], [passosAdversario, B, B, B]] });
      partida.rolar(0);
      expect(partida.mover(0, 0).capturado).toEqual({ jogador: 1, peao: 0 });
    });
  });
});

describe('Bloqueio', () => {
  test('CT-BLOQUEIO-01: o adversário não pode parar na casa do bloqueio', () => {
    // dois peões do jogador 1 no passo 40 = casa 14
    const partida = novaPartida([4], { pecas: [[10, 20, B, B], [40, 40, B, B]] });
    expect(partida.rolar(0).movimentos).toEqual([1]);
    expect(() => partida.mover(0, 0)).toThrow(/movimento inválido/);
  });

  test('CT-BLOQUEIO-02: o adversário não pode passar pela casa do bloqueio', () => {
    // dois peões do jogador 1 no passo 38 = casa 12
    const partida = novaPartida([4], { pecas: [[10, 20, B, B], [38, 38, B, B]] });
    expect(partida.rolar(0).movimentos).toEqual([1]);
    expect(() => partida.mover(0, 0)).toThrow(/movimento inválido/);
  });

  test('CT-BLOQUEIO-03: o adversário pode parar na casa imediatamente antes do bloqueio', () => {
    const partida = novaPartida([4], { pecas: [[10, B, B, B], [41, 41, B, B]] });
    partida.rolar(0);
    partida.mover(0, 0);
    expect(partida.posicoes(0)[0]).toBe(14);
  });

  test('CT-BLOQUEIO-04: bloqueio na casa seguinte barra todos os valores de 1 a 6', () => {
    [1, 2, 3, 4, 5, 6].forEach((valor) => {
      const partida = novaPartida([valor], { pecas: [[13, 30, B, B], [40, 40, B, B]] });
      expect(partida.rolar(0).movimentos).not.toContain(0);
    });
  });

  test('CT-BLOQUEIO-05: bloqueio em casa segura também barra parar e passar', () => {
    // dois peões do jogador 1 no passo 47 = estrela 21
    [3, 5].forEach((valor) => {
      const partida = novaPartida([valor], { pecas: [[18, 30, B, B], [47, 47, B, B]] });
      expect(partida.rolar(0).movimentos).toEqual([1]);
    });
  });

  test('CT-BLOQUEIO-06: bloqueio na saída do adversário impede que ele saia da base', () => {
    // dois peões do jogador 1 no passo 26 = casa 0 (saída do jogador 0)
    const partida = novaPartida([6], { pecas: [[B, B, B, 30], [26, 26, B, B]] });
    expect(partida.rolar(0).movimentos).toEqual([3]);
  });

  test('CT-BLOQUEIO-07: o próprio jogador pode passar pelo seu bloqueio e parar nele', () => {
    const passando = novaPartida([6], { pecas: [[10, 14, 14, B], [B, B, B, B]] });
    expect(passando.rolar(0).movimentos).toEqual([0, 1, 2, 3]);
    expect(passando.mover(0, 0).para).toBe(16);

    const parando = novaPartida([4], { pecas: [[10, 14, 14, B], [B, B, B, B]] });
    parando.rolar(0);
    parando.mover(0, 0);
    expect(parando.posicoes(0)).toEqual([14, 14, 14, B]);
  });

  test('CT-BLOQUEIO-08: três peões na mesma casa também formam bloqueio', () => {
    const partida = novaPartida([4], { pecas: [[10, 20, B, B], [40, 40, 40, B]] });
    expect(partida.rolar(0).movimentos).toEqual([1]);
  });

  test('CT-BLOQUEIO-09: quando um peão sai do bloqueio, o que fica pode ser capturado', () => {
    const partida = novaPartida([2, 4], { pecas: [[10, B, B, B], [40, 40, B, B]], jogadorInicial: 1 });
    partida.rolar(1);
    partida.mover(1, 0);
    expect(partida.rolar(0).movimentos).toEqual([0]);
    expect(partida.mover(0, 0).capturado).toEqual({ jogador: 1, peao: 1 });
  });

  test('CT-BLOQUEIO-10: bloqueio não é capturado e, sem outro movimento, a vez passa', () => {
    const partida = novaPartida([4], { pecas: [[10, B, B, B], [40, 40, B, B]] });
    const resultado = partida.rolar(0);
    expect(resultado.evento).toBe('sem-movimento');
    expect(partida.jogadorAtual).toBe(1);
    expect(partida.posicoes(1)).toEqual([40, 40, B, B]);
  });
});
