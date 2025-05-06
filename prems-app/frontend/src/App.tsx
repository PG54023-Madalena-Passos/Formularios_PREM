import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormularioInternamento from '../src/frontoffice/components/FormsInternamento';
import FormularioConsulta from '../src/frontoffice/components/FormsConsulta';
import Dashboard from './backoffice/components/DashboardHospital';

function InternamentoPage() {
  const [formularioCompleto, setFormularioCompleto] = useState(false);

  const handleAnterior = () => {
    console.log('Navegação para a página anterior');
  };

  const handleProximo = () => {
    console.log('Formulário completo');
    setFormularioCompleto(true);
  };

  return (
    <div className="App">
      {formularioCompleto ? (
        <div className="formulario-completo">
          <h2>Obrigado por completar o inquérito!</h2>
          <p>As suas respostas foram enviadas com sucesso.</p>
          <button
            className="botao-reiniciar"
            onClick={() => setFormularioCompleto(false)}
          >
            Voltar ao formulário
          </button>
        </div>
      ) : (
        <FormularioInternamento onAnterior={handleAnterior} onProximo={handleProximo} />
      )}
    </div>
  );
}

function ConsultaPage() {
  const [formularioCompleto, setFormularioCompleto] = useState(false);

  const handleAnterior = () => {
    console.log('Voltar da consulta');
  };

  const handleProximo = () => {
    console.log('Formulário consulta completo');
    setFormularioCompleto(true);
  };

  return (
    <div className="App">
      {formularioCompleto ? (
        <div className="formulario-completo">
          <h2>Obrigado por preencher o questionário da consulta!</h2>
          <p>As suas respostas foram registradas com sucesso.</p>
          <button
            className="botao-reiniciar"
            onClick={() => setFormularioCompleto(false)}
          >
            Voltar ao formulário
          </button>
        </div>
      ) : (
        <FormularioConsulta onAnterior={handleAnterior} onProximo={handleProximo} />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/internamento" element={<InternamentoPage />} />
        <Route path="/consulta" element={<ConsultaPage />} />
        <Route path="*" element={<div>404 - Página não encontrada</div>} />
      </Routes>
    </Router>
  );
}

export default App;
