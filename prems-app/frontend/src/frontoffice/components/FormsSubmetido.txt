import React from 'react';
import '../components/FormsInternamento.css';

const FormularioSucesso: React.FC = () => {
  return (
    <>
      <div className="barra-verde-topo"></div>
      <div className="formulario-container">
        <h1 className="titulo">INQUÉRITO DE SATISFAÇÃO DO UTENTE</h1>
        
        <div className="secao-sucesso">
          <h2 className="sucesso-titulo">FORMULÁRIO CONCLUÍDO COM SUCESSO!</h2>
          
          <p className="sucesso-mensagem">
            Agradecemos pelo tempo dispendido e por nos ajudar a continuar a melhorar os 
            serviços de saúde prestados.
          </p>
        </div>
      </div>
    </>
  );
};

export default FormularioSucesso;