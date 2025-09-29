import Settings from '../models/settings';

export type TipoMensagem = 'envio' | 'reforco' | 'sucesso';

export async function gerarMensagem(tipo: TipoMensagem, link: string)
: Promise<{ subject: string; html: string }> {
  const settings = await Settings.findOne({});
  if (!settings) throw new Error('⚠️ Nenhuma configuração encontrada em Settings');

  let subject = 'Questionário de Satisfação de Utente';
  let textoInicial: string;

  switch (tipo) {
    case 'envio':
      textoInicial = settings.envio || '';
      break;
    case 'reforco':
      textoInicial = settings.reforco || '';
      break;
    case 'sucesso':
      textoInicial = settings.sucesso || '';
      subject = 'Questionário de Satisfação de Utente | Submetido com Sucesso';
      break;
    default:
      throw new Error('Tipo de mensagem inválido.');
  }

  const html =
    tipo === 'sucesso'
      ? `<p>${textoInicial}</p>`
      : `<p>${textoInicial}</p><a href="${link}">${link}</a>`;

  return { subject, html };
}
