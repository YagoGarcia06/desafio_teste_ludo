const { criarDadoSequencia, criarDadoAleatorio } = require('../src/dado');
const { criarRng } = require('../src/rng');

function rolarVarias(dado, quantidade) {
  return Array.from({ length: quantidade }, () => dado.rolar());
}

describe('Dado com sequência fixa', () => {
  test('CT-DADO-01: devolve os valores na ordem informada', () => {
    const dado = criarDadoSequencia([3, 1, 4]);
    expect(rolarVarias(dado, 3)).toEqual([3, 1, 4]);
  });

  test('CT-DADO-02: aceita as faces limite 1 e 6', () => {
    const dado = criarDadoSequencia([1, 6]);
    expect(rolarVarias(dado, 2)).toEqual([1, 6]);
  });

  test('CT-DADO-03: rolar depois de esgotar a sequência gera erro', () => {
    const dado = criarDadoSequencia([2]);
    expect(dado.rolar()).toBe(2);
    expect(() => dado.rolar()).toThrow(/sequência do dado esgotada/);
  });

  test('CT-DADO-04: sequência vazia ou que não é lista gera erro', () => {
    expect(() => criarDadoSequencia([])).toThrow(/sequência do dado inválida/);
    expect(() => criarDadoSequencia()).toThrow(/sequência do dado inválida/);
    expect(() => criarDadoSequencia(5)).toThrow(/sequência do dado inválida/);
  });

  test('CT-DADO-05: valor fora de 1 a 6 gera erro (0, 7, 2.5, texto)', () => {
    expect(() => criarDadoSequencia([0])).toThrow(/valor do dado inválido/);
    expect(() => criarDadoSequencia([7])).toThrow(/valor do dado inválido/);
    expect(() => criarDadoSequencia([2.5])).toThrow(/valor do dado inválido/);
    expect(() => criarDadoSequencia(['6'])).toThrow(/valor do dado inválido/);
  });

  test('CT-DADO-06: alterar a lista original não muda o dado já criado', () => {
    const valores = [5, 5];
    const dado = criarDadoSequencia(valores);
    valores[0] = 1;
    expect(dado.rolar()).toBe(5);
  });
});

describe('Dado com rng', () => {
  test('CT-DADO-07: só gera inteiros de 1 a 6 e todas as faces aparecem', () => {
    const valores = rolarVarias(criarDadoAleatorio(criarRng(7)), 1000);
    expect(valores.every((v) => Number.isInteger(v) && v >= 1 && v <= 6)).toBe(true);
    expect(new Set(valores)).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  test('CT-DADO-08: rng nos extremos do intervalo gera 1 e 6', () => {
    expect(criarDadoAleatorio(() => 0).rolar()).toBe(1);
    expect(criarDadoAleatorio(() => 0.9999999).rolar()).toBe(6);
  });

  test('CT-DADO-09: mesma semente gera as mesmas rolagens', () => {
    const a = rolarVarias(criarDadoAleatorio(criarRng(99)), 30);
    const b = rolarVarias(criarDadoAleatorio(criarRng(99)), 30);
    expect(a).toEqual(b);
  });

  test('CT-DADO-10: rng que não é função gera erro', () => {
    expect(() => criarDadoAleatorio()).toThrow(/rng inválido/);
    expect(() => criarDadoAleatorio(0.5)).toThrow(/rng inválido/);
  });
});
