const { criarRng } = require('../src/rng');

function gerar(rng, quantidade) {
  return Array.from({ length: quantidade }, () => rng());
}

describe('Gerador com semente (rng)', () => {
  test('CT-RNG-01: mesma semente gera a mesma sequência', () => {
    expect(gerar(criarRng(42), 20)).toEqual(gerar(criarRng(42), 20));
  });

  test('CT-RNG-02: sementes diferentes geram sequências diferentes', () => {
    expect(gerar(criarRng(1), 10)).not.toEqual(gerar(criarRng(2), 10));
  });

  test('CT-RNG-03: todos os valores ficam no intervalo [0, 1)', () => {
    const valores = gerar(criarRng(2026), 1000);
    expect(valores.every((v) => v >= 0 && v < 1)).toBe(true);
  });

  test('CT-RNG-04: aceita semente 0 e semente negativa (limites)', () => {
    const zero = gerar(criarRng(0), 5);
    const negativa = gerar(criarRng(-7), 5);
    expect(zero.every((v) => v >= 0 && v < 1)).toBe(true);
    expect(negativa.every((v) => v >= 0 && v < 1)).toBe(true);
  });

  test('CT-RNG-05: semente que não é inteiro gera erro', () => {
    expect(() => criarRng(1.5)).toThrow(/semente inválida/);
    expect(() => criarRng('7')).toThrow(/semente inválida/);
    expect(() => criarRng()).toThrow(/semente inválida/);
  });
});
