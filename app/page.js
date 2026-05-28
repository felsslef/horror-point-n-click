'use client';

import { useState, useEffect } from 'react';
import { SCENES } from '../data/scenes'; 
import { FaSuitcase, FaTimes, FaBook } from 'react-icons/fa';

const ITEM_DB = {
  'cura': { discardable: true },
  'municao': { discardable: true },
  'envelope': {
    discardable: false,
    inspectHotspots: [
      {
        id: 'abrir_envelope',
        top: '10%', left: '15%', width: '70%', height: '15%',
        action: (state) => {
          state.speak('Você abriu o envelope... Havia uma chave dentro!');
          state.consumeItem('envelope'); 
          state.getItem('chave do portão'); 
          state.getDocument('carta do envelope');
          state.closeInspect(); 
        }
      }
    ]
  }
};

const DOCUMENT_DB = {
  'carta do envelope': {
    title: 'Carta do Envelope',
    content: `Querido cliente, o caso da sua casa é bastante sério. Observamos muitos erros referentes tanto à estrutura externa quanto à estrutura interna. Entendemos que é difícil para você perder um local de infância, mas gostaríamos de lembá-lo de que teria sido melhor pensar nisso antes de abandonar a casa.

É importante citar também que o pacote de seguro contratado pelo senhor não cobre manuseio e transporte de móveis e/ou itens pessoais, solicitação de vistoria e reforma, solicitação de guarda noturna ou diurna e nem a possibilidade de recorrer a vistorias obrigatórias.

Nesse caso, pedimos que vá até o local e retire tudo o que pertence ao senhor e/ou a familiares e amigos. Caso contrário, será cobrada uma multa de R$150 por item, grande ou pequeno, deixado no local.

Agradecemos desde já.
Defesa e Monitoramento Especializado Ltda.`
  }
};

export default function Home() {
  const [currentSceneId, setCurrentSceneId] = useState('entrada');
  
  // --- SISTEMA DE INVENTÁRIO (ITENS) ---
  const [inventory, setInventory] = useState(['envelope']); 
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [itemMenuOpen, setItemMenuOpen] = useState(null); 
  const [activeItem, setActiveItem] = useState(null);     
  const [inspectingItem, setInspectingItem] = useState(null); 

  // --- SISTEMA DE DOCUMENTOS (CARTAS) ---
  const [documents, setDocuments] = useState([]);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [readingDocument, setReadingDocument] = useState(null);

  // --- SISTEMA DE LEGENDA (ORIGINAL) ---
  const [currentSubtitle, setCurrentSubtitle] = useState(''); 
  const [subtitleQueue, setSubtitleQueue] = useState([]);     
  const [playedDialogues, setPlayedDialogues] = useState([]); 

  // --- SISTEMA DE OBJETIVOS ---
  const [objective, setObjective] = useState();
  const [completedObjectives, setCompletedObjectives] = useState([]); 
  const [isObjectiveVisible, setIsObjectiveVisible] = useState(true); 
  const [objectiveTrigger, setObjectiveTrigger] = useState(0); 
  const [pendingObjective, setPendingObjective] = useState(null);

  // --- NOVO: RASTREIO DE PORTAS E JANELAS VISITADAS ---
  const [checkedEntrances, setCheckedEntrances] = useState([]);

  // --- SISTEMA INTERNO MODO ADMIN / DEV ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminClicks, setAdminClicks] = useState([]);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [konamiIndex, setKonamiIndex] = useState(0);
  const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

  // Função gerenciadora para trocar objetivos
  const changeObjective = (newObjective) => {
    if (!newObjective || newObjective === objective) return;
    
    if (objective) {
      setCompletedObjectives(c => c.includes(objective) ? c : [...c, objective]);
    }
    
    setObjective(newObjective);
    setIsObjectiveVisible(true);
    setObjectiveTrigger(prev => prev + 1);
  };

  // Timer para sumir com o objetivo após 5 segundos
  useEffect(() => {
    if (isObjectiveVisible) {
      const timer = setTimeout(() => {
        setIsObjectiveVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isObjectiveVisible, objectiveTrigger]);

  // Monitora a entrada do jogador em novos cenários
  useEffect(() => {
    const activeScene = SCENES[currentSceneId];
    const hasPlayed = playedDialogues.includes(currentSceneId);

    if (!hasPlayed) {
      setPlayedDialogues((prev) => [...prev, currentSceneId]);
      
      if (activeScene?.entryDialogues) {
        setCurrentSubtitle('');
        
        if (Array.isArray(activeScene.entryDialogues)) {
          setSubtitleQueue([...activeScene.entryDialogues]);
        } else if (typeof activeScene.entryDialogues === 'string') {
          setSubtitleQueue([activeScene.entryDialogues]);
        }
        
        if (activeScene.objective && !completedObjectives.includes(activeScene.objective)) {
          setPendingObjective(activeScene.objective);
        }
      } else if (activeScene?.objective && !completedObjectives.includes(activeScene.objective)) {
        changeObjective(activeScene.objective);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSceneId]);

  // Mostra o objetivo assim que as falas da cena terminarem
  useEffect(() => {
    if (pendingObjective && subtitleQueue.length === 0 && !currentSubtitle) {
      changeObjective(pendingObjective);
      setPendingObjective(null); 
    }
  }, [subtitleQueue, currentSubtitle, pendingObjective]);

  // Motor original da fila de legendas
  useEffect(() => {
    if (!currentSubtitle && subtitleQueue.length > 0) {
      setCurrentSubtitle(subtitleQueue[0]); 
      setSubtitleQueue((prev) => prev.slice(1)); 
    }
  }, [currentSubtitle, subtitleQueue]);

  useEffect(() => {
    if (currentSubtitle) {
      const calculatedTime = Math.max(1500, 1000 + (currentSubtitle.length * 50));
      const timer = setTimeout(() => { setCurrentSubtitle(''); }, calculatedTime);
      return () => clearTimeout(timer);
    }
  }, [currentSubtitle]);

  // Teclado: Legendas, Konami Code e Tecla TAB para Objetivo
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      if (key === 'tab') {
        event.preventDefault(); 
        setIsObjectiveVisible(prev => {
          const nextState = !prev;
          if (nextState) {
            setObjectiveTrigger(t => t + 1);
          }
          return nextState;
        });
      }

      if (key === konamiCode[konamiIndex]) {
        const nextIndex = konamiIndex + 1;
        if (nextIndex === konamiCode.length) {
          setIsAdminMode((prev) => !prev);
          setAdminClicks([]);
          setKonamiIndex(0);
        } else {
          setKonamiIndex(nextIndex);
        }
      } else {
        setKonamiIndex(0);
      }

      if (event.key === ' ' || event.code === 'Space') {
        if (currentSubtitle) {
          event.preventDefault(); 
          setCurrentSubtitle(''); 
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSubtitle, konamiIndex, isAdminMode]); 

  const scene = SCENES[currentSceneId];

  // Interação original baseada em Array (localQueue)
  const handleInteraction = (hotspot) => {
    setCurrentSubtitle('');
    let localQueue = [];

    // 🚪 CONFIGURAÇÃO DO QUEBRA-CABEÇA DAS PORTAS
    // Mude os nomes abaixo para baterem EXATAMENTE com os IDs que você criou no seu `scenes.js`
    const requiredEntrances = ['portaCozinha', 'portaDupla', 'janela'];
    const allEntrancesChecked = requiredEntrances.every(id => checkedEntrances.includes(id));

    // Se o jogador interagir com uma das entradas trancadas obrigatórias, salva no estado
    if (requiredEntrances.includes(hotspot.id)) {
      if (!checkedEntrances.includes(hotspot.id)) {
        setCheckedEntrances(prev => [...prev, hotspot.id]);
      }
    }

    // Interceptação da Janela da Cozinha
    if (hotspot.id === 'janela_cozinha') {
      if (!allEntrancesChecked) {
        // Caso NÃO tenha verificado tudo ainda: bloqueia a entrada e solta a fala de recusa
        localQueue.push("Está aberta, mas prefiro não entrar pela janela da cozinha, se não tiver outro jeito eu volto aqui.");
        setSubtitleQueue(localQueue);
        return; // 'return' corta o fluxo aqui e impede o hotspot.action original de rodar!
      }
    }

    const gameState = {
      inventory,
      documents,
      activeItem, 
      allEntrancesChecked, // Enviado para dentro das actions se você precisar checar lá também
      
      changeScene: (nextId) => {
        setCurrentSceneId(nextId);
        setCurrentSubtitle('');
        setSubtitleQueue([]);
        localQueue = []; 
      },
      
      getItem: (itemName) => {
        if (!inventory.includes(itemName)) {
          setInventory(prev => [...prev, itemName]);
          localQueue.push(`Você pegou: ${itemName.replace('_', ' ')}`);
        }
      },
      
      getDocument: (docName) => {
        if (!documents.includes(docName)) {
          setDocuments(prev => [...prev, docName]);
          const docTitle = DOCUMENT_DB[docName]?.title || 'Documento Desconhecido';
          localQueue.push(`Novo documento arquivado: ${docTitle}`);
        }
      },
      
      consumeItem: (itemName) => {
        setInventory(prev => prev.filter(i => i !== itemName));
        if (activeItem === itemName) setActiveItem(null); 
      },
      
      speak: (text) => {
        localQueue.push(text);
      },
      
      setObjective: (text) => {
        changeObjective(text);
      },
      
      closeInspect: () => setInspectingItem(null) 
    };

    if (hotspot.action) {
      const actionResult = hotspot.action(gameState);
      if (activeItem && actionResult !== true) {
        localQueue.push("Isso não funciona aqui...");
        setActiveItem(null); 
      }
    }

    setSubtitleQueue(localQueue);
  };

  return (
    <main suppressHydrationWarning className="fixed inset-0 w-screen h-screen bg-black overflow-hidden select-none font-sans">
      
      {/* 🎯 HUD: NOTIFICAÇÃO E EXIBIÇÃO DE OBJETIVO */}
      <div 
        className={`absolute top-6 left-6 z-40 max-w-sm pointer-events-none transition-all duration-500 transform ${
          isObjectiveVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
        }`}
      >
        <div className="bg-zinc-950/90 border-l-4 border-amber-500 border-y border-r border-zinc-800 px-4 py-2.5 rounded-r shadow-2xl backdrop-blur-sm">
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-0.5 font-bold">Objetivo Atual</span>
          <p className="text-zinc-200 font-sans text-sm font-medium tracking-wide leading-snug">{objective}</p>
          <span className="text-[9px] font-mono text-zinc-500 block mt-1">[Aperte TAB para rever]</span>
        </div>
      </div>

      {/* HUD EXCLUSIVO: MODO ADMINISTRADOR */}
      {isAdminMode && (
        <>
          <div className="absolute top-4 left-4 z-[95] bg-red-950 border border-red-600 px-4 py-2 rounded-md font-mono text-xs text-white shadow-xl flex items-center gap-3">
            <span className="animate-pulse bg-red-500 h-2 w-2 rounded-full"></span>
            <span>MODO DEV ATIVO | MARQUE 4 PONTOS: {adminClicks.length}/4</span>
          </div>

          {generatedCodes.length > 0 && (
            <div className="absolute top-4 right-4 z-[95] w-96 bg-zinc-950/95 border border-zinc-700 p-4 rounded-xl font-mono text-xs text-green-400 max-h-[40vh] overflow-y-auto shadow-2xl select-text">
              <div className="flex justify-between items-center mb-2 text-zinc-400 border-b border-zinc-800 pb-1 font-bold">
                <span>BOTÕES GERADOS PARA O SEU CODE</span>
                <button onClick={() => setGeneratedCodes([])} className="text-red-500 hover:text-red-400 font-sans uppercase text-[10px]">Limpar</button>
              </div>
              {generatedCodes.map((code, idx) => (
                <pre key={idx} className="bg-black/50 p-2 rounded mb-2 overflow-x-auto whitespace-pre select-all cursor-pointer border border-zinc-800 hover:border-zinc-700" title="Clique e use Ctrl+C">{code}</pre>
              ))}
            </div>
          )}

          <div 
            onClick={(e) => {
              const x = (e.clientX / window.innerWidth) * 100;
              const y = (e.clientY / window.innerHeight) * 100;
              const nextClicks = [...adminClicks, { x, y }];
              
              if (nextClicks.length === 4) {
                setTimeout(() => {
                  const id = prompt("Digite o nome/ID do novo Hotspot:");
                  if (id) {
                    const pointsStr = nextClicks.map(c => `{ x: ${c.x.toFixed(1)}, y: ${c.y.toFixed(1)} }`).join(', ');
                    const snippet = `{\n  id: '${id}',\n  points: [ ${pointsStr} ],\n  action: (state) => {\n    state.speak('Interagiu com ${id}');\n  }\n},`;
                    setGeneratedCodes(p => [...p, snippet]);
                  }
                  setAdminClicks([]);
                }, 50);
              } else {
                setAdminClicks(nextClicks);
              }
            }}
            className="absolute inset-0 z-[80] cursor-crosshair bg-red-500/5 backdrop-blur-[0.5px]"
          />

          <svg className="absolute inset-0 w-full h-full z-[85] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {adminClicks.map((c, i) => (
              <circle key={i} cx={c.x} cy={c.y} r="0.4" fill="#ef4444" />
            ))}
            {adminClicks.length > 1 && (
              <polyline 
                points={adminClicks.map(c => `${c.x},${c.y}`).join(' ')} 
                fill="none" 
                stroke="#ef4444" 
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: 1.5 }}
              />
            )}
          </svg>
        </>
      )}

      {/* 1. CAMADA DO CENÁRIO */}
      <div className="absolute inset-0 w-full h-full z-0">
        {scene?.image ? (
          <img src={scene.image} alt="Cenário" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">Imagem não encontrada.</div>
        )}
      </div>

      {/* 2. CAMADA DE HOTSPOTS 2D */}
      <div className="absolute inset-0 w-full h-full z-10">
        {scene?.hotspots?.map((spot) => {
          if (spot.points) return null; 
          if (inventory.includes(spot.id) || documents.includes(spot.id)) return null;

          return (
            <div
              key={spot.id}
              onClick={() => handleInteraction(spot)}
              className="absolute z-50 group"
              style={{ 
                top: spot.top, 
                left: spot.left, 
                width: spot.width, 
                height: spot.height,
                transform: spot.rotate ? `rotate(${spot.rotate}deg)` : undefined,
                cursor: spot.cursorImage ? `url(${spot.cursorImage}), pointer` : (spot.cursorType || 'pointer')
              }}
            >
              <div className="w-full h-full border border-white/0 group-hover:border-white/20 transition-colors" />
              {spot.itemImage && <img src={spot.itemImage} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="" />}
            </div>
          );
        })}
      </div>

      {/* 2B. CAMADA DE HOTSPOTS EM PERSPECTIVA */}
      <svg className="absolute inset-0 w-full h-full z-15 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {scene?.hotspots?.map((spot) => {
          if (!spot.points) return null; 
          if (inventory.includes(spot.id) || documents.includes(spot.id)) return null;

          const pointsString = spot.points.map(p => `${p.x},${p.y}`).join(' ');

          return (
            <polygon
              key={spot.id}
              points={pointsString}
              onClick={() => handleInteraction(spot)}
              vectorEffect="non-scaling-stroke"
              className="pointer-events-auto cursor-pointer fill-transparent stroke-transparent hover:stroke-white/20 transition-colors"
              style={{
                strokeWidth: 1,
                cursor: spot.cursorImage ? `url(${spot.cursorImage}), pointer` : (spot.cursorType || 'pointer')
              }}
            />
          );
        })}
      </svg>

      {/* 3. TELA DE INSPEÇÃO DE ITENS */}
      {inspectingItem && (
        <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center">
          <button onClick={() => setInspectingItem(null)} className="absolute top-10 right-10 text-zinc-400 hover:text-white flex items-center gap-2 text-xl font-mono">
            FECHAR <FaTimes />
          </button>
          <div className="relative w-[80vw] max-w-lg aspect-square bg-zinc-900/50 rounded-xl border border-zinc-700 shadow-2xl p-4">
            <img src={`/itens/${inspectingItem}.png`} alt={inspectingItem} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            {ITEM_DB[inspectingItem]?.inspectHotspots?.map((spot) => (
              <div 
                key={spot.id} 
                onClick={() => handleInteraction(spot)} 
                className="absolute cursor-pointer z-50 group hover:border-white/30 border border-transparent transition-colors" 
                style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }} 
              />
            ))}
          </div>
          <p className="mt-8 text-zinc-400 font-mono uppercase tracking-widest text-xl">Inspecionando: {inspectingItem.replace('_', ' ')}</p>
        </div>
      )}

      {/* 📜 4. LEITOR DE DOCUMENTOS E CARTAS */}
      {readingDocument && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <button onClick={() => setReadingDocument(null)} className="absolute top-10 right-10 text-zinc-400 hover:text-white flex items-center gap-2 text-xl font-mono">
            FECHAR <FaTimes />
          </button>
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-xl p-8 shadow-2xl max-h-[70vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-serif text-amber-500 border-b border-zinc-800 pb-3 mb-6 font-bold tracking-wide uppercase">
              {DOCUMENT_DB[readingDocument]?.title || 'Documento'}
            </h2>
            <p className="text-zinc-200 font-serif text-lg leading-relaxed whitespace-pre-line tracking-wide">
              {DOCUMENT_DB[readingDocument]?.content || 'Este documento está em branco.'}
            </p>
          </div>
        </div>
      )}

      {/* 5. HUD: AVISO DE ITEM EQUIPADO */}
      {activeItem && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-zinc-950/90 border border-zinc-700 px-6 py-3 rounded-full shadow-2xl animate-pulse">
          <span className="text-zinc-300 font-mono text-sm uppercase">Usando: <b className="text-white">{activeItem.replace('_', ' ')}</b></span>
          <button onClick={() => setActiveItem(null)} className="text-red-500 hover:text-red-400 text-xs uppercase font-bold ml-2 border-l border-zinc-700 pl-4">Cancelar (X)</button>
        </div>
      )}

      {/* 6. LEGENDA */}
      {currentSubtitle && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-4xl text-center pointer-events-none z-40 px-6">
          <p className="inline-block bg-black/90 text-white text-xl md:text-3xl px-8 py-3 rounded-lg border border-white/20 backdrop-blur-sm shadow-2xl tracking-wide">
            {currentSubtitle}
          </p>
        </div>
      )}

      {/* 7. BOTÕES FLUTUANTES (INVENTÁRIO E CARTAS) */}
      <div className="absolute bottom-8 right-8 z-50 flex flex-col items-end gap-4">
        {/* INTERFACE DO INVENTÁRIO */}
        {isInventoryOpen && (
          <div className="flex flex-col gap-3 bg-black/85 border border-zinc-800 p-3 rounded-xl backdrop-blur-md shadow-2xl max-h-[50vh] overflow-y-auto min-w-[70px] items-center relative custom-scrollbar">
            {inventory.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-1 w-full">
                <div 
                  onClick={() => setItemMenuOpen(itemMenuOpen === item ? null : item)}
                  className={`w-16 h-16 bg-zinc-900/90 border-2 flex shrink-0 items-center justify-center rounded-lg shadow-md transition-all cursor-pointer overflow-hidden ${itemMenuOpen === item ? 'border-white' : activeItem === item ? 'border-red-600' : 'border-zinc-700 hover:border-zinc-500'}`}
                >
                  <img src={`/itens/${item}.png`} alt={item} className="w-full h-full object-contain p-2" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }} />
                  <span className="hidden w-full h-full items-center justify-center text-[9px] text-zinc-300 font-mono uppercase p-1 text-center break-words">{item.replace('_', ' ')}</span>
                </div>
                {itemMenuOpen === item && (
                  <div className="bg-zinc-950 border border-zinc-700 rounded-md shadow-2xl flex flex-col z-[60] w-full overflow-hidden mb-2">
                    <button onClick={() => { setActiveItem(item); setItemMenuOpen(null); setIsInventoryOpen(false); }} className="text-[10px] font-mono text-center w-full py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">USAR</button>
                    <div className="w-full h-px bg-zinc-800"></div>
                    <button onClick={() => { setInspectingItem(item); setItemMenuOpen(null); setIsInventoryOpen(false); }} className="text-[10px] font-mono text-center w-full py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">OLHAR</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* INTERFACE DE DOCUMENTOS */}
        {isDocumentsOpen && (
          <div className="bg-black/90 border border-zinc-800 p-4 rounded-xl backdrop-blur-md shadow-2xl max-h-[50vh] overflow-y-auto w-64 flex flex-col gap-2 custom-scrollbar">
            <h3 className="text-xs font-mono uppercase text-zinc-500 tracking-wider mb-2 border-b border-zinc-800 pb-1">Documentos Encontrados</h3>
            {documents.map((doc, index) => (
              <button
                key={index}
                onClick={() => { setReadingDocument(doc); setIsDocumentsOpen(false); }}
                className="w-full text-left font-serif text-sm bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 px-3 py-2 rounded text-zinc-300 hover:text-white transition-all truncate"
              >
                📄 {DOCUMENT_DB[doc]?.title || doc}
              </button>
            ))}
          </div>
        )}

        {/* BOTÕES DE ACESSO DO HUD */}
        <div className="flex gap-3">
          <button onClick={() => { setIsDocumentsOpen(!isDocumentsOpen); setIsInventoryOpen(false); setItemMenuOpen(null); }} className={`p-4 rounded-full border shadow-xl backdrop-blur-md transition-all ${isDocumentsOpen ? 'bg-amber-950/80 border-amber-600 text-amber-400' : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'}`}><FaBook size={22} /></button>
          <button onClick={() => { setIsInventoryOpen(!isInventoryOpen); setIsDocumentsOpen(false); setItemMenuOpen(null); }} className={`p-4 rounded-full border shadow-xl backdrop-blur-md transition-all ${isInventoryOpen ? 'bg-red-950/80 border-red-600 text-red-400' : 'bg-zinc-900/80 border-zinc-700 text-zinc-400'}`}><FaSuitcase size={22} /></button>
        </div>
      </div>

    </main>
  );
}