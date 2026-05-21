// storage.js

// 1. Inicializa o banco com dados padrão se estiver vazio
function inicializarBancoDeDados() {
  // Lista padrão de mapas oficiais de Point Blank (Camp. Brasileiro / Seletivas)
  const mapasPadrao = [
    { id: "m_luxville", nome: "Luxville" },
    { id: "m_downtown", nome: "Downtown" },
    { id: "m_stormville", nome: "Stormville" },
    { id: "m_sandstorm", nome: "Sandstorm" },
    { id: "m_midtown", nome: "Midtown" },
    { id: "m_outpost", nome: "Outpost" },
    { id: "m_safehouse", nome: "Safehouse" }
  ];

  if (!localStorage.getItem('pb_mapas')) {
    localStorage.setItem('pb_mapas', JSON.stringify(mapasPadrao));
  }

  // Lista mockada de times iniciais (caso queira iniciar com exemplos)
  const timesPadrao = [
    { id: "t_1", nome: "Uncharted Black", tag: "UNC", players: [
      { id: "p_1", nickname: "Vander" }, { id: "p_2", nickname: "Digo" }, { id: "p_3", nickname: "Koyote" }, { id: "p_4", nickname: "Head" }, { id: "p_5", nickname: "Nyx" }
    ]},
    { id: "t_2", font: "Black Dragons", nome: "Black Dragons", tag: "BD", players: [
      { id: "p_6", nickname: "Foox" }, { id: "p_7", nickname: "Patoxy" }, { id: "p_8", nickname: "Prozin" }, { id: "p_9", nickname: "Bezn" }, { id: "p_10", nickname: "Rnd" }
    ]},
    { id: "t_3", nome: "NewFox Esports", tag: "NFX", players: [] },
    { id: "t_4", nome: "2Kill Gaming", tag: "2K", players: [] },
    { id: "t_5", nome: "Brave eSports", tag: "BRV", players: [] },
    { id: "t_6", nome: "Dai Dai Gaming", tag: "DDG", players: [] },
    { id: "t_7", nome: "Team One", tag: "T1", players: [] },
    { id: "t_8", nome: "g3nerationX", tag: "G3X", players: [] }
  ];

  if (!localStorage.getItem('pb_times_globais')) {
    localStorage.setItem('pb_times_globais', JSON.stringify(timesPadrao));
  }
}

// 2. Funções auxiliares de leitura e escrita
const StoragePB = {
  getTorneio: () => JSON.parse(localStorage.getItem('pb_torneio')),
  saveTorneio: (dados) => localStorage.setItem('pb_torneio', JSON.stringify(dados)),
  
  getTimesGlobais: () => JSON.parse(localStorage.getItem('pb_times_globais')) || [],
  saveTimesGlobais: (times) => localStorage.setItem('pb_times_globais', JSON.stringify(times)),
  
  getMapas: () => JSON.parse(localStorage.getItem('pb_mapas')) || [],
  saveMapas: (mapas) => localStorage.setItem('pb_mapas', JSON.stringify(mapas))
};

// Executa a inicialização automaticamente ao carregar o script
inicializarBancoDeDados();