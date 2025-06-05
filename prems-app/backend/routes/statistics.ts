import { Router } from 'express';
import QuestionnaireResponse from '../models/questionnaireResponse';


const router = Router();

type StatsGroup = {
  enfermagem: number[];
  medico: number[];
  ambiente: number[];
  satisfacao: number[];
};

type MonthlyStats = Record<string, {
  europep: StatsGroup;
  hcahps: StatsGroup;
  combined: StatsGroup;
}>;

const getMonthKey = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

function extractAnswers(items: any[], groupId: string): number[] {
  const group = items.find(i => i.linkId === groupId);
  if (!group?.item) return [];
  return group.item
    .flatMap((q: { answer: any[] }) => q.answer?.map((a: any) => a.valueInteger).filter((v: number) => typeof v === 'number') ?? []);
}

function extractAnswersOnly(items: any[], groupId: string, only: string[]): number[] {
  const group = items.find(i => i.linkId === groupId);
  if (!group?.item) return [];
  return group.item
    .filter((q: any) => only.includes(q.linkId))
    .flatMap((q: any) => q.answer?.map((a: any) => a.valueInteger).filter((v: number) => typeof v === 'number') ?? []);
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

      const practitionerExt = resItem.extension?.find((e: any) =>
        e.url === 'http://hl7.org/fhir/StructureDefinition/practitioner'
      );
      const areaCode = practitionerExt?.valueReference?.display || 'UNK';

      const isMedico = areaCode === 'MD';
      const isEnfermeiro = areaCode === 'RN';

      if (!stats[monthKey]) {
        stats[monthKey] = {
          europep: { enfermagem: [], medico: [], ambiente: [], satisfacao: [] },
          hcahps: { enfermagem: [], medico: [], ambiente: [], satisfacao: [] },
          combined: { enfermagem: [], medico: [], ambiente: [], satisfacao: [] }
        };
      }

    const targetGroups: Array<'europep' | 'hcahps' | 'combined'> = [];
    if (isEuropep) targetGroups.push('europep');
    if (isHcahps) targetGroups.push('hcahps');
    targetGroups.push('combined');

    for (const group of targetGroups) {
         const current = stats[monthKey][group];

        if (isEnfermeiro && (isEuropep || isHcahps)) {
          current.enfermagem.push(...extractAnswers(resItem.item, 'grp1'));
        }

        if (isMedico && isEuropep) {
          current.medico.push(...extractAnswers(resItem.item, 'grp1'));
        }
        if (isMedico && isHcahps) {
          current.medico.push(...extractAnswers(resItem.item, 'grp2'));
        }

        if (isEuropep) {
          current.ambiente.push(...extractAnswersOnly(resItem.item, 'grp3', ['22', '23']));
          current.satisfacao.push(...extractAnswersOnly(resItem.item, 'grp3', ['24']));
        }

        if (isHcahps) {
          current.ambiente.push(...extractAnswers(resItem.item, 'grp3'));
          current.satisfacao.push(...extractAnswersOnly(resItem.item, 'grp6', ['24']));
        }
      }
    }

    const result = Object.entries(stats).flatMap(([month, data]) => [
      {
        month,
        source: 'europep',
        enfermagem: average(data.europep.enfermagem),
        medico: average(data.europep.medico),
        ambiente: average(data.europep.ambiente),
        satisfacao: average(data.europep.satisfacao)
      },
      {
        month,
        source: 'hcahps',
        enfermagem: average(data.hcahps.enfermagem),
        medico: average(data.hcahps.medico),
        ambiente: average(data.hcahps.ambiente),
        satisfacao: average(data.hcahps.satisfacao)
      },
      {
        month,
        source: 'combined',
        enfermagem: average(data.combined.enfermagem),
        medico: average(data.combined.medico),
        ambiente: average(data.combined.ambiente),
        satisfacao: average(data.combined.satisfacao)
      }
    ]);

    res.json(result);
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    res.status(500).json({ error: 'Erro ao calcular estatísticas' });
  }
});

export default router;
