document.addEventListener('DOMContentLoaded', () => {
  const leadForm = document.getElementById('leadForm');
  const leadList = document.getElementById('leadList');
  const tabelaComissoes = document.getElementById('tabelaComissoes');

  let leads = JSON.parse(localStorage.getItem('leads')) || [];

  function salvarLeads() {
    localStorage.setItem('leads', JSON.stringify(leads));
  }

  function atualizarLeads() {
    leadList.innerHTML = '';
    tabelaComissoes.innerHTML = '';

    leads.forEach((lead, index) => {
      const div = document.createElement('div');
      div.innerHTML = `${lead.nome} - ${lead.telefone} - ${lead.status} - ${lead.campanha} - Follow-up: ${lead.followup}`;
      leadList.appendChild(div);

      if (lead.status === 'reserva' || lead.status === 'venda') {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${lead.nome}</td>
          <td>${lead.status}</td>
          <td><input type="number" placeholder="R$" value="${lead.comissao || ''}" onchange="atualizarComissao(${index}, this.value)"></td>
          <td><input type="checkbox" ${lead.pago ? 'checked' : ''} onchange="atualizarPagamento(${index}, this.checked)"></td>
        `;
        tabelaComissoes.appendChild(row);
      }
    });

    gerarGraficos();
  }

  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const campanha = document.getElementById('campanha').value;
    const status = document.getElementById('status').value;
    const followup = document.getElementById('followup').value;

    leads.push({ nome, telefone, campanha, status, followup });
    salvarLeads();
    atualizarLeads();
    leadForm.reset();
  });

  window.atualizarComissao = function (index, valor) {
    leads[index].comissao = parseFloat(valor);
    salvarLeads();
    atualizarLeads();
  };

  window.atualizarPagamento = function (index, pago) {
    leads[index].pago = pago;
    salvarLeads();
    atualizarLeads();
  };

  window.showSection = function (id) {
    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  };

  function gerarGraficos() {
    const porStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    const comissoesPorMes = Array(12).fill(0);
    leads.forEach(lead => {
      if (lead.status === 'venda' && lead.comissao) {
        const mes = new Date(lead.followup || new Date()).getMonth();
        comissoesPorMes[mes] += lead.comissao;
      }
    });

    // Gráfico 1 - Conversões por Status
    const ctx1 = document.getElementById('graficoConversao').getContext('2d');
    if (window.chart1) window.chart1.destroy();
    window.chart1 = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: Object.keys(porStatus),
        datasets: [{
          label: 'Leads por Status',
          data: Object.values(porStatus),
          backgroundColor: '#bca07b'
        }]
      }
    });

    // Gráfico 2 - Comissões por Mês
    const ctx2 = document.getElementById('graficoComissaoMensal').getContext('2d');
    if (window.chart2) window.chart2.destroy();
    window.chart2 = new Chart(ctx2, {
      type: 'line',
      data: {
        labels: [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ],
        datasets: [{
          label: 'Comissão R$ por Mês',
          data: comissoesPorMes,
          borderColor: '#222f1d',
          fill: false
        }]
      }
    });
  }

  atualizarLeads();
});
