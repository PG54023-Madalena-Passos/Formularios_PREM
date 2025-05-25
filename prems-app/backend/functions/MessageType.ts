export type TipoMensagem = 'envio' | 'reforco' | 'sucesso';


export function gerarMensagem(tipo: TipoMensagem, link: string): { subject: string; html: string } {
  switch (tipo) {
    case 'envio':
      return {
        subject: 'Questionário de Satisfação de Utente',
        html: `<p>Obrigado pela sua confiança nos nossos serviços. De forma a podermos continuar a melhorar a qualidade dos serviços prestados, pedimos que preencha o seguinte formulário:</p>
               <a href="${link}">${link}</a>`,
      };
    case 'reforco':
      return {
        subject: 'Questionário de Satisfação de Utente',
        html: `<p>Verificamos que ainda não preencheu o questionário enviado anteriormente. Caso tenha oportunidade, agradecemos o preenchimento do mesmo, de modo a continuarmos a melhorar a 
        qualidade dos serviços que prestamos. Questionário disponível em:</p>
               <a href="${link}">${link}</a>`,
      };
      case 'sucesso':
      return {
        subject: 'Questionário de Satisfação de Utente | Submetido com Sucesso',
        html: `<p>Agradecemos a sua participação no nosso questionário! As suas respostas ajudar-nos-ão a continuar a melhorar a qualidade dos nossos serviços.</p>`,
      };
    default:
      throw new Error('Tipo de mensagem inválido.');
  }
}
