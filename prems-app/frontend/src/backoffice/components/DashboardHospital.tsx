import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer 
} from 'recharts';
import { RefreshCcw, Settings, LogOut , X, Plus } from 'lucide-react';
import EmailPopup from './Popup';

import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

interface MeasureReport {
  _id: string;
  measure: string;
  group: any[];
  period: {
    start: string;
    end: string;
  };
}

type PeriodKey = 'mes-atual' | 'ultimos-3-meses' | 'ultimo-ano';

const Dashboard = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [measureReports, setMeasureReports] = useState<MeasureReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('mes-atual');
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'internamento' | 'consultas'>('todos');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);

  useEffect(() => {
  const role = localStorage.getItem('role');
  setUserRole(role);
  console.log("user role:", role); 
}, []);

  

  // Monitorizar mudanças no tamanho da janela
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carregar dados da API
  useEffect(() => {
    fetchMeasureReports();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchMeasureReports, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchMeasureReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/measurereports');
      if (!response.ok) {
        throw new Error('Erro ao carregar dados');
      }
      const data = await response.json();
      console.log('🔍 Dados recebidos do back-end:', data);
      setMeasureReports(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro desconhecido');
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Função para selecionar o relatório certo com base no filtro selecionado
  function getReportByFilterAndPeriod(
    reports: MeasureReport[],
    filter: 'todos' | 'consultas' | 'internamento',
    period: PeriodKey
  ): MeasureReport | null {
    const source = filter === 'todos' ? 'combined'
                : filter === 'consultas' ? 'europep'
                : 'hcahps';

    let periodSuffix = '';
    switch (period) {
      case 'mes-atual': {
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        periodSuffix = `${year}-${month}`;
        break;
      }
      case 'ultimos-3-meses':
        periodSuffix = 'ultimos-3-meses';
        break;
      case 'ultimo-ano':
        periodSuffix = 'ultimo-ano';
        break;
    }

    return reports.find(r => r.measure.includes(`${source}-${periodSuffix}`)) || null;
  }

  // Função atualizada para obter dados com fallback
  function getReportByFilterAndPeriodWithFallback(
    reports: MeasureReport[],
    filter: 'todos' | 'consultas' | 'internamento',
    period: PeriodKey
  ): { report: MeasureReport | null; isCurrentMonth: boolean; actualPeriod: string } {
    const source = filter === 'todos' ? 'combined'
                : filter === 'consultas' ? 'europep'
                : 'hcahps';

    let periodSuffix = '';
    let isCurrentMonth = true;
    
    switch (period) {
      case 'mes-atual': {
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        periodSuffix = `${year}-${month}`;
        
        // Tentar encontrar dados do mês atual
        let report = reports.find(r => r.measure.includes(`${source}-${periodSuffix}`)) || null;
        
        // Se não encontrar dados do mês atual, procurar o mês mais recente disponível
        if (!report) {
          const monthlyReports = reports
            .filter(r => r.measure.includes(source) && /\d{4}-\d{2}$/.test(r.measure))
            .sort((a, b) => new Date(b.period.start).getTime() - new Date(a.period.start).getTime());
          
          if (monthlyReports.length > 0) {
            report = monthlyReports[0];
            isCurrentMonth = false;
            // Extrair o período do relatório usado
            const match = report.measure.match(/(\d{4}-\d{2})$/);
            periodSuffix = match ? match[1] : 'desconhecido';
          }
        }
        
        return { report, isCurrentMonth, actualPeriod: periodSuffix };
      }
      case 'ultimos-3-meses':
        periodSuffix = 'ultimos-3-meses';
        break;
      case 'ultimo-ano':
        periodSuffix = 'ultimo-ano';
        break;
    }

    const report = reports.find(r => r.measure.includes(`${source}-${periodSuffix}`)) || null;
    return { report, isCurrentMonth: true, actualPeriod: periodSuffix };
  }

  // Função para formatar o período para exibição
  function formatPeriodForDisplay(period: string, isCurrentMonth: boolean): string {
    if (!isCurrentMonth && period.match(/\d{4}-\d{2}/)) {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    }
    return '';
  }

  // Componente para indicar quando está usando dados de período anterior
  const DataPeriodIndicator = ({ isCurrentMonth, actualPeriod, selectedPeriod }: { 
    isCurrentMonth: boolean; 
    actualPeriod: string; 
    selectedPeriod: PeriodKey;
  }) => {
    if (isCurrentMonth || selectedPeriod !== 'mes-atual') return null;
    
    const displayPeriod = formatPeriodForDisplay(actualPeriod, isCurrentMonth);
    
    return (
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '6px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        fontSize: '14px',
        color: '#856404',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>
          Dados do mês atual não disponíveis. Exibindo dados de: <strong>{displayPeriod}</strong>
        </span>
      </div>
    );
  };

  //Obter dados mensais
  function getMonthlyData(
    reports: MeasureReport[],
    filter: 'todos' | 'consultas' | 'internamento'
  ) {
    const source = filter === 'todos' ? 'combined'
                : filter === 'consultas' ? 'europep'
                : 'hcahps';

    const monthlyReports = reports
      .filter(r => r.measure.includes(source) && /\d{4}-\d{2}$/.test(r.measure))
      .sort((a, b) => new Date(a.period.start).getTime() - new Date(b.period.start).getTime());

    return monthlyReports.map(r => {
      const get = (key: string) => getValue(r, key);
      const label = new Date(r.period.start).toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });

      return {
        name: label,
        Enfermagem: get('enfermagem'),
        Médicos: get('medico'),
        Ambiente: get('ambiente'),
        Alta: get('alta'),
      };
    });
  }

  // Valores do mês anterior, para comparação
  function getPreviousMonthReport(
    reports: MeasureReport[],
    filter: 'todos' | 'consultas' | 'internamento'
  ): MeasureReport | null {
    const source = filter === 'todos' ? 'combined'
                : filter === 'consultas' ? 'europep'
                : 'hcahps';

    const monthlyReports = reports
      .filter(r => r.measure.includes(source) && /\d{4}-\d{2}$/.test(r.measure))
      .sort((a, b) => new Date(a.period.start).getTime() - new Date(b.period.start).getTime());

    return monthlyReports.length >= 2 ? monthlyReports[monthlyReports.length - 2] : null;
  }

  // Estilização das tendências
  function TrendIndicator({ atual, anterior }: { atual: number | null; anterior: number | null }) {
    if (atual === null) return null;

    // Se não há dados anteriores, mostrar mensagem
    if (anterior === null) {
      return (
        <div style={{ fontSize: '12px', color: '#95a5a6' }}>
          Sem dados de comparação
        </div>
      );
    }

    let icon = '=';
    let color = '#7f8c8d';

    if (atual > anterior) {
      icon = '↗';
      color = '#008f39';
    } else if (atual < anterior) {
      icon = '↘';
      color = '#eb4a22';
    }

    return (
      <div style={{ fontSize: '12px', color }}>
        {icon} vs. período anterior ({anterior})
      </div>
    );
  }

  function TaxaPositiva({atual}: {atual:number | null}){
    if (atual === null) return null;

    let color = '#eb4a22';
    let text = '';

    if (atual >= 50 && atual < 75) {
      color = '#eeea0f';
      text = 'Taxa de Recomendação Mediana';
    } else if (atual >= 75) {
      color = '#008f39';
      text = 'Taxa de Recomendação Positiva';
    }

    return(
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>
              {atual}%
            </div>
            <div style={{ fontSize: '14px', color }}>
              {text}
            </div>
          </div>
    )
  }

  // Alertas
  function buildAlertInputs(processedData: Record<string, any>) {
    const alerts: { area: string; atual: number }[] = [];

    // Campos diretos
    const camposDiretos: Record<string, string> = {
      enfermagem: "enfermagem",
      medicos: "medicos",
      ambiente: "ambiente",
      satisfacao: "satisfacaoGeral", // renomeado aqui para coincidir com 'areas'
      taxaRecomendacao: "taxaRecomendacao",
      alta: "alta",
    };

    for (const area in camposDiretos) {
      const campoOrigem = camposDiretos[area];
      const valor = processedData[campoOrigem];
      if (typeof valor === "number") {
        alerts.push({ area, atual: valor });
      }
    }

    // Detalhes - Médicos
    const medMap = [
      "medCortesiaRespeito",
      "medEscuta",
      "medComunicacao",
      "medTempo",
    ];
    if (Array.isArray(processedData.medicosDetalhes)) {
      processedData.medicosDetalhes.forEach((item, i) => {
        if (typeof item?.value === "number") {
          alerts.push({ area: medMap[i], atual: item.value });
        }
      });
    }

    // Detalhes - Enfermagem
    const enfMap = [
      "enfCortesiaRespeito",
      "enfEscuta",
      "enfComunicacao",
      "enfTempo",
    ];
    if (Array.isArray(processedData.enfermagemDetalhes)) {
      processedData.enfermagemDetalhes.forEach((item, i) => {
        if (typeof item?.value === "number") {
          alerts.push({ area: enfMap[i], atual: item.value });
        }
      });
    }

    return alerts;
  }

  function alert({area, atual}: {area: string ; atual: number | null}){
    if (atual === null) return null;

    const areas: {[key: string]: { label: string; valor: number } } = {
      enfermagem: { label: "Cuidados de Enfermagem", valor: 5 },
      medicos: { label: "Cuidados Médicos", valor: 5 },
      ambiente: { label: "Ambiente Hospitalar", valor: 5 },
      satisfacao: { label: "Satisfação Geral", valor: 10 },
      taxaRecomendacao: { label: "Taxa de Recomendação", valor: 100 },
      alta: { label: "Processo de Alta", valor: 5 },
      enfCortesiaRespeito: { label: "Cortesia e Respeito por Parte dos Enfermeiros", valor: 5 },
      medCortesiaRespeito: { label: "Cortesia e Respeito por Parte dos Médicos", valor: 5 },
      enfEscuta: { label: "Escuta Atenta por Parte dos Enfermeiros", valor: 5 },
      medEscuta: { label: "Escuta Atenta por Parte dos Médicos", valor: 5 },
      enfComunicacao: { label: "Clareza na Comunicação por Parte dos Enfermeiros", valor: 5 },
      medComunicacao: { label: "Clareza na Comunicação por Parte dos Médicos", valor: 5 },
      enfTempo: { label: "Tempo Disponibilizados por Parte dos Enfermeiros", valor: 5 },
      medTempo: { label: "Tempo Disponibilizado por Parte dos Médicos", valor: 5 },
      limpeza: { label: "Higiene das Instalações", valor: 5 },
      confortoDescanso: { label: "Conforto", valor: 5 },
    };

    if (area in areas){
      let color = '';
      let text = ''; 

      if (atual >= areas[area].valor*0.9){
        console.log(area + ' - ' + atual + ' verde');
        text = 'Indicador ' + areas[area].label + ' recebeu avaliações muito positivas (' + atual.toFixed(2) + ')';
        return(
        <div className="alert-item success">
            <div className="alert-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-thumbs-up">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
            </div>
            <div className="alert-text">{text}</div>
          </div>
        );
         
      } else if(atual >= areas[area].valor*0.4 && atual < areas[area].valor*0.5){
        console.log(area + ' - ' + atual + " amarelo");
        text = 'Indicador ' + areas[area].label + ' recebeu avaliações mais baixas (' + atual.toFixed(2) + ')';

        return(
          <div className="alert-item warning">
              <div className="alert-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-alert-triangle">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div className="alert-text">{text}</div>
          </div>
        );

      } else if(atual < areas[area].valor*0.4){
        console.log(area + ' - ' + atual + " vermelho");
        text = 'Indicador ' + areas[area].label + ' necessita de melhorias (' + atual.toFixed(2) + ')';
      
        return(
          <div className="alert-item danger">
              <div className="alert-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-alert-triangle">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div className="alert-text">{text}</div>
          </div>
        );
        }

      console.log(area + ' - ' + atual)
      return null;
    }
  }

  // 📢 Função para extrair valor de um grupo
  function getValue(report: MeasureReport | null, key: string): number | null {
      if (!report || !Array.isArray(report.group)) return null;

      let entry = report.group.find((g: any) => g.code?.text === key);
      if (entry?.measureScore?.value !== undefined) {
        return entry.measureScore.value;
      }

      entry = report.group.find((g: any) => g.id === key);
      if (entry?.measureScoreQuantity?.value !== undefined) {
        return entry.measureScoreQuantity.value;
      }

      return null;
    }

  const navigate = useNavigate();

  const handleLogout = async () => {
  console.log('LOGOUT');
  localStorage.removeItem('accessToken');
  await fetch('http://localhost:5000/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  navigate('/');
};

  // Usar a função com fallback
  const { report: currentData, isCurrentMonth, actualPeriod } = getReportByFilterAndPeriodWithFallback(measureReports, selectedFilter, selectedPeriod);
  const previousData = getPreviousMonthReport(measureReports, selectedFilter);

  // Determinar layout responsivo
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  //const isDesktop = windowWidth >= 1024;

  const valorRec = getValue(currentData, 'recomendacao');
  const recPos = getValue(currentData, 'taxaRecPos');
  const recNeg = getValue(currentData, 'taxaRecNeg')

  // Dados processados para os gráficos
  const processedData = currentData ? {
    // Indicadores principais
    satisfacaoGeral: getValue(currentData, 'satisfacao'),
    taxaRecomendacao: valorRec !== null ? (valorRec * 100) / 4 : null,
    enfermagem: getValue(currentData, 'enfermagem'),
    medicos: getValue(currentData, 'medico'),
    ambiente: getValue(currentData, 'ambiente'),
    alta: getValue(currentData, 'alta'),

    // Dados detalhados para gráficos
    enfermagemDetalhes: [
      { name: 'Cortesia e respeito', value: getValue(currentData, 'enfCortesiaRespeito') },
      { name: 'Escuta atenta', value: getValue(currentData, 'enfEscuta') },
      { name: 'Clareza na Comunicação', value: getValue(currentData, 'enfComunicacao') },
      { name: 'Tempo Disponibilizado', value: getValue(currentData, 'enfTempo') },
    ].filter(item => item.value !== null),

    medicosDetalhes: [
      { name: 'Cortesia e respeito', value: getValue(currentData, 'medCortesiaRespeito') },
      { name: 'Escuta atenta', value: getValue(currentData, 'medEscuta') },
      { name: 'Clareza na Comunicação', value: getValue(currentData, 'medComunicacao') },
      { name: 'Tempo Disponibilizado', value: getValue(currentData, 'medTempo') },
    ].filter(item => item.value !== null),

    ambienteDetalhes: [
      { name: 'Limpeza', value: getValue(currentData, 'limpeza') },
      { name: 'Conforto e Descanso', value: getValue(currentData, 'confortoDescanso') },
    ].filter(item => item.value !== null),

    recomendacaoData: [
      { name: 'Positivo', value: recPos !==null ? recPos * 100 : null},
      { name: 'Negativo', value: recNeg !==null ? recNeg * 100 : null},
    ]
  } : null;

  // Dados históricos simulados (você pode expandir para buscar dados históricos reais)
  const lineChartData = getMonthlyData(measureReports, selectedFilter);

  // Cores para gráficos
  const COLORS = ['#4CAF50', '#FF5252'];

  // Configurações responsivas para os gráficos
  const getChartMargins = () => {
    if (isMobile) return { top: 5, right: 5, left: 5, bottom: 5 };
    if (isTablet) return { top: 10, right: 15, left: 10, bottom: 5 };
    return { top: 15, right: 30, left: 20, bottom: 5 };
  };
  
  const getBarChartMargins = () => {
    if (isMobile) return { top: 5, right: 5, left: 60, bottom: 5 };
    if (isTablet) return { top: 10, right: 15, left: 90, bottom: 5 };
    return { top: 15, right: 30, left: 120, bottom: 5 };
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Carregando dados...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#e74c3c'
      }}>
        <h2>Erro ao carregar dados</h2>
        <p>{error}</p>
        <button 
          onClick={fetchMeasureReports}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!processedData) {
    return <div>Nenhum dado disponível</div>;
  }
  

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: isMobile ? '1rem' : '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '1rem'
        }}>
          <img 
            src="/logo_SantoAntonio.png" 
            alt="Logo Santo António" 
            style={{ width: '120px', height: 'auto' }} 
          />
          
          {/* Filter dropdowns */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as PeriodKey)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="mes-atual">Mês Atual</option>
              <option value="ultimos-3-meses">Últimos 3 Meses</option>
              <option value="ultimo-ano">Último Ano</option>
            </select>
            
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as 'todos' | 'internamento' | 'consultas')}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="todos">Todos</option>
              <option value="internamento">Internamento</option>
              <option value="consultas">Consultas</option>
            </select>
          </div>

          {/* Icon buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {userRole === "1" && (
            <button
              onClick={() => setIsEmailPopupOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#666',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#666';
              }}
            >
              <Settings size={18} />
            </button>
          )}

          <EmailPopup 
          isOpen={isEmailPopupOpen}
          onClose={() => setIsEmailPopupOpen(false)}
        />

            <button
              onClick={fetchMeasureReports}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#666',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#666';
              }}
            >
              <RefreshCcw size={18} />
            </button>

            

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#666',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#666';
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Indicadores principais */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Indicador de Satisfação */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #f39c12'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#34495e', fontSize: '14px' }}>Satisfação Geral</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12' }}>
              {processedData.satisfacaoGeral !== null ? processedData.satisfacaoGeral.toFixed(1): '—'}<span style={{ fontSize: '1rem', color: '#7f8c8d' }}>/10</span>
            </div>
            {selectedPeriod === 'mes-atual' && processedData.satisfacaoGeral !== null && getValue(previousData, 'satisfacao') !== null && (
            <TrendIndicator 
              atual={processedData.satisfacaoGeral}
              anterior={getValue(previousData, 'satisfacao')}
            />
          )}
          </div>

          {/* Indicador de Recomendação */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #27ae60'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#34495e', fontSize: '14px' }}>Taxa de Recomendação</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
              {processedData.taxaRecomendacao !== null ? processedData.taxaRecomendacao.toFixed(0): '—'}%
            </div>
            {selectedPeriod === 'mes-atual' && processedData.taxaRecomendacao !== null && getValue(previousData, 'recomendacao') !== null && (
            <TrendIndicator 
              atual={processedData.taxaRecomendacao}
              anterior={(getValue(previousData, 'recomendacao') ?? 0) * 100 / 4}
            />
          )}
          </div>

          {/* Indicador de Enfermagem */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #e91e63'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#34495e', fontSize: '14px' }}>Cuidados de Enfermagem</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e91e63' }}>
              {processedData.enfermagem !== null ? processedData.enfermagem.toFixed(1): '—'}<span style={{ fontSize: '1rem', color: '#7f8c8d' }}>/5</span>
            </div>
            {selectedPeriod === 'mes-atual' && processedData.enfermagem !== null && getValue(previousData, 'enfermagem') !== null && (
            <TrendIndicator 
              atual={processedData.enfermagem}
              anterior={getValue(previousData, 'enfermagem')}
            />
          )}
          </div>

          {/* Indicador de Médicos */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #3f51b5'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#34495e', fontSize: '14px' }}>Cuidados Médicos</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3f51b5' }}>
              {processedData.medicos !== null ? processedData.medicos.toFixed(1): '-'}<span style={{ fontSize: '1rem', color: '#7f8c8d' }}>/5</span>
            </div>
            {selectedPeriod === 'mes-atual' && processedData.medicos !== null && getValue(previousData, 'medico') !== null && (
            <TrendIndicator 
              atual={processedData.medicos}
              anterior={getValue(previousData, 'medico')}
            />
          )}
          </div>
        </div>

        {/* Visão Geral (Gráfico de linha) */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#34495e' }}>Visão Geral - Evolução Temporal</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
            <LineChart data={lineChartData} margin={getChartMargins()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#666' }}
                fontSize={isMobile ? 10 : 12}
              />
              <YAxis 
                domain={[3, 5]} 
                tick={{ fill: '#666' }}
                fontSize={isMobile ? 10 : 12}
                width={isMobile ? 25 : 35}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  fontSize: isMobile ? 10 : 12
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '10px',
                  fontSize: isMobile ? 10 : 12 
                }} 
              />
              <Line type="monotone" dataKey="Enfermagem" stroke="#E91E63" strokeWidth={2} />
              <Line type="monotone" dataKey="Médicos" stroke="#3F51B5" strokeWidth={2} />
              <Line type="monotone" dataKey="Ambiente" stroke="#FFC107" strokeWidth={2} />
              <Line type="monotone" dataKey="Alta" stroke="#2196F3" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Grid de gráficos detalhados */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 1fr',
          gap: '2rem'
        }}>
          {/* Cuidados de Enfermagem */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#34495e' }}>Cuidados de Enfermagem</h3>
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
              <BarChart data={processedData.enfermagemDetalhes} layout="vertical" margin={getBarChartMargins()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 5]} tick={{ fill: '#666' }} fontSize={isMobile ? 10 : 12} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#666' }} fontSize={isMobile ? 11 : 13} width={isMobile ? 80 : 110} />
                <Tooltip formatter={(value) => [`${(value as number).toFixed(2)}/5`, 'Avaliação']} />
                <Bar dataKey="value" fill="#E91E63" barSize={isMobile ? 15 : 20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cuidados Médicos */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#34495e' }}>Cuidados Médicos</h3>
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
              <BarChart data={processedData.medicosDetalhes} layout="vertical" margin={getBarChartMargins()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 5]} tick={{ fill: '#666' }} fontSize={isMobile ? 10 : 12} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#666' }} fontSize={isMobile ? 11 : 13} width={isMobile ? 80 : 110} />
                <Tooltip formatter={(value) => [`${(value as number).toFixed(2)}/5`, 'Avaliação']} />
                <Bar dataKey="value" fill="#6366F1" barSize={isMobile ? 15 : 20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ambiente Hospitalar */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#34495e' }}>Ambiente Hospitalar</h3>
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
              <BarChart data={processedData.ambienteDetalhes} layout="vertical" margin={getBarChartMargins()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 5]} tick={{ fill: '#666' }} fontSize={isMobile ? 10 : 12} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#666' }} fontSize={isMobile ? 11 : 13} width={isMobile ? 80 : 110} />
                <Tooltip formatter={(value) => [`${(value as number).toFixed(2)}/5`, 'Avaliação']} />
                <Bar dataKey="value" fill="#FFC107" barSize={isMobile ? 15 : 20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recomendação */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px hsla(0, 0.00%, 0.00%, 0.10)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#34495e' }}>Recomendaria este hospital</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <ResponsiveContainer width="60%" height={isMobile ? 150 : 200}>
                <PieChart>
                  <Pie
                    data={processedData.recomendacaoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 35 : 45}
                    outerRadius={isMobile ? 55 : 65}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {processedData.recomendacaoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${(value as number).toFixed(0)}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <TaxaPositiva 
                atual = {processedData.recomendacaoData[0].value}
              />
            </div>
          </div>
        </div>

        {/* Alertas e Recomendações */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          margin: '2rem 0 0 0',
          minHeight: '200px',
          maxHeight: '500px', // limite se quiser scroll
          overflowY: 'auto'   // scroll se conteúdo for maior que o container
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#34495e' }}>Alertas e Recomendações</h3>

          <div className="alert-list">
            {processedData && buildAlertInputs(processedData).map(({ area, atual }) =>
              alert({ area, atual })
            )}
          </div>
        </div>


        {/* Timestamp da última atualização */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem', 
          color: '#7f8c8d', 
          fontSize: '12px' 
        }}>
          Última atualização: {new Date().toLocaleString('pt-PT')}
        </div>

        

        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Dashboard;