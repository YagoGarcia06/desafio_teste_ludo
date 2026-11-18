const tabuleiro = require('../src/tabuleiro');

const { casaDoPasso, ehCasaSegura } = tabuleiro;

describe('Constantes do tabuleiro', () => {
  test('CT-TAB-01: 2 jogadores, 4 peões, 52 casas, chegada no passo 56 e saídas 0 e 26', () => {
    expect(tabuleiro.NUM_JOGADORES).toBe(2);
    expect(tabuleiro.PEOES_POR_JOGADOR).toBe(4);
    expect(tabuleiro.TAMANHO_PERCURSO).toBe(52);
    expect(tabuleiro.ULTIMO_PASSO_PERCURSO).toBe(50);
    expect(tabuleiro.PASSO_CHEGADA).toBe(56);
    expect(tabuleiro.SAIDAS).toEqual([0, 26]);
  });
});

describe('Conversão de passos em casa', () => {
  test('CT-TAB-02: jogador 0 tem casa igual aos passos (0 → 0, 10 → 10)', () => {
    expect(casaDoPasso(0, 0)).toBe(0);
    expect(casaDoPasso(0, 10)).toBe(10);
  });

  test('CT-TAB-03: jogador 1 sai na casa 26 e dá a volta pela casa 51 até a 0', () => {
    expect(casaDoPasso(1, 0)).toBe(26);
    expect(casaDoPasso(1, 25)).toBe(51);
    expect(casaDoPasso(1, 26)).toBe(0);
  });

  test('CT-TAB-04: último passo do percurso (50) cai duas casas antes da saída', () => {
    expect(casaDoPasso(0, 50)).toBe(50);
    expect(casaDoPasso(1, 50)).toBe(24);
  });

  test('CT-TAB-05: reta final (51 a 55) e chegada (56) não têm casa no percurso', () => {
    [51, 52, 53, 54, 55, 56].forEach((passos) => {
      expect(casaDoPasso(0, passos)).toBeNull();
      expect(casaDoPasso(1, passos)).toBeNull();
    });
  });

  test('CT-TAB-06: jogador inválido gera erro (2, -1, texto)', () => {
    expect(() => casaDoPasso(2, 0)).toThrow(/jogador inválido/);
    expect(() => casaDoPasso(-1, 0)).toThrow(/jogador inválido/);
    expect(() => casaDoPasso('0', 0)).toThrow(/jogador inválido/);
  });

  test('CT-TAB-07: passos inválidos geram erro (-1, 57, 1.5)', () => {
    expect(() => casaDoPasso(0, -1)).toThrow(/passos inválidos/);
    expect(() => casaDoPasso(0, 57)).toThrow(/passos inválidos/);
    expect(() => casaDoPasso(0, 1.5)).toThrow(/passos inválidos/);
  });
});

describe('Casas seguras', () => {
  test('CT-TAB-08: saídas 0, 13, 26, 39 e estrelas 8, 21, 34, 47 são seguras', () => {
    [0, 13, 26, 39, 8, 21, 34, 47].forEach((casa) => {
      expect(ehCasaSegura(casa)).toBe(true);
    });
  });

  test('CT-TAB-09: casas comuns e vizinhas das seguras não são seguras (1, 7, 9, 51)', () => {
    [1, 7, 9, 51].forEach((casa) => {
      expect(ehCasaSegura(casa)).toBe(false);
    });
  });

  test('CT-TAB-10: casa fora do percurso gera erro (-1, 52, 2.5)', () => {
    expect(() => ehCasaSegura(-1)).toThrow(/casa inválida/);
    expect(() => ehCasaSegura(52)).toThrow(/casa inválida/);
    expect(() => ehCasaSegura(2.5)).toThrow(/casa inválida/);
  });
});
