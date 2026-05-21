// engine.js

const EnginePB = {
  // Cria a estrutura padrão do torneio baseada em 8 times selecionados
  criarNovoTorneio: (listaDe8Times) => {
    if (listaDe8Times.length !== 8) {
      alert("Para um mata-mata perfeito de Quartas de Final, selecione exatamente 8 times!");
      return null;
    }

    const estruturaTorneio = {
      id: "torneio_" + Date.now(),
      status: "Em Andamento",
      campeao: null,
      times: listaDe8Times, // Copia os times com suas respectivas line-ups de players
      partidas: [
        // QUARTAS DE FINAL
        { id: "p_quartas_1", fase: "Quartas", timeA: listaDe8Times[0], timeB: listaDe8Times[1], placar: { A: 0, B: 0 }, vencedor_id: null, historico_mapas: [], mapas_série: null, mapa3_sorteado: false },
        { id: "p_quartas_2", fase: "Quartas", timeA: listaDe8Times[2], timeB: listaDe8Times[3], placar: { A: 0, B: 0 }, vencedor_id: null, historico_mapas: [], mapas_série: null, mapa3_sorteado: false },
        { id: "p_quartas_3", fase: "Quartas", timeA: listaDe8Times[4], timeB: listaDe8Times[5], placar: { A: 0, B: 0 }, vencedor_id: null, historico_mapas: [], mapas_série: null, mapa3_sorteado: false },
        { id: "p_quartas_4", fase: "Quartas", timeA: listaDe8Times[6], timeB: listaDe8Times[7], placar: { A: 0, B: 0 }, vencedor_id: null, historico_mapas: [], mapas_série: null, mapa3_sorteado: false },
        
        // SEMIFINAIS (Aguardando vencedores)
        { id: "p_semifinal_1", fase: "Semifinal", timeA: null, timeB: null, placar: { A: 0, B: 0 }, vencedor_id: null, historico_mapas: [], mapas_série: null, mapa3_sorteado: false },
        { id: "p_semifinal_2", fase: "Semifinal", timeA: null, timeB: null, placar: { A: 0, B: 0 }, vencedor_id: null, historico_mapas: [], mapas_série: null, mapa3_sorteado: false },
        
        // FINAL
        { id: "p_final", fase: "Final", timeA: null, timeB: null, placar: { A: 0, B: 0 }, vencedor_id: null, historico_mapas: [], mapas_série: null, mapa3_sorteado: false }
      ]
    };

    localStorage.setItem('pb_torneio', JSON.stringify(estruturaTorneio));
    return estruturaTorneio;
  },

  // Vincula dinamicamente novos jogadores a um time e atualiza as partidas atuais dele
  adicionarJogadorAoTime: (timeId, nickname) => {
    let torneio = StoragePB.getTorneio();
    let timesGlobais = StoragePB.getTimesGlobais();

    // Cria o objeto do player
    const novoPlayer = {
      id: "p_" + Date.now() + Math.random().toString(36).substr(2, 4),
      nickname: nickname
    };

    // Atualiza na lista global de times
    let timeGlobal = timesGlobais.find(t => t.id === timeId);
    if (timeGlobal) {
      if(!timeGlobal.players) timeGlobal.players = [];
      timeGlobal.players.push(novoPlayer);
      StoragePB.saveTimesGlobais(timesGlobais);
    }

    // Se houver um torneio ativo, atualiza dentro dele e nas partidas vigentes
    if (torneio) {
      let timeTorneio = torneio.times.find(t => t.id === timeId);
      if (timeTorneio) {
        if(!timeTorneio.players) timeTorneio.players = [];
        timeTorneio.players.push(novoPlayer);
      }

      torneio.partidas.forEach(p => {
        if (p.timeA && p.timeA.id === timeId) p.timeA.players = timeTorneio.players;
        if (p.timeB && p.timeB.id === timeId) p.timeB.players = timeTorneio.players;
      });

      StoragePB.saveTorneio(torneio);
    }
  }
};