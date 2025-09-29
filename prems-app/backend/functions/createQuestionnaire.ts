import { randomUUID } from 'crypto';
import DataModel from '../models/data';
import fetch from 'node-fetch';

interface Encounter {
  id: string;
  class?: {
    code: string 
};
  period?: { end?: string };
  participant?: Array<{
    individual?: { reference: string };
  }>;
  subject?: { reference: string };
  [key: string]: any;
}

export const generateQuestionnairesForYesterday = async () => {
  console.log('🔄 Iniciando geração de Questionnaires para o dia anterior via API FHIR...');

  const now = new Date();
  const startOfYesterday = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 1,
    0, 0, 0, 0
  ));

  const endOfYesterday = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 1,
    23, 59, 59, 999
  ));

  console.log(startOfYesterday + "-" + endOfYesterday);

  const existing = await DataModel.findOne({
    DataEvento: {
      $gte: startOfYesterday,
      $lte: endOfYesterday
    }
  });

  if (existing) {
    console.log('⛔ Já existem questionarios criados para o dia anterior.');
    return;
  }

  try {
    // 1. Buscar todos os encounters finalizados
    const res = await fetch('http://hapifhir:8080/fhir/Encounter?status=finished');
    const bundle : any = await res.json();

    if (!bundle.entry) {
      console.log('⚠️ Nenhum Encounter encontrado.');
      return;
    }

    const encounters: Encounter[] = bundle.entry
    .map((entry: any) => entry.resource)
    .filter((enc: Encounter) => {
      const end = enc?.location?.[0]?.period?.end;
      const code = enc?.class?.code;
      if (!end || !code) return false;

      const endDate = new Date(end);
      const isInDateRange = endDate >= startOfYesterday && endDate <= endOfYesterday;
      const isValidCode = code === 'IMP' || code === 'AMB';

      return isInDateRange && isValidCode;
    });

    console.log(`🔍 Encontrados ${encounters.length} Encounters finalizados ontem.`);
    console.log(encounters);

    for (const encounter of encounters) {
      if (!encounter?.class?.code || !encounter?.location[0].period?.end) {
        console.warn(`⚠️ Encounter ${encounter.id} sem class.code ou period.end. Ignorado.`);
        continue;
      }

      const endDate = new Date(encounter.location[0].period.end);
      if (isNaN(endDate.getTime())) {
        console.warn(`⚠️ period.end inválido no Encounter ${encounter.id}.`);
        continue;
      }

      const profissionais: { profissionalId: string; area: string }[] = [];

      for (const p of encounter.participant || []) {
        const ref = p.individual?.reference || '';
        const profissionalId = ref.split('/')[1] || ref;
        let area = 'UNK';

        if (profissionalId) {
          try {
            const res = await fetch(`http://hapifhir:8080/fhir/${ref}`);

            if (!res.ok) {
            console.error(`❌ Erro ao buscar Practitioner ${ref}: ${res.statusText}`);
            return null;
            }

            const practitioner = await res.json() as any;
            
            area = practitioner?.qualification?.[0]?.code?.coding?.[0]?.code || 'UNK';
          } catch (error) {
            console.error(`❌ Erro ao buscar Practitioner ${profissionalId}:`, error);
          }
        }

        profissionais.push({ profissionalId, area });
      }

      let pacienteEmail: string | undefined = undefined;
      const patientId = encounter.subject?.reference?.split('/')[1];

      if (patientId) {
        try {
          const res = await fetch(`http://hapifhir:8080/fhir/Patient/${patientId}`);
          const patient = await res.json() as any;
          const telecom = patient.telecom || [];
          const emailEntry = telecom.find((t: any) => t.system === 'email');
          if (emailEntry) {
            pacienteEmail = emailEntry.value;
            console.log(`📧 Email do paciente ${patientId}: ${pacienteEmail}`);
          } else {
            console.log(`ℹ️ Paciente ${patientId} sem email.`);
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar paciente ${patientId}:`, error);
        }
      }

      try {
        const newDoc = new DataModel({
          id: randomUUID(),
          code: encounter.class?.code || 'UNK',
          profissionais,
          DataEvento: endDate,
          pacienteEmail,
          enviado: false,
          reforco: false,
          respondido: false
        });

        await newDoc.save();
        console.log(`✅ Questionnaire criado: ${newDoc.id}`);
      } catch (error) {
        console.error(`❌ Erro ao salvar Questionnaire para Encounter ${encounter.id}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Erro geral ao buscar/processar Encounters:', error);
  }
};
