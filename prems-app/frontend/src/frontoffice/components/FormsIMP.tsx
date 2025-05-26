import React, { useState, useEffect } from 'react';
import '../components/FormsInternamento.css';
import questionnaireData from '../data/hcahps.json';
import PaginaMensagem from './MessagePage';
import { mensagens } from '../templates/messages';

interface FormularioInternamentoProps {
  onAnterior: () => void;
  onProximo: () => void;
}

interface AnswerOption {
  valueString: string;
  valueInteger?: number;
}

interface QuestionItem {
  linkId: string;
  text: string;
  type: string;
  answerOption?: AnswerOption[];
  item?: QuestionItem[];
  enableWhen?: EnableWhenCondition[]; // Adicionando a propriedade para condições
}

// Nova interface para condições de exibição
interface EnableWhenCondition {
  question: string;     // ID da pergunta de referência
  operator: string;     // Tipo de operador (=, !=, etc)
  answer: string;       // Resposta que ativa a condição
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
  [key: string]: number | string | null;
}

const FormularioInternamento: React.FC<FormularioInternamentoProps> = ({ onAnterior, onProximo }) => {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [respostas, setRespostas] = useState<RespostasFormulario>({});
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  useEffect(() => {
    // Carrega o questionário do arquivo JSON
    const fetchQuestionnaire = async () => {
      try {
        setQuestionnaire(questionnaireData);
        
        // Inicializa respostas com null para todas as perguntas
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
    
    // Scrollar para o topo quando o componente for montado
    window.scrollTo(0, 0);
  }, []);

  // Scroll para o topo quando mudar de grupo
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentGroupIndex]);

  const handleRespostaChange = (questionId: string, resposta: number | string) => {
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
      const pathname = window.location.pathname;
      const ultimaParteUrl = pathname.split('/').filter(Boolean).pop() || '';
      console.log(ultimaParteUrl);

      const respostasFormatadas = {
        tipo:"IMP",
        q_id: ultimaParteUrl,
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


  // Verifica se uma pergunta deve ser exibida com base nas condições
  const shouldDisplayQuestion = (question: QuestionItem): boolean => {
    // Se não tiver condições, sempre mostra a pergunta
    if (!question.enableWhen || question.enableWhen.length === 0) {
      return true;
    }

    // Verifica todas as condições (assumindo que todas precisam ser verdadeiras - AND lógico)
    return question.enableWhen.every(condition => {
      const referencedAnswer = respostas[condition.question];
      
      // Se não há resposta ainda para a pergunta de referência, não mostra
      if (referencedAnswer === null) {
        return false;
      }

      switch (condition.operator) {
        case '=':
          return referencedAnswer === condition.answer;
        case '!=':
          return referencedAnswer !== condition.answer;
        default:
          console.warn(`Operador desconhecido: ${condition.operator}`);
          return true;
      }
    });
  };

  // Calcular próxima pergunta a ser exibida quando uma resposta leva a pular
  const handleNextQuestionBasedOnSkipLogic = (questionId: string, resposta: string) => {
    handleRespostaChange(questionId, resposta);
    
    // Aqui você pode adicionar lógica para pular para perguntas específicas com base na resposta
    // Exemplo específico para a pergunta 12 mencionada no seu exemplo
    if (questionId === '12' && resposta === 'Não') {
      // Se a resposta for "Não" na pergunta 12, marca as perguntas 13 como puladas (se existir)
      if (respostas['13'] !== undefined) {
        setRespostas(prev => ({
          ...prev,
          '13': null // Considerando que você quer limpar/pular a resposta da pergunta 13
        }));
      }
    }
  };

  // Calcular progresso
  const calcularProgresso = () => {
    if (!questionnaire) return { totalPerguntas: 0, respondidas: 0 };
    
    let totalPerguntas = 0;
    let totalRespondidas = 0;
    
    questionnaire.item.forEach(group => {
      if (group.item) {
        group.item.forEach(question => {
          // Só conta perguntas que devem ser exibidas no total
          if (shouldDisplayQuestion(question)) {
            totalPerguntas++;
            if (respostas[question.linkId] !== null) {
              totalRespondidas++;
            }
          }
        });
      }
    });
    
    return {
      totalPerguntas,
      respondidas: totalRespondidas
    };
  };

  // Se o formulário foi enviado, mostra a tela de sucesso
  if (formSubmitted) {
    return <PaginaMensagem {...mensagens.sucesso} />
  }

  if (isLoading) {
    return (
      <>
        <div className="barra-verde-topo"></div>
        <div className="carregando">Carregando questionário...</div>
      </>
    );
  }

  if (!questionnaire) {
    return (
      <>
        <div className="barra-verde-topo"></div>
        <div className="erro">Erro ao carregar o questionário.</div>
      </>
    );
  }

  const currentGroup = questionnaire.item[currentGroupIndex];
  const { totalPerguntas, respondidas } = calcularProgresso();
  const progressoPercentagem = (respondidas / totalPerguntas) * 100;

  return (
    <div className="fundo">
      <div className="barra-verde-topo"></div>
      <div className="formulario-container">
        <h1 className="titulo">{questionnaire.title.toUpperCase()}</h1>
        
        <div className="progresso-container">
          <div className="progresso-wrapper">
            <span className="progresso-texto">{respondidas}/{totalPerguntas} completo</span>
            <div className="barra-progresso">
              <div className="progresso-preenchido" style={{ width: `${progressoPercentagem}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className="secao-perguntas">
          <h2 className="sucesso-titulo">{currentGroup.text}</h2>
          
          {currentGroup.item && currentGroup.item.map((question, index) => {
            // Verifica se a pergunta deve ser exibida com base nas condições
            if (!shouldDisplayQuestion(question)) {
              return null; // Não mostra a pergunta
            }
            
            return (
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
                          checked={respostas[question.linkId] === (option.valueInteger ?? option.valueString)} 
                          onChange={() => handleRespostaChange(
                            question.linkId, 
                            option.valueInteger ?? option.valueString
                          )} 
                        />
                        <span className="radio-custom"></span>
                        <span className="opcao-texto">{option.valueString}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
    </div>
  );
};

export default FormularioInternamento;