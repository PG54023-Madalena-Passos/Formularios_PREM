import QuestionnaireResponse from '../models/questionnaireResponse';
import MeasureReport from '../models/measureReport';

const average = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const round2 = (val: number) => Math.round(val * 100) / 100;

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

type SurveyType = 'europep' | 'hcahps' | 'combined';

function emptyStatsGroup() {
  return {
    enfermagem: [], medico: [], ambiente: [], satisfacao: [], recomendacao: [],
    alta: [], cuidadosPrestados: [], enfCortesiaRespeito: [], medCortesiaRespeito: [],
    enfEscuta: [], medEscuta: [], enfComunicacao: [], medComunicacao: [],
    enfTempo: [], medTempo: [], limpeza: [], confortoDescanso: [],
    taxaRecPos: [], taxaRecNeg: []
  } as Record<string, number[]>;
}

function initSurveyStats(): Record<SurveyType, ReturnType<typeof emptyStatsGroup>> {
  return {
    europep: emptyStatsGroup(),
    hcahps: emptyStatsGroup(),
    combined: emptyStatsGroup()
  };
}

export async function generateOrUpdateMonthlyMeasureReports(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth(); // 0-based
  const periodStart = new Date(Date.UTC(year, month, 1));
  const periodEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));

  const responses = await QuestionnaireResponse.find({
    authored: {
      $gte: periodStart.toISOString(),
      $lte: periodEnd.toISOString()
    }
  });

  const stats = initSurveyStats();

  for (const resItem of responses) {
    const isEuropep = resItem.questionnaire.includes('europep');
    const isHcahps = resItem.questionnaire.includes('hcahps');
    const surveyType: SurveyType = isEuropep ? 'europep' : 'hcahps';

    const practitionerExt = resItem.extension?.find((e: any) =>
      e.url === 'http://hl7.org/fhir/StructureDefinition/practitioner');
    const areaCode = practitionerExt?.valueReference?.display || 'UNK';
    const isMedico = areaCode === 'MD';
    const isEnfermeiro = areaCode === 'RN';

    const groupCombined = stats.combined;
    const groupSpecific = stats[surveyType];

    if (isEuropep) {
        const enf = extractAnswers(resItem.item, 'grp1');
        const med = extractAnswers(resItem.item, 'grp1');
        const amb = extractAnswersOnly(resItem.item, 'grp3', ['22', '23']);
        const sat = extractAnswersOnly(resItem.item, 'grp3', ['24']).map(val => val * 10 / 5);
        const cuip = extractAnswers(resItem.item, 'grp2');
        const CR = extractAnswersOnly(resItem.item, 'grp1', ['2','3']);
        const escA = extractAnswersOnly(resItem.item, 'grp1', ['5']);
        const com = extractAnswersOnly(resItem.item, 'grp1', ['4']);
        const tempo = extractAnswersOnly(resItem.item, 'grp1', ['1']);
        const limp = extractAnswersOnly(resItem.item, 'grp3', ['23']);
        const confDesc = extractAnswersOnly(resItem.item, 'grp3', ['22']);


        if (isEnfermeiro) {
          groupSpecific.enfermagem.push(...enf);
          groupCombined.enfermagem.push(...enf);
          groupSpecific.enfCortesiaRespeito.push(...CR);
          groupCombined.enfCortesiaRespeito.push(...CR);
          groupSpecific.enfEscuta.push(...escA);
          groupCombined.enfEscuta.push(...escA);
          groupSpecific.enfComunicacao.push(...com);
          groupCombined.enfComunicacao.push(...com);
          groupSpecific.enfTempo.push(...tempo);
          groupCombined.enfTempo.push(...tempo);
        }
        if (isMedico) {
          groupSpecific.medico.push(...med);
          groupCombined.medico.push(...med);
          groupSpecific.medCortesiaRespeito.push(...CR);
          groupCombined.medCortesiaRespeito.push(...CR);
          groupSpecific.medEscuta.push(...escA);
          groupCombined.medEscuta.push(...escA);
          groupSpecific.medComunicacao.push(...com);
          groupCombined.medComunicacao.push(...com);
          groupSpecific.medTempo.push(...tempo);
          groupCombined.medTempo.push(...tempo);
        }

        groupSpecific.ambiente.push(...amb);
        groupCombined.ambiente.push(...amb);

        groupSpecific.limpeza.push(...limp);
        groupCombined.limpeza.push(...limp);

        groupSpecific.confortoDescanso.push(...confDesc);
        groupCombined.confortoDescanso.push(...confDesc);

        groupSpecific.satisfacao.push(...sat);
        groupCombined.satisfacao.push(...sat);

        groupSpecific.cuidadosPrestados.push(...cuip);
        groupCombined.cuidadosPrestados.push(...cuip);
      }

      if (isHcahps) {
        const enf = extractAnswers(resItem.item, 'grp1').map(val => val * 5 / 4);
        const med = extractAnswers(resItem.item, 'grp2').map(val => val * 5 / 4);
        const amb = extractAnswers(resItem.item, 'grp3').map(val => val * 5 / 4);
        const sat = extractAnswersOnly(resItem.item, 'grp6', ['24']);
        const rec = extractAnswersOnly(resItem.item, 'grp6', ['25']);
        const alt1 = extractAnswersOnly(resItem.item, 'grp5', ['19','20']).map(val => val * 5 / 3);
        const alt2 = extractAnswersOnly(resItem.item, 'grp5', ['22','23']).map(val => val * 5 / 2);
        const cui1 = extractAnswersOnly(resItem.item, 'grp4', ['10','11','13','14','16','17']).map(val => val * 5 / 4);
        const cui2 = extractAnswersOnly(resItem.item, 'grp4', ['18']).map(val => val * 5 / 3);
        const enfCR = extractAnswersOnly(resItem.item, 'grp1', ['1']).map(val => val * 5 / 4);
        const medCR = extractAnswersOnly(resItem.item, 'grp2', ['4']).map(val => val * 5 / 4);
        const enfEsc = extractAnswersOnly(resItem.item, 'grp1', ['2']).map(val => val * 5 / 4);
        const medEsc = extractAnswersOnly(resItem.item, 'grp2', ['5']).map(val => val * 5 / 4);
        const enfCom = extractAnswersOnly(resItem.item, 'grp1', ['3']).map(val => val * 5 / 4);
        const medCom = extractAnswersOnly(resItem.item, 'grp2', ['6']).map(val => val * 5 / 4);
        const limp2 = extractAnswersOnly(resItem.item, 'grp3', ['7']).map(val => val * 5 / 4);
        const confDesc = extractAnswersOnly(resItem.item, 'grp3', ['8','9']).map(val => val * 5 / 4);
        const tRN = extractAnswersOnly(resItem.item, 'grp6', ['25']).filter(value => value === 1 || value === 2);

        
        
        const tRP = extractAnswersOnly(resItem.item, 'grp6', ['25']).filter(value => value === 3 || value === 4);

        

        groupSpecific.enfermagem.push(...enf);
        groupCombined.enfermagem.push(...enf);

        groupSpecific.medico.push(...med);
        groupCombined.medico.push(...med);

        groupSpecific.ambiente.push(...amb);
        groupCombined.ambiente.push(...amb);

        groupSpecific.satisfacao.push(...sat);
        groupCombined.satisfacao.push(...sat);

        groupSpecific.recomendacao.push(...rec);
        groupCombined.recomendacao.push(...rec);

        groupSpecific.alta.push(...alt1, ...alt2);
        groupCombined.alta.push(...alt1, ...alt2);

        groupSpecific.cuidadosPrestados.push(...cui1, ...cui2);
        groupCombined.cuidadosPrestados.push(...cui1, ...cui2);

        groupSpecific.enfCortesiaRespeito.push(...enfCR);
        groupCombined.enfCortesiaRespeito.push(...enfCR);

        groupSpecific.medCortesiaRespeito.push(...medCR);
        groupCombined.medCortesiaRespeito.push(...medCR);

        groupSpecific.enfEscuta.push(...enfEsc);
        groupCombined.enfEscuta.push(...enfEsc);

        groupSpecific.medEscuta.push(...medEsc);
        groupCombined.medEscuta.push(...medEsc);

        groupSpecific.enfComunicacao.push(...enfCom);
        groupCombined.enfComunicacao.push(...enfCom);

        groupSpecific.medComunicacao.push(...medCom);
        groupCombined.medComunicacao.push(...medCom);

        groupSpecific.limpeza.push(...limp2);
        groupCombined.limpeza.push(...limp2);

        groupSpecific.confortoDescanso.push(...confDesc);
        groupCombined.confortoDescanso.push(...confDesc);

        groupSpecific.medComunicacao.push(...medCom);
        groupCombined.medComunicacao.push(...medCom);

        groupSpecific.taxaRecNeg.push(...tRN);
        groupCombined.taxaRecNeg.push(...tRN);

        groupSpecific.taxaRecPos.push(...tRP);
        groupCombined.taxaRecPos.push(...tRP);

      }


  for (const source of ['europep', 'hcahps', 'combined'] as SurveyType[]) {
    const s = stats[source];
    const totalRec = s.taxaRecPos.length + s.taxaRecNeg.length;

    const report = {
      resourceType: 'MeasureReport',
      status: 'complete',
      type: 'summary',
      measure: `Measure/${source}-${year}-${String(month + 1).padStart(2, '0')}`,
      date: new Date().toISOString(),
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString()
      },
      group: Object.entries(s).map(([id, values]) => ({
      id,
      measureScoreQuantity: {
            value: ['taxaRecPos', 'taxaRecNeg'].includes(id)
            ? totalRec > 0
                ? round2(id === 'taxaRecPos'
                ? s.taxaRecPos.length / totalRec
                : s.taxaRecNeg.length / totalRec)
                : null
            : values.length > 0
                ? round2(average(values))
                : null
        }
        }))
    };

    await MeasureReport.findOneAndUpdate(
      {
        measure: report.measure,
        'period.start': report.period.start,
        'period.end': report.period.end
      },
      report,
      { upsert: true, new: true }
    );
  }
}
  console.log(`MeasureReports atualizados para ${year}-${String(month + 1).padStart(2, '0')}`);
}

