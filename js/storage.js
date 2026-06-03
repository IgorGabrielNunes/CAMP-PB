// storage.js
const StoragePB = {
  // Retorna todos os mapas e garante retrocompatibilidade definindo um tipo padrão
  getMapas: function() {
    const mapas = JSON.parse(localStorage.getItem('pb_mapas')) || [];
    return mapas.map(m => {
      if (!m.tipo) m.tipo = 'regular'; // Garante que mapas antigos funcionem como normais
      return m;
    });
  },

  // Retorna APENAS mapas normais para as equipas banirem/escolherem
  getMapasRegulares: function() {
    return this.getMapas().filter(m => m.tipo === 'regular');
  },

  // Retorna APENAS mapas de desempate (Deciders ocultos)
  getMapasDesempate: function() {
    return this.getMapas().filter(m => m.tipo === 'desempate');
  },
  
  // 🎯 CORREÇÃO CRUCIAL: Agora busca os times dentro do objeto central unificado 'pb_torneio'
  getTimes: function() {
    const torneio = this.getTorneio();
    if (torneio && torneio.times) {
      return torneio.times;
    }
    // Caso o torneio não exista mas haja resquício do banco antigo, usa como ponte
    return JSON.parse(localStorage.getItem('pb_times')) || [];
  },
  
  getTorneio: function() {
    return JSON.parse(localStorage.getItem('pb_torneio')) || null;
  },

  salvarTorneio: function(torneio) {
    localStorage.setItem('pb_torneio', JSON.stringify(torneio));
    // Sincroniza também na chave antiga por segurança de carregamento de telas antigas
    if (torneio.times) {
      localStorage.setItem('pb_times', JSON.stringify(torneio.times));
    }
  },

  // 🛡️ NOVA FUNÇÃO: Reseta o campeonato (chaveamento/fases) SEM EXCLUIR OS TIMES E PLAYERS!
  resetarTorneioManterTimes: function() {
    const torneioAtual = this.getTorneio();
    
    if (!torneioAtual) {
      alert("Nenhum torneio em andamento para resetar.");
      return;
    }

    // Preserva a lista de times e jogadores intacta
    const timesSalvos = torneioAtual.times || [];

    // Limpa as partidas, histórico, campeão e redefine o status
    torneioAtual.partidas = [];
    torneioAtual.status = "Aguardando Início";
    torneioAtual.campeao = null;
    torneioAtual.times_gerais = timesSalvos; // Garante o vínculo

    // Salva o objeto limpo de volta
    this.salvarTorneio(torneioAtual);
    
    alert("Campeonato reiniciado com sucesso! Seus times e players foram preservados.");
    location.reload();
  },

  // GERAÇÃO DINÂMICA DO TORNEIO (Mata-Mata ou Fase de Grupos + Playoffs)
  criarTorneio: function(nome, formato) {
    const times = this.getTimes();
    if (times.length < 2) {
      alert("Crie pelo menos 2 equipas antes de gerar um torneio!");
      return false;
    }

    // Mantém a estrutura com a lista de times acoplada permanentemente
    let novoTorneio = {
      nome: nome || "PB Tournament",
      formato: formato, // 'matamata', 'grupos_final' ou 'grupos_playoffs'
      status: "Em Andamento",
      campeao: null,
      times: times,         // 🎯 Importante para a tela de gerenciamento ler
      times_gerais: times,  // Mantém compatibilidade com o motor antigo
      partidas: []
    };

    // Se o formato incluir Fase de Grupos
    if (formato === 'grupos_final' || formato === 'grupos_playoffs') {
      let idContador = 1;
      for (let i = 0; i < times.length; i++) {
        for (let j = i + 1; j < times.length; j++) {
          novoTorneio.partidas.push({
            id: `match_g_${idContador}`,
            fase: 'Fase de Grupos',
            timeA: times[i],
            timeB: times[j],
            placar: { A: 0, B: 0 },
            historico_mapas: [],
            mapas_serie: null,
            mapa3_sorteado: false,
            vencedor_id: null
          });
          idContador++;
        }
      }

      if (formato === 'grupos_final') {
        novoTorneio.partidas.push({
          id: 'match_f_1', fase: 'Final', timeA: null, timeB: null, placar: { A: 0, B: 0 }, historico_mapas: [], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null
        });
      } else if (formato === 'grupos_playoffs') {
        novoTorneio.partidas.push(
          { id: 'match_s_1', fase: 'Semifinal', timeA: null, timeB: null, placar:{A:0,B:0}, historico_mapas:[], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null },
          { id: 'match_s_2', fase: 'Semifinal', timeA: null, timeB: null, placar:{A:0,B:0}, historico_mapas:[], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null },
          { id: 'match_f_1', fase: 'Final', timeA: null, timeB: null, placar:{A:0,B:0}, historico_mapas:[], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null }
        );
      }

    } else {
      // Formato clássico Mata-Mata direto (Chaveamento Seco)
      if (times.length <= 4) {
        novoTorneio.partidas = [
          { id: 'match_s_1', fase: 'Semifinal', timeA: times[0] || null, timeB: times[1] || null, placar:{A:0,B:0}, historico_mapas:[], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null },
          { id: 'match_s_2', fase: 'Semifinal', timeA: times[2] || null, timeB: times[3] || null, placar:{A:0,B:0}, historico_mapas:[], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null },
          { id: 'match_f_1', fase: 'Final', timeA: null, timeB: null, placar:{A:0,B:0}, historico_mapas:[], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null }
        ];
      } else {
        novoTorneio.partidas = [
          { id: 'match_q_1', fase: 'Quartas', timeA: times[0] || null, timeB: times[1] || null, placar:{A:0,B:0}, historico_mapas:[], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null },
          { id: 'match_q_2', fase: 'Quartas', timeA: times[2] || null, timeB: times[3] || null, placar:{A:0,B:0}, historico_mapas:[], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null },
          { id: 'match_q_3', fase: 'Quartas', timeA: times[4] || null, timeB: times[5] || null, placar:{A:0,B:0}, historico_mapas:[], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null },
          { id: 'match_q_4', fase: 'Quartas', timeA: times[6] || null, timeB: times[7] || null, placar:{A:0,B:0}, historico_mapas:[], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null },
          
          { id: 'match_s_1', fase: 'Semifinal', timeA: null, timeB: null, placar:{A:0,B:0}, historico_mapas:[], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null },
          { id: 'match_s_2', fase: 'Semifinal', timeA: null, timeB: null, placar:{A:0,B:0}, historico_mapas:[], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null },
          
          { id: 'match_f_1', fase: 'Final', timeA: null, timeB: null, placar:{A:0,B:0}, historico_mapas:[], mapas_serie: null, mapa3_sorteado: false, vencedor_id: null }
        ];
      }
    }

    this.salvarTorneio(novoTorneio);
    return true;
  },

  // CALCULA A TABELA EXTRAINDO OS DADOS DOS MAPAS E CONFRONTOS
  calcularClassificacao: function() {
    const torneio = this.getTorneio();
    if (!torneio || (torneio.formato !== 'grupos_final' && torneio.formato !== 'grupos_playoffs')) return [];

    const times = this.getTimes();
    let tabela = {};

    times.forEach(t => {
      tabela[t.id] = {
        id: t.id,
        nome: t.nome,
        tag: t.tag,
        vitorias: 0,
        derrotas: 0,
        jogos: 0,
        mapsGanhos: 0,
        mapsPerdidos: 0,
        roundsGanhos: 0,
        roundsPerdidos: 0
      };
    });

    torneio.partidas.forEach(p => {
      let vId = p.vencedor_id;
      if (vId && typeof vId === 'object') vId = vId.id;

      if (p.fase === 'Fase de Grupos' && vId) {
        const idA = p.timeA.id;
        const idB = p.timeB.id;

        tabela[idA].jogos++;
        tabela[idB].jogos++;

        if (vId === idA) {
          tabela[idA].vitorias++;
          tabela[idB].derrotas++;
        } else {
          tabela[idB].vitorias++;
          tabela[idA].derrotas++;
        }

        tabela[idA].mapsGanhos += p.placar.A;
        tabela[idA].mapsPerdidos += p.placar.B;
        tabela[idB].mapsGanhos += p.placar.B;
        tabela[idB].mapsPerdidos += p.placar.A;

        if (p.historico_mapas) {
          p.historico_mapas.forEach(m => {
            tabela[idA].roundsGanhos += parseInt(m.scoreA || 0);
            tabela[idA].roundsPerdidos += parseInt(m.scoreB || 0);
            tabela[idB].roundsGanhos += parseInt(m.scoreB || 0);
            tabela[idB].roundsPerdidos += parseInt(m.scoreA || 0);
          });
        }
      }
    });

    return Object.values(tabela).sort((a, b) => {
      if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
      let saldoMapasA = a.mapsGanhos - a.mapsPerdidos;
      let saldoMapasB = b.mapsGanhos - b.mapsPerdidos;
      if (saldoMapasB !== saldoMapasA) return saldoMapasB - saldoMapasA;
      let saldoRoundsA = a.roundsGanhos - a.roundsPerdidos;
      let saldoRoundsB = b.roundsGanhos - b.roundsPerdidos;
      return saldoRoundsB - saldoRoundsA;
    });
  }
};
