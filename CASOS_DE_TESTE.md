# Casos de teste — Ludo

Lista completa dos 114 casos de teste, organizada por arquivo de teste. A explicação de como os testes funcionam e o resumo por grupo estão no [README](README.md#como-funcionam-os-casos-de-teste).

### `tests/rng.test.js` — gerador com semente

| ID | O que testa | Resultado esperado |
|----|-------------|--------------------|
| CT-RNG-01 | Mesma semente gera a mesma sequência | As duas sequências de 20 valores são idênticas |
| CT-RNG-02 | Sementes diferentes geram sequências diferentes | As sequências das sementes 1 e 2 são diferentes |
| CT-RNG-03 | Todos os valores ficam no intervalo [0, 1) | Os 1000 valores são >= 0 e < 1 |
| CT-RNG-04 | Aceita semente 0 e semente negativa (limites) | Gera valores em [0, 1) sem erro |
| CT-RNG-05 | Semente que não é inteiro gera erro | Erro "semente inválida" |

### `tests/dado.test.js` — dado

| ID | O que testa | Resultado esperado |
|----|-------------|--------------------|
| CT-DADO-01 | Devolve os valores na ordem informada | Rola 3, 1 e 4 nessa ordem |
| CT-DADO-02 | Aceita as faces limite 1 e 6 | Rola 1 e depois 6 |
| CT-DADO-03 | Rolar depois de esgotar a sequência gera erro | Primeira rolagem 2; a segunda gera erro "sequência do dado esgotada" |
| CT-DADO-04 | Sequência vazia ou que não é lista gera erro | Erro "sequência do dado inválida" |
| CT-DADO-05 | Valor fora de 1 a 6 gera erro (0, 7, 2.5, texto) | Erro "valor do dado inválido" |
| CT-DADO-06 | Alterar a lista original não muda o dado já criado | O dado continua rolando 5 |
| CT-DADO-07 | Só gera inteiros de 1 a 6 e todas as faces aparecem | 1000 rolagens inteiras entre 1 e 6, com as 6 faces presentes |
| CT-DADO-08 | Rng nos extremos do intervalo gera 1 e 6 | rng 0 gera 1; rng 0.9999999 gera 6 |
| CT-DADO-09 | Mesma semente gera as mesmas rolagens | As duas listas de 30 rolagens são iguais |
| CT-DADO-10 | Rng que não é função gera erro | Erro "rng inválido" |

### `tests/tabuleiro.test.js` — tabuleiro

| ID | O que testa | Resultado esperado |
|----|-------------|--------------------|
| CT-TAB-01 | 2 jogadores, 4 peões, 52 casas, chegada no passo 56 e saídas 0 e 26 | Valores 2, 4, 52, 50, 56 e saídas [0, 26] |
| CT-TAB-02 | Jogador 0 tem casa igual aos passos (0 → 0, 10 → 10) | Casas 0 e 10 |
| CT-TAB-03 | Jogador 1 sai na casa 26 e dá a volta pela casa 51 até a 0 | Casas 26, 51 e 0 |
| CT-TAB-04 | Último passo do percurso (50) cai duas casas antes da saída | Jogador 0 na casa 50; jogador 1 na casa 24 |
| CT-TAB-05 | Reta final (51 a 55) e chegada (56) não têm casa no percurso | `null` para os dois jogadores |
| CT-TAB-06 | Jogador inválido gera erro (2, -1, texto) | Erro "jogador inválido" |
| CT-TAB-07 | Passos inválidos geram erro (-1, 57, 1.5) | Erro "passos inválidos" |
| CT-TAB-08 | Saídas 0, 13, 26, 39 e estrelas 8, 21, 34, 47 são seguras | `true` para as 8 casas |
| CT-TAB-09 | Casas comuns e vizinhas das seguras não são seguras (1, 7, 9, 51) | `false` para as 4 casas |
| CT-TAB-10 | Casa fora do percurso gera erro (-1, 52, 2.5) | Erro "casa inválida" |

### `tests/partida.test.js` — partida

| ID | O que testa | Resultado esperado |
|----|-------------|--------------------|
| CT-INICIO-01 | Partida nova tem todos os peões na base e o jogador 0 começa | Peões `[null x4]` nos dois jogadores, jogador atual 0, sem vencedor, sem valor pendente |
| CT-INICIO-02 | Estado inicial de peões informado é respeitado | Posições `[0, 10, null, 56]` e `[null, 25, 50, 51]` |
| CT-INICIO-03 | JogadorInicial 1 faz o jogador 1 começar | Jogador atual 1 |
| CT-INICIO-04 | `posicoes` devolve uma cópia que não altera a partida | Posições continuam `[5, null, null, null]` |
| CT-INICIO-05 | Sem rolar o dado não há movimentos válidos | Lista vazia |
| CT-SAIDA-01 | Com 6 o peão do jogador 0 sai para o passo 0 (casa 0) | Peão 2 no passo 0 (casa 0) |
| CT-SAIDA-02 | Com 6 o peão do jogador 1 sai para o passo 0 (casa 26) | Peão 0 do jogador 1 no passo 0 (casa 26) |
| CT-SAIDA-03 | Sem 6 e com todos na base não há movimento e a vez passa | Evento `sem-movimento`, vez do jogador 1, sem valor pendente |
| CT-SAIDA-04 | Valor 1 (menor face) também não tira peão da base | Evento `sem-movimento` e peões continuam na base |
| CT-SAIDA-05 | Com 6 todos os peões da base podem sair | Evento `aguardando-movimento` com movimentos `[0, 1, 2, 3]` |
| CT-SAIDA-06 | Peão da base não sai com 5 mesmo havendo outro peão em jogo | Movimentos `[0]`; mover o peão 1 gera erro "movimento inválido" |
| CT-SAIDA-07 | O 6 usado para sair não anda casas (de base para passo 0) | Resultado com `de: null` e `para: 0` |
| CT-MOV-01 | O peão anda exatamente o valor do dado | Peão no passo 14 |
| CT-MOV-02 | Depois de mover com valor diferente de 6 a vez passa | `rolaDeNovo: false` e vez do jogador 1 |
| CT-MOV-03 | Rolar informa só os peões que podem andar | Movimentos `[1, 3]` (peões na base ficam de fora) |
| CT-MOV-04 | Peão do jogador 1 passa da casa 51 para a casa 0 continuando a contar passos | Peão no passo 27, que é a casa 1 |
| CT-MOV-05 | Anda com a menor face (1) e com 5 | Jogador 0 no passo 11 e jogador 1 no passo 35 |
| CT-MOV-06 | Mover devolve peão, posição de origem e de destino | `{ peao: 1, de: 7, para: 9, capturado: null }` |
| CT-MOV-07 | O valor rolado fica pendente até o movimento | Valor pendente 2 após rolar e `null` após mover |
| CT-ERRO-01 | Criar partida sem dado gera erro | Erro "dado inválido" |
| CT-ERRO-02 | Dado sem função rolar gera erro | Erro "dado inválido" |
| CT-ERRO-03 | Estado inicial sem exatamente 2 jogadores gera erro | Erro citando "2 jogadores" |
| CT-ERRO-04 | Estado inicial sem exatamente 4 peões por jogador gera erro | Erro citando "4 peões" |
| CT-ERRO-05 | Posição inicial fora de 0 a 56 gera erro (-1, 57, 2.5) | Erro "passos inválidos" |
| CT-ERRO-06 | JogadorInicial inválido gera erro | Erro "jogador inválido" |
| CT-ERRO-07 | Rolar duas vezes sem mover gera erro | Erro "o dado já foi rolado" |
| CT-ERRO-08 | Mover sem ter rolado gera erro | Erro "role o dado antes de mover" |
| CT-ERRO-09 | Rolar fora da vez gera erro | Erro "não é a vez do jogador 1" |
| CT-ERRO-10 | Mover fora da vez gera erro | Erro "não é a vez do jogador 1" |
| CT-ERRO-11 | Índice de peão fora de 0 a 3, não inteiro (1.5) ou texto ("0") | Erro "peão inválido" |
| CT-ERRO-12 | Jogador inexistente ao rolar ou consultar posições gera erro | Erro "jogador inválido" |
| CT-ERRO-13 | Uma ação recusada não altera a partida nem consome o dado | Depois dos erros, o jogador 0 rola o 4 esperado e o peão segue no passo 5 |
| CT-SEIS-01 | Mover com 6 dá direito a rolar de novo | Peão no passo 16, `rolaDeNovo: true`, vez continua do jogador 0 |
| CT-SEIS-02 | Sair da base com 6 também dá direito a rolar de novo | `rolaDeNovo: true` e jogador atual 0 |
| CT-SEIS-03 | Depois do 6, um valor diferente de 6 encerra a vez | Peão no passo 19 e vez do jogador 1 |
| CT-SEIS-04 | Dois 6 seguidos são usados e o jogador ainda rola (limite) | Peão no passo 22, `rolaDeNovo: true`, vez continua do jogador 0 |
| CT-SEIS-05 | O terceiro 6 seguido não é usado e a vez passa | Evento `terceiro-seis`, peão continua no 22, vez do jogador 1 |
| CT-SEIS-06 | A contagem de 6 recomeça no turno seguinte | O 6 do jogador 0 no turno seguinte é usado: peão vai ao passo 28 e rola de novo |
| CT-SEIS-07 | 6 sem movimento válido não passa a vez: o jogador rola de novo | Evento `sem-movimento` e vez continua do jogador 0 |
| CT-SEIS-08 | Depois de um 6 sem movimento, um não-6 sem movimento passa a vez | Evento `sem-movimento` e vez do jogador 1 |
| CT-SEIS-09 | 6 sem movimento conta para os três 6 seguidos | Dois 6 sem movimento mantêm a vez; o terceiro gera `terceiro-seis` e passa a vez |
| CT-SEIS-10 | Um valor diferente de 6 no meio do turno zera a contagem | A quarta rolagem (6) fica `aguardando-movimento`; peão no passo 25 |
| CT-SEIS-11 | Depois do terceiro 6 do jogador 0, o jogador 1 tira 6, 6, 6 | A contagem recomeça: o terceiro 6 do jogador 1 também é `terceiro-seis` e a vez volta ao jogador 0 |
| CT-CAPTURA-01 | Cair na casa de um peão adversário sozinho o manda para a base | Peão no passo 14 e peão do jogador 1 de volta à base |
| CT-CAPTURA-02 | Quem captura rola de novo, mesmo sem ter tirado 6 | `rolaDeNovo: true` e vez continua do jogador 0 |
| CT-CAPTURA-03 | O resultado do movimento informa o peão capturado | `capturado: { jogador: 1, peao: 2 }`; posições do jogador 1 `[null, 5, null, null]` |
| CT-CAPTURA-04 | O jogador 1 também captura (casa 28 → casa 30) | `capturado: { jogador: 0, peao: 0 }` e vez continua do jogador 1 |
| CT-CAPTURA-05 | Passar por cima de um adversário sozinho não captura | `capturado: null`, `rolaDeNovo: false`, adversário continua no passo 38 |
| CT-CAPTURA-06 | Cair na casa de um peão próprio não captura nada | `capturado: null`, peões em `[14, 14]` e vez do jogador 1 |
| CT-CAPTURA-07 | O peão capturado fica na base e só volta com 6 | Jogador 1 rola 5 com evento `sem-movimento` e a vez volta ao jogador 0 |
| CT-CAPTURA-08 | Capturar com 6 dá direito a só uma rolagem extra | Captura com `rolaDeNovo: true`; após a rolagem extra (2) a vez passa |
| CT-CAPTURA-09 | Captura logo depois da volta no percurso (casa 51 → casa 1) | `capturado: { jogador: 0, peao: 0 }`, `rolaDeNovo: true`; peão do jogador 0 volta à base |
| CT-SEGURA-01 | Nas estrelas 8, 21, 34 e 47 os peões convivem sem captura | `capturado: null`, sem rolagem extra e os dois peões na mesma estrela |
| CT-SEGURA-02 | Nas saídas 13, 26 e 39 os peões convivem sem captura | `capturado: null` e adversário na mesma posição |
| CT-SEGURA-03 | Na saída 0 o jogador 1 não captura o peão do jogador 0 | `capturado: null`; jogador 0 continua no passo 0 |
| CT-SEGURA-04 | Sair da base na saída ocupada por um adversário não captura | `capturado: null`; adversário continua no passo 26 |
| CT-SEGURA-05 | As casas vizinhas das seguras (7 e 9) capturam normalmente | `capturado: { jogador: 1, peao: 0 }` nas duas casas |
| CT-BLOQUEIO-01 | O adversário não pode parar na casa do bloqueio | Movimentos `[1]`; mover o peão 0 gera erro "movimento inválido" |
| CT-BLOQUEIO-02 | O adversário não pode passar pela casa do bloqueio | Movimentos `[1]`; mover o peão 0 gera erro "movimento inválido" |
| CT-BLOQUEIO-03 | O adversário pode parar na casa imediatamente antes do bloqueio | Peão no passo 14 |
| CT-BLOQUEIO-04 | Bloqueio na casa seguinte barra todos os valores de 1 a 6 | O peão 0 nunca aparece nos movimentos |
| CT-BLOQUEIO-05 | Bloqueio em casa segura também barra parar e passar | Movimentos `[1]` com 3 e com 5 |
| CT-BLOQUEIO-06 | Bloqueio na saída do adversário impede que ele saia da base | Movimentos `[3]` (nenhum peão sai da base) |
| CT-BLOQUEIO-07 | O próprio jogador pode passar pelo seu bloqueio e parar nele | Movimentos `[0, 1, 2, 3]` e peão no 16; com 4, três peões no passo 14 |
| CT-BLOQUEIO-08 | Três peões na mesma casa também formam bloqueio | Movimentos `[1]` |
| CT-BLOQUEIO-09 | Quando um peão sai do bloqueio, o que fica pode ser capturado | O jogador 0 captura o peão 1 do jogador 1 |
| CT-BLOQUEIO-10 | Bloqueio não é capturado e, sem outro movimento, a vez passa | Evento `sem-movimento`, vez do jogador 1, bloqueio intacto |
| CT-BLOQUEIO-11 | Bloqueio na casa 0 com o adversário vindo da casa 50 | Evento `sem-movimento`; o peão do jogador 1 fica no passo 24 |
| CT-RETA-01 | Do último passo do percurso (50) o peão entra na reta final com 1 | Peão no passo 51, que não tem casa no percurso |
| CT-RETA-02 | O peão anda dentro da reta final | `de: 51`, `para: 54`, `chegou: false` |
| CT-RETA-03 | Chega com o valor exato (52 + 4 = 56) | `para: 56`, `chegou: true` |
| CT-RETA-04 | Passar da chegada é movimento inválido | Movimentos `[1]`; mover o peão 0 gera erro "movimento inválido" |
| CT-RETA-05 | No passo 55 só o 1 serve; o 2 já passa da chegada (limite) | Com 1: movimentos `[0, 1]`; com 2: movimentos `[1]` |
| CT-RETA-06 | Chegar com um peão dá direito a rolar de novo | `rolaDeNovo: true` e vez continua do jogador 0 |
| CT-RETA-07 | Peão na reta final não é capturado | Jogador 1 para na casa 51 sem captura; peão do jogador 0 continua no passo 51 |
| CT-RETA-08 | Peão que já chegou não se move mais | Evento `sem-movimento` e vez do jogador 1 |
| CT-RETA-09 | Valor alto demais para a reta: passa a vez, mas no 6 rola de novo | Com 5: vez do jogador 1; com 6: vez continua do jogador 0 |
| CT-RETA-10 | Bloqueio no fim do percurso impede a entrada na reta final | Movimentos `[1]` |
| CT-VITORIA-01 | Levar o 4º peão à chegada dá a vitória ao jogador 0 | Vencedor 0 e partida terminada |
| CT-VITORIA-02 | O jogador 1 também pode vencer | Vencedor 1 |
| CT-VITORIA-03 | Com 3 peões na chegada ainda não há vencedor (limite) | Sem vencedor, partida não terminada, jogador 0 rola de novo |
| CT-VITORIA-04 | Rolar depois da vitória gera erro | Erro "partida terminou" para os dois jogadores |
| CT-VITORIA-05 | Mover depois da vitória gera erro | Erro "partida terminou" |
| CT-VITORIA-06 | A jogada da vitória não dá nova rolagem e mantém o vencedor como jogador atual | `chegou: true`, `rolaDeNovo: false`, jogador atual 0 |
| CT-VITORIA-07 | Estado inicial com os 4 peões na chegada começa terminado | Vencedor 1 já na criação; rolar gera erro "partida terminou" |
| CT-INTEGRACAO-01 | Partida completa com dado de sequência fixa termina com vitória do jogador 0 | Vencedor 0, peões `[56 x4]` contra `[null x4]`, 96 rolagens, 52 movimentos, sequência toda consumida |
| CT-INTEGRACAO-02 | Turno curto com saída, captura e rolagem extra encadeadas | Captura no passo 27, rolagem extra até o 29 e jogador 1 sem movimento |
| CT-INTEGRACAO-03 | Partidas inteiras com dado de rng e semente fixa sempre terminam com um vencedor | Para cada semente, um vencedor com os 4 peões na chegada e o perdedor sem todos |
| CT-INTEGRACAO-04 | A mesma semente reproduz exatamente a mesma partida | As duas partidas têm o mesmo registro, vencedor e posições finais |

Total: **114 casos de teste**.
