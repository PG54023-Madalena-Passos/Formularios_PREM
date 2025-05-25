import React from 'react';
import '../components/FormsInternamento.css';

interface PaginaMensagemProps {
  corBarra: 'verde' | 'laranja' | 'azul' | 'vermelha'; 
  tipo_titulo: 'sucesso-titulo' | 'expirado-titulo' | 'respondido-titulo' | 'inexistente-titulo';
  titulo: string;
  mensagem: string;
}

const PaginaMensagem: React.FC<PaginaMensagemProps> = ({ corBarra, tipo_titulo, titulo, mensagem }) => {
  return (
    <>
      <div className={`barra-${corBarra}-topo`}></div>
      <div className="formulario-container">
        <h1 className="titulo">INQUÉRITO DE SATISFAÇÃO DO UTENTE</h1>

        <div className="secao-sucesso">       
        <h2 className={`${tipo_titulo}`}>{titulo}</h2>
          <p className="sucesso-mensagem">{mensagem}</p>
        </div>
      </div> 
    </>
  );
};

export default PaginaMensagem;
