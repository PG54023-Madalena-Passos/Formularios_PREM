import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import FormularioInternamento from './frontoffice/components/FormsIMP';
import FormularioConsulta from './frontoffice/components/FormsAMB';
import Dashboard from './backoffice/components/DashboardHospital';
import PaginaMensagem from './frontoffice/components/MessagePage';
import { mensagens } from './frontoffice/templates/messages';


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
      <FormularioInternamento onAnterior={handleAnterior} onProximo={handleProximo} />
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

function TipoQuestionario() {
  const { id } = useParams(); // <--- captura o id da URL
  const [tipoQuestionario, setTipoQuestionario] = useState<'IMP' | 'AMB' | null>(null);
  const [linkExpirado, setLinkExpirado] = useState(false);
  const [recursoIndisponivel, setrecursoIndisponivel] = useState(false);
  const [recursoInexistente, setrecursoInexistente] = useState(false);

  useEffect(() => {
    const fetchTipo = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/questionnaire/${id}`);
        const data = await response.json(); 
        console.log(data);

        if (response.status === 410) {
          console.log('🧾 Motivo 410:', data.motivo);

          if (data.motivo === 'respondido') {
            setrecursoIndisponivel(true);
            return;

          } else if (data.motivo === 'expirado') {
            setLinkExpirado(true);
            return;
          }
        }

        if (response.status === 404) {
          setrecursoInexistente(true);
          return;
        }

        if (!response.ok) {
          throw new Error('Erro ao obter o tipo de questionário');
        }

        setTipoQuestionario(data.tipo);
      } catch (error) {
        console.error('Erro ao buscar tipo de questionário:', error);
      }
    };

    fetchTipo();
  }, [id]);

  if (tipoQuestionario === 'IMP') {
    return <InternamentoPage />;
  } else if (tipoQuestionario === 'AMB') {
    return <ConsultaPage />;
  } else if(linkExpirado){
    return <PaginaMensagem {...mensagens.linkExpirado} />;
  } else if(recursoIndisponivel){
  return <PaginaMensagem {...mensagens.recursoIndisponivel} />;
  } else if(recursoInexistente){
  return <PaginaMensagem {...mensagens.recursoInexistente} />;
  } else {
    return <div>Carregando...</div>;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/internamento" element={<InternamentoPage />} />
        <Route path="/consulta" element={<ConsultaPage />} />
        <Route path="/:id" element={<TipoQuestionario />} />
        <Route path="*" element={<div>404 - Página não encontrada</div>} />
      </Routes>
    </Router>
  );
}

export default App;
