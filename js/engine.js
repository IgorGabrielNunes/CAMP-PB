// engine.js

const EnginePB = {
  criarNovoTorneio: (listaDeTimes, formato) => {
    if (!listaDeTimes || listaDeTimes.length < 2) {
      alert("É necessário pelo menos 2 times para iniciar um torneio!");
      return null;
    }
    return StoragePB.criarTorneio("PB Tournament", formato) ? StoragePB.getTorneio() : null;
  },

  // Monitora o estado das partidas e empurra os vencedores para a próxima fase correspondente
  atualizarChaveamentoEProgressao: () => {
    let torneio = StoragePB.getTorneio();
    if (!torneio || !torneio.partidas) return;

    // Função auxiliar para extrair com segurança apenas a string do ID
    const obterIdVencedor = (partida) => {
      if (!partida || !partida.vencedor_id) return null;
      return typeof partida.vencedor_id === 'object' ? partida.vencedor_id.id : partida.vencedor_id;
    };

    // 1. SE FOR MATA-MATA TRADICIONAL
    if (torneio.formato === "matamata") {
      const q1 = torneio.partidas.find(p => p.id === "match_q_1");
      const q2 = torneio.partidas.find(p => p.id === "match_q_2");
      const q3 = torneio.partidas.find(p => p.id === "match_q_3");
      const q4 = torneio.partidas.find(p => p.id === "match_q_4");

      const s1 = torneio.partidas.find(p => p.id === "match_s_1");
      const s2 = torneio.partidas.find(p => p.id === "match_s_2");
      const f1 = torneio.partidas.find(p => p.id === "match_f_1");

      // Avanço das Quartas para as Semis
      if (q1 && obterIdVencedor(q1)) s1.timeA = obterIdVencedor(q1) === q1.timeA.id ? q1.timeA : q1.timeB;
      if (q2 && obterIdVencedor(q2)) s1.timeB = obterIdVencedor(q2) === q2.timeA.id ? q2.timeA : q2.timeB;
      if (q3 && obterIdVencedor(q3)) s2.timeA = obterIdVencedor(q3) === q3.timeA.id ? q3.timeA : q3.timeB;
      if (q4 && obterIdVencedor(q4)) s2.timeB = obterIdVencedor(q4) === q4.timeA.id ? q4.timeA : q4.timeB;

      // Avanço das Semis para a Final
      if (s1 && obterIdVencedor(s1)) f1.timeA = obterIdVencedor(s1) === s1.timeA.id ? s1.timeA : s1.timeB;
      if (s2 && obterIdVencedor(s2)) f1.timeB = obterIdVencedor(s2) === s2.timeA.id ? s2.timeA : s2.timeB;

      // Definir campeão geral do Mata-Mata
      if (f1 && obterIdVencedor(f1)) {
        const tCamp = obterIdVencedor(f1) === f1.timeA.id ? f1.timeA : f1.timeB;
        torneio.campeao = `[${tCamp.tag}] ${tCamp.nome}`;
        torneio.status = "Finalizado";
      }
    }

    // 2. SE FOR BASEADO EM GRUPOS
    if (torneio.formato && (torneio.formato === "grupos_final" || torneio.formato === "grupos_playoffs")) {
      const jogosGrupo = torneio.partidas.filter(p => p.fase === "Fase de Grupos");
      const todosConcluidos = jogosGrupo.every(p => obterIdVencedor(p) !== null);

      if (todosConcluidos) {
        const rank = StoragePB.calcularClassificacao();
        const tGerais = torneio.times_gerais || StoragePB.getTimes();

        if (torneio.formato === "grupos_final" && rank.length >= 2) {
          const f1 = torneio.partidas.find(p => p.id === "match_f_1");
          if (f1 && !f1.timeA && !f1.timeB) {
            f1.timeA = tGerais.find(t => t.id === rank[0].id);
            f1.timeB = tGerais.find(t => t.id === rank[1].id);
          }
          if (f1 && obterIdVencedor(f1)) {
            const tCamp = obterIdVencedor(f1) === f1.timeA.id ? f1.timeA : f1.timeB;
            torneio.campeao = `[${tCamp.tag}] ${tCamp.nome}`;
            torneio.status = "Finalizado";
          }
        }

        if (torneio.formato === "grupos_playoffs" && rank.length >= 4) {
          const s1 = torneio.partidas.find(p => p.id === "match_s_1");
          const s2 = torneio.partidas.find(p => p.id === "match_s_2");
          const f1 = torneio.partidas.find(p => p.id === "match_f_1");

          if (s1 && !s1.timeA && !s1.timeB) {
            s1.timeA = tGerais.find(t => t.id === rank[0].id);
            s1.timeB = tGerais.find(t => t.id === rank[3].id);
          }
          if (s2 && !s2.timeA && !s2.timeB) {
            s2.timeA = tGerais.find(t => t.id === rank[1].id);
            s2.timeB = tGerais.find(t => t.id === rank[2].id);
          }

          if (s1 && obterIdVencedor(s1)) f1.timeA = obterIdVencedor(s1) === s1.timeA.id ? s1.timeA : s1.timeB;
          if (s2 && obterIdVencedor(s2)) f1.timeB = obterIdVencedor(s2) === s2.timeA.id ? s2.timeA : s2.timeB;

          if (f1 && obterIdVencedor(f1)) {
            const tCamp = obterIdVencedor(f1) === f1.timeA.id ? f1.timeA : f1.timeB;
            torneio.campeao = `[${tCamp.tag}] ${tCamp.nome}`;
            torneio.status = "Finalizado";
          }
        }
      }
    }

    StoragePB.salvarTorneio(torneio);
  },

  adicionarJogadorAoTime: (timeId, nickname) => {
    let torneio = StoragePB.getTorneio();
    let timesGlobais = StoragePB.getTimesGlobais ? StoragePB.getTimesGlobais() : StoragePB.getTimes();

    const novoPlayer = {
      id: "p_" + Date.now() + Math.random().toString(36).substr(2, 4),
      nickname: nickname
    };

    let timeGlobal = timesGlobais.find(t => t.id === timeId);
    if (timeGlobal) {
      if (!timeGlobal.players) timeGlobal.players = [];
      timeGlobal.players.push(novoPlayer);
      if(StoragePB.saveTimesGlobais) StoragePB.saveTimesGlobais(timesGlobais);
      else localStorage.setItem('pb_times', JSON.stringify(timesGlobais));
    }

    if (torneio) {
      if (torneio.times_gerais) {
        let timeTorneio = torneio.times_gerais.find(t => t.id === timeId);
        if (timeTorneio) {
          if (!timeTorneio.players) timeTorneio.players = [];
          timeTorneio.players.push(novoPlayer);
        }
      }

      torneio.partidas.forEach(p => {
        if (p.timeA && p.timeA.id === timeId) {
          if (!p.timeA.players) p.timeA.players = [];
          p.timeA.players.push(novoPlayer);
        }
        if (p.timeB && p.timeB.id === timeId) {
          if (!p.timeB.players) p.timeB.players = [];
          p.timeB.players.push(novoPlayer);
        }
      });

      StoragePB.salvarTorneio(torneio);
    }
  }
};
