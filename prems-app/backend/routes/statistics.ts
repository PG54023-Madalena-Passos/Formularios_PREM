import { Router } from 'express';
import QuestionnaireResponse from '../models/questionnaireResponse';

const router = Router();

type MonthlyStats = Record<string, {
  enfermagem: number[];
  medico: number[];
  ambiente: number[];
  satisfacao: number[];
}>;

const getMonthKey = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

function extractAnswers(items: any[], groupId: string, exclude: string[] = [], includeOnly?: string[]): number[] {
  const group = items.find(i => i.linkId === groupId);
  if (!group?.item) return [];

  return group.item
    .filter((q: { linkId: string; }) => {
      if (includeOnly) return includeOnly.includes(q.linkId);
      return !exclude.includes(q.linkId);
    })
    .flatMap((q: { answer: any[]; }) => q.answer?.map((a: any) => a.valueInteger).filter((v: number) => typeof v === 'number') ?? []);
}

const average = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

router.get('/statistics', async (req, res) => {
  try {
    const responses = await QuestionnaireResponse.find();

    const stats: MonthlyStats = {};

    for (const resItem of responses) {
      const isEuropep = resItem.questionnaire.includes('europep');
      const isHcahps = resItem.questionnaire.includes('hcahps');
      const monthKey = getMonthKey(resItem.authored);

      const practitionerExt = resItem.extension?.find((e: any) => e.url.includes('practitioner'));
      const practitionerName = practitionerExt?.valueReference?.reference?.display?.toLowerCase() || '';

      const isMedico = practitionerName.includes('dr.') || practitionerName.includes('medico');
      const isEnfermeiro = practitionerName.includes('enfermeiro');

      if (!stats[monthKey]) {
        stats[monthKey] = { enfermagem: [], medico: [], ambiente: [], satisfacao: [] };
      }

      const { enfermagem, medico, ambiente, satisfacao } = stats[monthKey];

      // Cuidados de Enfermagem
      if (isEnfermeiro && (isEuropep || isHcahps)) {
        enfermagem.push(...extractAnswers(resItem.item, 'grp1'));
      }

      // Cuidados Médicos
      if (isMedico && isEuropep) {
        medico.push(...extractAnswers(resItem.item, 'grp1'));
      }
      if (isMedico && isHcahps) {
        medico.push(...extractAnswers(resItem.item, 'grp2'));
      }

      // Ambiente Hospitalar
      if (isEuropep) {
        ambiente.push(...extractAnswers(resItem.item, 'grp3', ['22', '23']));
      }
      if (isHcahps) {
        ambiente.push(...extractAnswers(resItem.item, 'grp3'));
      }

      // Satisfação Geral
      if (isEuropep) {
        satisfacao.push(...extractAnswers(resItem.item, 'grp3', [], ['24']));
      }
      if (isHcahps) {
        satisfacao.push(...extractAnswers(resItem.item, 'grp6', [], ['24']));
      }
    }

    const result = Object.entries(stats).map(([month, values]) => ({
      month,
      enfermagem: average(values.enfermagem),
      medico: average(values.medico),
      ambiente: average(values.ambiente),
      satisfacao: average(values.satisfacao)
    }));

    res.json(result);
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    res.status(500).json({ error: 'Erro ao calcular estatísticas' });
  }
});

export default router;
