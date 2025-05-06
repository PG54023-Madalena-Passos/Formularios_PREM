import React, { useState, useEffect } from 'react';
import '../components/FormsInternamento.css';
import FormularioSucesso from './FormsSubmetido';
import questionnaireData from '../data/europep.json';

interface FormularioConsultaProps {
  onAnterior: () => void;
  onProximo: () => void;
}

interface AnswerOption {
  valueInteger: number;
  text: string;
}

interface QuestionItem {
  linkId: string;
  text: string;
  type: string;
  answerOption?: AnswerOption[];
  item?: QuestionItem[];
}

interface Questionnaire {
  resourceType: string;
  id: string;
  title: string;
  status: string;
  subjectType: string[];
  item: QuestionItem[];
}

interface RespostasFormulario {
  [key: string]: number | null;
}

const FormularioConsulta: React.FC<FormularioConsultaProps> = ({ onAnterior, onProximo }) => {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [respostas, setRespostas] = useState<RespostasFormulario>({});
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        setQuestionnaire(questionnaireData);
        const initialRespostas: RespostasFormulario = {};
        if (questionnaireData && questionnaireData.item) {
          questionnaireData.item.forEach((group: QuestionItem) => {
            if (group.item) {
              group.item.forEach((question: QuestionItem) => {
                initialRespostas[question.linkId] = null;
              });
            }
          });
        }
        setRespostas(initialRespostas);
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar o questionário:', error);
        setIsLoading(false);
      }
    };

    fetchQuestionnaire();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentGroupIndex]);

  const handleRespostaChange = (questionId: string, resposta: number) => {
    setRespostas(prev => ({
      ...prev,
      [questionId]: resposta
    }));
  };

  const handleAnterior = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
    } else {
      onAnterior();
    }
  };

  const handleProximo = () => {
    if (questionnaire && currentGroupIndex < questionnaire.item.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
    } else {
      // Ao invés de chamar onProximo, definimos formSubmitted como true
      handleSubmitForm();
    }
  };

  const handleSubmitForm = async () => {
    try {
      const respostasFormatadas = {
        tipo:"consulta",
        item: questionnaire!.item.map((group) => {
          const grupoRespostas: { [key: string]: number | string } = { linkId: group.linkId };
          if (group.item) {
            group.item.forEach((question) => {
              grupoRespostas[question.linkId] = respostas[question.linkId] ?? '';
            });
          }
          return grupoRespostas;
        }),
      };

      const response = await fetch('http://localhost:5000/api/respostas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(respostasFormatadas),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar respostas');
      }
      
      // Definir que o formulário foi enviado com sucesso
      setFormSubmitted(true);
      
      // Scroll para o topo para visualizar a mensagem de sucesso
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      // Aqui você pode implementar tratamento de erro, como exibir uma mensagem
    }
  };

  const calcularProgresso = () => {
    if (!questionnaire) return { totalPerguntas: 0, respondidas: 0 };
    let totalPerguntas = 0;
    let totalRespondidas = 0;

    questionnaire.item.forEach(group => {
      if (group.item) {
        totalPerguntas += group.item.length;
        group.item.forEach(question => {
          if (respostas[question.linkId] !== null) {
            totalRespondidas++;
          }
        });
      }
    });

    return {
      totalPerguntas,
      respondidas: totalRespondidas
    };
  };

  if (formSubmitted) {
    return <FormularioSucesso />;
  }

  if (isLoading) {
    return <div className="carregando">Carregando questionário...</div>;
  }

  if (!questionnaire) {
    return <div className="erro">Erro ao carregar o questionário.</div>;
  }

  const currentGroup = questionnaire.item[currentGroupIndex];
  const { totalPerguntas, respondidas } = calcularProgresso();
  const progressoPercentagem = (respondidas / totalPerguntas) * 100;

  return (
    <>
      <div className="barra-verde-topo"></div>
      <div className="formulario-container">
      <h1 className="titulo">INQUÉRITO DE SATISFAÇÃO DO UTENTE</h1>
      
      <div className="progresso-container">
        <div className="progresso-wrapper">
          <span className="progresso-texto">{respondidas}/{totalPerguntas} completo</span>
          <div className="barra-progresso">
            <div className="progresso-preenchido" style={{ width: `${progressoPercentagem}%` }}></div>
          </div>
        </div>
      </div>
      
      <div className="secao-perguntas">
        <h2 className="secao-titulo">{currentGroup.text}</h2>
        
        {currentGroup.item && currentGroup.item.map((question) => (
          <div className="pergunta" key={question.linkId}>
            <p className="pergunta-texto">
              {`${question.linkId}. ${question.text}`}
            </p>
            
            {question.type === 'choice' && question.answerOption && (
              <div className="opcoes-resposta">
                {question.answerOption.map((option, optionIndex) => (
                  <label className="opcao" key={optionIndex}>
                    <input 
                      type="radio" 
                      name={`question_${question.linkId}`} 
                      checked={respostas[question.linkId] === option.valueInteger} 
                      onChange={() => handleRespostaChange(question.linkId, option.valueInteger)} 
                    />
                    <span className="radio-custom"></span>
                    <span className="opcao-texto">{option.text}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="botoes-navegacao">
        <button 
          className="botao-anterior" 
          onClick={handleAnterior}
          disabled={currentGroupIndex === 0}
        >
          Anterior
        </button>
        <button 
          className="botao-proximo" 
          onClick={handleProximo}
        >
          {currentGroupIndex < questionnaire.item.length - 1 ? 'Próximo' : 'Finalizar'}
        </button>
      </div>
    </div>
    </>
  );
};

export default FormularioConsulta;
