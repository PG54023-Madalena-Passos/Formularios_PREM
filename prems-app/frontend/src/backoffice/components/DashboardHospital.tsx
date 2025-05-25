import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer 
} from 'recharts';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Monitorar mudanças no tamanho da janela
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determinar layout responsivo
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  
  // Dados para os gráficos
  const lineChartData = [
    { name: 'Jan', Enfermagem: 3.5, Médicos: 3.2, Ambiente: 3.4, Alta: 3.6 },
    { name: 'Fev', Enfermagem: 3.6, Médicos: 3.5, Ambiente: 3.3, Alta: 3.7 },
    { name: 'Mar', Enfermagem: 3.7, Médicos: 3.6, Ambiente: 3.5, Alta: 3.8 },
    { name: 'Abr', Enfermagem: 3.8, Médicos: 3.7, Ambiente: 3.7, Alta: 3.9 },
  ];

  const enfermagemData = [
    { name: 'Cortesia e respeito', value: 3.8 },
    { name: 'Escuta atenta', value: 3.6 },
    { name: 'Explicações claras', value: 3.7 },
  ];

  const medicosData = [
    { name: 'Cortesia e respeito', value: 3.6 },
    { name: 'Escuta atenta', value: 3.5 },
    { name: 'Explicações claras', value: 3.5 },
  ];

  const ambienteData = [
    { name: 'Limpeza', value: 3.5 },
    { name: 'Descanso', value: 3.0 },
    { name: 'Silêncio noturno', value: 3.1 },
  ];

  const pieData = [
    { name: 'Positivo', value: 92 },
    { name: 'Negativo', value: 8 },
  ];

  // Cores para gráficos
  const COLORS = ['#4CAF50', '#FF5252'];

  // Gerar um ID único para cada gráfico (útil para responsividade)
  const chartIds = {
    overview: 'overview-chart',
    enfermagem: 'enfermagem-chart',
    medicos: 'medicos-chart',
    ambiente: 'ambiente-chart',
    recomendacao: 'recomendacao-chart'
  };

  // Configurações responsivas para os gráficos
  const getChartMargins = () => {
    if (isMobile) {
      return { top: 5, right: 10, left: 5, bottom: 5 };
    } else if (isTablet) {
      return { top: 5, right: 20, left: 10, bottom: 5 };
    } else {
      return { top: 5, right: 30, left: 20, bottom: 5 };
    }
  };
  
  const getBarChartMargins = () => {
    if (isMobile) {
      return { top: 5, right: 10, left: 80, bottom: 5 };
    } else if (isTablet) {
      return { top: 5, right: 20, left: 100, bottom: 5 };
    } else {
      return { top: 5, right: 30, left: 120, bottom: 5 };
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="header">
          <div className="logo">
            <img src="/logo_SantoAntonio.png" alt="Logo Santo Antônio" />
          </div>
          <div className="filters">
            <div className="select-container">
              <select className="filter-select">
                <option>Periodicidade</option>
                <option>Mensal</option>
                <option>Trimestral</option>
                <option>Anual</option>
              </select>
            </div>
            <div className="select-container">
              <select className="filter-select">
                <option>Área</option>
                <option>Todas</option>
                <option>Enfermagem</option>
                <option>Médicos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Indicadores principais */}
        <div className="indicators-grid">
          {/* Indicador de Satisfação */}
          <div className="indicator-card satisfaction">
            <div className="indicator-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-award">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>
            <div className="indicator-content">
              <h3 className="indicator-title">Satisfação Geral</h3>
              <div className="indicator-value">
                <span className="value-main">8.6</span>
                <span className="value-max"> </span>
              </div>
              <div className="indicator-comparison positive">
                ↑ vs. período anterior (8.1)
              </div>
            </div>
          </div>

          {/* Indicador de Recomendação */}
          <div className="indicator-card recommendation">
            <div className="indicator-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-thumbs-up">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
            </div>
            <div className="indicator-content">
              <h3 className="indicator-title">Taxa de Recomendação</h3>
              <div className="indicator-value"><span className="value-main">93%</span></div>
              <div className="indicator-comparison positive">
                ↑ vs. período anterior (88%)
              </div>
            </div>
          </div>

          {/* Indicador de Enfermagem */}
          <div className="indicator-card nursing">
            <div className="indicator-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-heart">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <div className="indicator-content">
              <h3 className="indicator-title">Cuidados de Enfermagem</h3>
              <div className="indicator-value">
                <span className="value-main">3.7</span>
                <span className="value-max">/4</span>
              </div>
              <div className="indicator-comparison positive">
                ↑ vs. período anterior (3.6)
              </div>
            </div>
          </div>

          {/* Indicador de Médicos */}
          <div className="indicator-card medical">
            <div className="indicator-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-user">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="indicator-content">
              <h3 className="indicator-title">Cuidados Médicos</h3>
              <div className="indicator-value">
                <span className="value-main">3.7</span>
                <span className="value-max">/4</span>
              </div>
              <div className="indicator-comparison negative">
                ↓ vs. período anterior (3.8)
              </div>
            </div>
          </div>
        </div>

        {/* Visão Geral (Gráfico de linha) */}
        <div className="chart-card overview">
          <h3 className="chart-title">Visão Geral</h3>
          <div className="chart-container line-chart" id={chartIds.overview}>
            <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
              <LineChart
                data={lineChartData}
                margin={getChartMargins()}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#666' }}
                  tickSize={5}
                  axisLine={{ stroke: '#ddd' }}
                  fontSize={isMobile ? 10 : 12}
                />
                <YAxis 
                  domain={[1, 4]} 
                  ticks={[1, 2, 3, 4]} 
                  tick={{ fill: '#666' }}
                  tickSize={5}
                  axisLine={{ stroke: '#ddd' }}
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
                  itemStyle={{ padding: isMobile ? '2px 0' : '4px 0' }}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '10px',
                    fontSize: isMobile ? 10 : 12 
                  }} 
                  iconSize={isMobile ? 8 : 10}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="Enfermagem" 
                  stroke="#E91E63" 
                  strokeWidth={2} 
                  dot={{ r: isMobile ? 3 : 4, fill: '#E91E63' }} 
                  activeDot={{ r: isMobile ? 5 : 6, stroke: '#E91E63', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Médicos" 
                  stroke="#3F51B5" 
                  strokeWidth={2} 
                  dot={{ r: isMobile ? 3 : 4, fill: '#3F51B5' }} 
                  activeDot={{ r: isMobile ? 5 : 6, stroke: '#3F51B5', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Ambiente" 
                  stroke="#FFC107" 
                  strokeWidth={2} 
                  dot={{ r: isMobile ? 3 : 4, fill: '#FFC107' }} 
                  activeDot={{ r: isMobile ? 5 : 6, stroke: '#FFC107', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Alta" 
                  stroke="#2196F3" 
                  strokeWidth={2} 
                  dot={{ r: isMobile ? 3 : 4, fill: '#2196F3' }} 
                  activeDot={{ r: isMobile ? 5 : 6, stroke: '#2196F3', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cuidados de Enfermagem */}
        <div className="chart-card">
          <div className="chart-header nursing">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-heart">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h3 className="chart-title">Cuidados de Enfermagem</h3>
          </div>
          <div className="chart-container bar-chart" id={chartIds.enfermagem}>
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
              <BarChart
                data={enfermagemData}
                layout="vertical"
                margin={getBarChartMargins()}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 4]} 
                  tick={{ fill: '#666' }}
                  tickSize={5}
                  axisLine={{ stroke: '#ddd' }}
                  fontSize={isMobile ? 10 : 12}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: '#666' }}
                  fontSize={isMobile ? 11 : 15}
                  width={isMobile ? 80 : 110}
                  tickMargin={5}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: isMobile ? 10 : 12
                  }}
                  formatter={(value) => [`${value}/4`, 'Avaliação']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#E91E63" 
                  barSize={isMobile ? 15 : 20} 
                  radius={[0, 4, 4, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cuidados Médicos */}
        <div className="chart-card">
          <div className="chart-header medical">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-user">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <h3 className="chart-title">Cuidados Médicos</h3>
          </div>
          <div className="chart-container bar-chart" id={chartIds.medicos}>
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
              <BarChart
                data={medicosData}
                layout="vertical"
                margin={getBarChartMargins()}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 4]} 
                  tick={{ fill: '#666' }}
                  tickSize={5}
                  axisLine={{ stroke: '#ddd' }}
                  fontSize={isMobile ? 10 : 12}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: '#666' }}
                  fontSize={isMobile ? 11 : 15}
                  width={isMobile ? 80 : 110}
                  tickMargin={5}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: isMobile ? 10 : 12
                  }}
                  formatter={(value) => [`${value}/4`, 'Avaliação']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#6366F1" 
                  barSize={isMobile ? 15 : 20} 
                  radius={[0, 4, 4, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ambiente Hospitalar */}
        <div className="chart-card">
          <div className="chart-header environment">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-plus">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <h3 className="chart-title">Ambiente Hospitalar</h3>
          </div>
          <div className="chart-container bar-chart" id={chartIds.ambiente}>
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
              <BarChart
                data={ambienteData}
                layout="vertical"
                margin={getBarChartMargins()}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 4]} 
                  tick={{ fill: '#666' }}
                  tickSize={5}
                  axisLine={{ stroke: '#ddd' }}
                  fontSize={isMobile ? 10 : 12}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: '#666' }}
                  fontSize={isMobile ? 11 : 15}
                  width={isMobile ? 80 : 110}
                  tickMargin={5}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: isMobile ? 10 : 12
                  }}
                  formatter={(value) => [`${value}/4`, 'Avaliação']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#FFC107" 
                  barSize={isMobile ? 15 : 20} 
                  radius={[0, 4, 4, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recomendaria este hospital */}
        <div className="chart-card">
          <div className="chart-header recommendation">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-thumbs-up">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            <h3 className="chart-title">Recomendaria este hospital</h3>
          </div>
          <div className={`recommendation-container ${isMobile ? 'mobile' : ''}`}>
            <div className="pie-chart-container" id={chartIds.recomendacao}>
              <ResponsiveContainer width="100%" height={isMobile ? 150 : 200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 35 : 45}
                    outerRadius={isMobile ? 55 : 65}
                    fill="#8884d8"
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    label={({name, percent}) => isMobile ? null : `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={!isMobile}
                    animationDuration={1000}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      fontSize: isMobile ? 10 : 12
                    }}
                    formatter={(value) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="recommendation-stats">
              <div className="recommendation-percentage">92%</div>
              <div className="recommendation-label">Taxa de Recomendação Positiva</div>
              <div className="recommendation-badge">
                Excelente
              </div>
            </div>
          </div>
        </div>

        {/* Alertas e Recomendações */}
        <div className="chart-card">
          <div className="chart-header alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-alert-triangle">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h3 className="chart-title">Alertas e Recomendações</h3>
          </div>
          
          <div className="alert-item warning">
            <div className="alert-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-alert-triangle">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div className="alert-text">O silêncio noturno recebeu avaliações mais baixas (3.1/4)</div>
          </div>
          
          <div className="alert-item danger">
            <div className="alert-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-alert-triangle">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div className="alert-text">Informações sobre alta hospitalar precisam de melhoria (3.0/4)</div>
          </div>
          
          <div className="alert-item success">
            <div className="alert-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-thumbs-up">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
            </div>
            <div className="alert-text">Cortesia e respeito da enfermagem receberam avaliação muito positiva (3.8/4)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;