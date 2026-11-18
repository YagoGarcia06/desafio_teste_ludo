# Desafio: Teste de Ludo

**Aluno:** Yago Garcia do Canto — **RA:** 24011308-2 — Disciplina: Projeto, Implementação e Teste de Software (2026)

## Especificação do desafio

Enunciado do professor:

- casos de teste para testar uma partida para 02 jogadores;
- casos de teste em Javascript para testar Javascript;

O projeto implementa somente a lógica do jogo (sem interface) e uma suíte de testes em Jest que joga e verifica partidas de Ludo para 2 jogadores.

### Regras adotadas

O enunciado não define as regras do jogo, então foi adotado o Ludo clássico com as decisões abaixo.

**Tabuleiro e peões**

1. Dois jogadores (0 e 1), cada um com 4 peões que começam na **base**.
2. Percurso comum de **52 casas** (0 a 51). O jogador 0 sai na casa 0; o jogador 1 sai na casa 26 (lado oposto).
3. Cada jogador tem uma **reta final** própria de 6 posições (5 casas + chegada).
4. A posição do peão é contada em **passos** desde a saída: 0 a 50 no percurso (casa = `(saida + passos) % 52`), 51 a 55 na reta final e 56 na chegada. Na base o peão tem posição `null`.

**Dado e turno**

5. Dado de 1 a 6, injetável: sequência fixa nos testes ou `rng` com semente.
6. O turno é: rolar o dado e mover um peão com o valor tirado.
7. Tirar **6** dá direito a rolar de novo. **Três 6 seguidos** no mesmo turno: o terceiro não é usado e a vez passa.
8. Se não houver movimento válido com o valor tirado, a vez passa automaticamente (no 6, o jogador ainda rola de novo, salvo o terceiro 6).
9. Rolar duas vezes sem mover, mover sem ter rolado ou agir fora da vez gera erro.

**Movimento**

10. Só sai da base com **6**: o peão vai para a casa de saída (passo 0). O 6 usado para sair não anda mais casas.
11. No percurso, o peão anda exatamente o valor do dado.
12. Para chegar, o valor precisa ser **exato**: se passar da chegada, o movimento é inválido.
13. Chegar com um peão dá direito a rolar de novo.

**Captura e proteção**

14. Cair exatamente na casa de um peão adversário **sozinho**, fora de casa segura, **captura**: ele volta para a base e quem capturou rola de novo.
15. Casas seguras: saídas 0, 13, 26 e 39 e estrelas 8, 21, 34 e 47. Nelas, peões dos dois jogadores convivem sem captura.
16. Dois ou mais peões do mesmo jogador na mesma casa formam um **bloqueio**: não podem ser capturados e o adversário não pode parar nem passar por essa casa.
17. Peões na reta final não podem ser capturados.

**Vitória**

18. Vence quem levar os 4 peões à chegada. Depois disso, rolar ou mover gera erro.

**Apoio aos testes**

19. A partida pode ser criada com um estado inicial de peões (posição de cada peão em passos, ou base), para testar cenários sem simular dezenas de jogadas. Pelo menos um teste joga uma partida inteira só com rolar e mover.

**Interpretações onde o texto deixava margem**

- O jogador 0 começa a partida; para montar cenários, a partida aceita `jogadorInicial` (0 ou 1).
- A contagem de "6 seguidos" vale dentro do mesmo turno e zera quando sai qualquer valor diferente de 6 ou quando a vez passa. Um bônus por captura ou chegada não zera a contagem, só um valor diferente de 6.
- Quando um movimento dá mais de um direito a rolar de novo (por exemplo, um 6 que também captura), o jogador rola **uma** vez a mais.
- O bloqueio vale em qualquer casa do percurso, inclusive casas seguras e a saída: um bloqueio na saída do adversário impede que ele saia da base. O próprio dono do bloqueio pode parar nele e passar por ele.
- Só existem bloqueios no percurso comum: a reta final e a chegada são exclusivas de cada jogador e não interagem com o adversário.
- Como um peão adversário sozinho é o único que pode ser capturado, uma casa com dois ou mais peões adversários nunca é alcançada (é bloqueio).
- O estado inicial é validado apenas no formato (2 jogadores, 4 peões cada, `null` ou inteiro de 0 a 56); a coerência do cenário fica a cargo de quem monta o teste. Se o estado inicial já tiver os 4 peões de um jogador na chegada, a partida já começa terminada com esse vencedor.
- `rolar(jogador)` e `mover(jogador, peao)` recebem o jogador que está agindo, para que agir fora da vez possa ser detectado.

## Como executar

Requisitos: Node 18 ou superior.

```bash
npm ci            # instala o Jest a partir do package-lock.json
npm test          # roda toda a suíte de testes
npm run coverage  # roda os testes e gera o relatório de cobertura em coverage/
```

## Como funcionam os casos de teste

- **Ferramenta:** Jest, com um arquivo de teste por módulo em `tests/<modulo>.test.js`.
- **Identificação:** cada teste começa com um ID no formato `CT-<GRUPO>-NN`, numerado sem buracos dentro do grupo. Cada grupo corresponde a um bloco `describe` e a um conjunto de regras: `CT-RNG` (gerador), `CT-DADO` (regra 5), `CT-TAB` (regras 2 a 4 e 15), `CT-INICIO` (regras 1 e 19), `CT-SAIDA` (regra 10), `CT-MOV` (regras 6 e 11), `CT-ERRO` (regra 9 e validações), `CT-SEIS` (regras 7 e 8), `CT-CAPTURA` (regra 14), `CT-SEGURA` (regra 15), `CT-BLOQUEIO` (regra 16), `CT-RETA` (regras 12, 13 e 17), `CT-VITORIA` (regra 18) e `CT-INTEGRACAO` (partidas completas).
- **Normal, limite e erro:** para cada regra há o caso normal, o caso limite (menor e maior face do dado, último passo do percurso, passo 55 antes da chegada, segundo e terceiro 6, casa logo antes do bloqueio, casas vizinhas das seguras, 3 contra 4 peões na chegada) e o caso de erro (`toThrow` com um trecho da mensagem).
- **Aleatoriedade controlada:** a partida recebe o dado por injeção. Quase todos os testes usam `criarDadoSequencia([...])`, que devolve exatamente os valores informados; os testes com `criarDadoAleatorio(criarRng(semente))` usam semente fixa e, por isso, são reproduzíveis.
- **Cenários montados:** com a opção `pecas` (regra 19), cada teste monta só a situação que precisa, por exemplo um peão no passo 50 ou dois peões adversários formando bloqueio. Os testes são independentes: cada um cria a própria partida.
- **Partida inteira:** `CT-INTEGRACAO-01` joga uma partida completa só com `rolar` e `mover`, do início à vitória, com um dado de sequência fixa de 96 valores. `CT-INTEGRACAO-03` e `CT-INTEGRACAO-04` jogam partidas completas com dado de semente fixa.

### Resumo por grupo

| Grupo | Arquivo | Testes | O que cobre |
|---|---|---:|---|
| `CT-RNG` | `rng.test.js` | 5 | Gerador com semente: repetição, intervalo e semente inválida |
| `CT-DADO` | `dado.test.js` | 10 | Dado com sequência fixa e com rng, valores de 1 a 6 |
| `CT-TAB` | `tabuleiro.test.js` | 10 | Casas de saída, conversão de passos em casa e casas seguras |
| `CT-INICIO` | `partida.test.js` | 5 | Estado inicial e cenários montados com a opção `pecas` |
| `CT-SAIDA` | `partida.test.js` | 7 | Sair da base só com 6 e escolha do peão |
| `CT-MOV` | `partida.test.js` | 7 | Movimento no percurso e volta da casa 51 para a 0 |
| `CT-ERRO` | `partida.test.js` | 13 | Fora da vez, rolar duas vezes, mover sem rolar e peão inválido |
| `CT-SEIS` | `partida.test.js` | 11 | Jogar de novo com 6, três 6 seguidos e 6 sem movimento |
| `CT-CAPTURA` | `partida.test.js` | 9 | Captura, volta para a base e rolagem extra |
| `CT-SEGURA` | `partida.test.js` | 5 | Casas seguras sem captura |
| `CT-BLOQUEIO` | `partida.test.js` | 11 | Bloqueio impede o adversário de parar e de passar |
| `CT-RETA` | `partida.test.js` | 10 | Reta final, chegada com valor exato e rolagem extra ao chegar |
| `CT-VITORIA` | `partida.test.js` | 7 | Vitória com os 4 peões e ações bloqueadas após o fim |
| `CT-INTEGRACAO` | `partida.test.js` | 4 | Partidas completas só com rolar e mover |
| **Total** | | **114** | |

📄 A lista completa, com cada caso de teste e o resultado esperado, está em [CASOS_DE_TESTE.md](CASOS_DE_TESTE.md).

## Cobertura

Resultado de `npm run coverage`:

| Arquivo | % Statements | % Branches | % Functions | % Lines |
|---------|--------------|------------|-------------|---------|
| Todos os arquivos | 100 | 100 | 100 | 100 |
| `src/dado.js` | 100 | 100 | 100 | 100 |
| `src/partida.js` | 100 | 100 | 100 | 100 |
| `src/rng.js` | 100 | 100 | 100 | 100 |
| `src/tabuleiro.js` | 100 | 100 | 100 | 100 |

## Estrutura do projeto

```
desafio_teste_ludo/
├── src/
│   ├── rng.js              ← gerador pseudoaleatório com semente (mulberry32)
│   ├── dado.js             ← dado de sequência fixa e dado com rng
│   ├── tabuleiro.js        ← constantes, conversão de passos em casa e casas seguras
│   └── partida.js          ← turno, saída, movimento, 6, captura, bloqueio, reta final e vitória
├── tests/
│   ├── rng.test.js         ← casos CT-RNG
│   ├── dado.test.js        ← casos CT-DADO
│   ├── tabuleiro.test.js   ← casos CT-TAB
│   └── partida.test.js     ← casos CT-INICIO a CT-INTEGRACAO
├── package.json            ← scripts test e coverage e configuração do Jest
├── package-lock.json       ← versões travadas das dependências
├── .gitignore              ← ignora node_modules/ e coverage/
├── CASOS_DE_TESTE.md  ← lista completa dos casos de teste
└── README.md               ← este documento
```

## Colaborador(es)

- Yago Garcia do Canto (trabalho individual)
