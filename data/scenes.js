export const SCENES = {
  entrada: {
    image: '/cenarios/entradaPH.jpeg',
    entryDialogues: [
      'Finalmente cheguei. Está pior do que eu lembrava.',
      'Essa entrada... ainda me dá uma nostalgia.',
    ],
    objective: 'Entre na sua antiga casa.',
    hotspots: [
      {
        id: 'portão', 
        top: '30%', left: '55%', width: '25%', height: '70%', 
        action: (state) => {
          if (state.activeItem === 'chave do portão'){
            state.speak('Abriu!');
            state.consumeItem('chave do portão');
            state.changeScene('garagem');
            return true;
          } else {
            state.speak('Está trancada. Preciso da chave.');
            state.speak('Acho que ela está dentro do envelope que me mandaram ontem.');
          }
        }
      }
    ]
  },
  garagem: {
    image: '/cenarios/garagemDir.png',
    objective: 'Explore a casa por coisas importantes.',
    hotspots: [
      {
        id: 'bagunçaDir', 
        top: '20%', left: '39%', width: '30%', height: '20%', 
        action: (state) => {
          state.speak('Apenas lixo, nada de interessante.');
          state.speak('Mais tarde eu volto com sacos de lixo para organizar isso aqui.');
          state.speak('Mas por enquanto, vou procurar coisas mais importantes.');
          state.speak('Não deve ter muita coisa assim.');
        }
      },
      {
        id: 'bagunçaEsq', 
        top: '20%', left: '0%', width: '25%', height: '20%', 
        action: (state) => {
          state.speak('Apenas lixo, nada de interessante.');
          state.speak('Mais tarde eu volto com sacos de lixo para organizar isso aqui.');
          state.speak('Mas por enquanto, vou procurar coisas mais importantes.');
          state.speak('Não deve ter muita coisa assim.');
        }
      },
      {
        id: 'irEscada',
        top: '0%', left: '95%', width: '5%', height: '100%',
        action: (state) => {
          state.changeScene('escada');
        }
      }
    ]
  },
  escada: {
    image: '/cenarios/escada.jpeg',
    // Diálogos de entrada executados apenas na primeira vez que acessa a escada
    entryDialogues: [
      'Esse lugar me trás tantas lembranças... Quantas vezes eu quase caí nessa escada haha.'
    ],
    hotspots: [
      {
        id: 'irGaragem',
        top: '0%', left: '0%', width: '5%', height: '100%',
        action: (state) => {
          state.changeScene('garagem');
        }
      },
      {
        id: 'irCasaFora',
        top: '0%', left: '58.2%', width: '17%', height: '10%',
        action: (state) => {
          state.changeScene('casaFora');
        }
      }
    ]
  },
  casaFora: {
    image: '/cenarios/casaFora.jpeg',
    entryDialogues: [
      'Nossa! Está ainda pior que lá fora. O musgo está tomando conta de tudo.'
    ],
    objective: 'Procure um meio de entrar na casa.',
    hotspots: [
      {
        id: 'irEscada',
        top: '90%', left: '0%', width: '100%', height: '10%',
        action: (state) => {
          state.changeScene('escada');
        }
      },
      {
        id: 'portaDupla',
        points: [ { x: 72.6, y: 4.6 }, { x: 96.7, y: 10.8 }, { x: 97.5, y: 47.7 }, { x: 71.4, y: 56.2 } ],
        action: (state) => {
          state.speak('Está trancada!');
        }
      },
      {
        id: 'janela',
        points: [ { x: 31.4, y: 33.7 }, { x: 41.6, y: 28.1 }, { x: 42.2, y: 46.4 }, { x: 31.1, y: 44.1 } ],
        action: (state) => {
          state.speak('Trancada e não acho legal entrar pela janela!');
        }
      },
      {
        id: 'irChurrasqueira',
        top: '0%', left: '95%', width: '5%', height: '100%',
        action: (state) => {
          state.changeScene('churrasqueira');
        }
      }
    ]
  },
  churrasqueira: {
    image: '/cenarios/churrasqueira.jpeg',
    hotspots: [
      {
        id: 'irCasaFora',
        top: '0%', left: '0%', width: '5%', height: '100%',
        action: (state) => {
          state.changeScene('casaFora');
        }
      },
      {
        id: 'portaCozinha',
        points: [ { x: 36.7, y: 11.6 }, { x: 44.3, y: 14.4 }, { x: 43.8, y: 63.3 }, { x: 37.1, y: 57.1 } ],
        action: (state) => {
          state.speak('Essa é a porta da cozinha. Deve estar aberta ainda, a gente nunca arrumou essa tranca.');
          state.speak('*Barulho de maçaneta*');
          state.speak('Trancada? Mas ela não devia... deixa, vou dar outro jeito de entrar.');
        }
      },
      {
        id: 'entradaSotao',
        points: [ { x: 23.9, y: 16.4 }, { x: 32.2, y: 9.2 }, { x: 31.9, y: 20.0 }, { x: 23.2, y: 20.0 } ],
        action: (state) => {
          state.speak('O sotão... Nunca gostei de subir lá... mas provavelmente tem coisas importantes...');
          state.speak('mais tarde eu subo, vou focar em entrar na casa primeiro.');
        }
      }
    ]
  }
};