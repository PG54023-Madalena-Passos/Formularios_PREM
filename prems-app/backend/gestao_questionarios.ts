// Importante: Posteriormente acrescentar um método para garantir que não há questionnaires duplicados

import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

interface EncounterDocument {
  class: {
    code: string;
  };
  participant?: Array<{
    individual: {
      reference: string;
      display?: string;
    };
  }>;
  period?: {
    end?: string | Date;
    [key: string]: any;
  };
  [key: string]: any;
}

interface QuestionnaireDocument {
  id: string; // UUID (string)
  code: string;
  profissionais: Array<string>;
  DataEvento: Date;
  pacienteEmail?: string;
  enviado: null;
  reforco: null;
  respondido: null; 
}

export const generateQuestionnairesForYesterday = async () => {
  console.log('🔄 Iniciando geração de Questionnaires para o dia anterior...');

  const encounterCollection = mongoose.connection.collection('Encounter');
  const questionnaireCollection = mongoose.connection.collection('Questionnaire');

  // Calcula a data de ontem (00:00 até 23:59)
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


  console.log(`📅 Buscando Encounters de ${startOfYesterday} até ${endOfYesterday}`);

  try {
    const encounters = await encounterCollection.find({
      'period.end': {
        $gte: startOfYesterday,
        $lte: endOfYesterday
      }
    }).toArray();

    console.log(`🔍 Encontrados ${encounters.length} Encounters do dia anterior`);

    for (const encounter of encounters) {
      const fullDocument = encounter as unknown as EncounterDocument;

      if (!fullDocument?.class?.code) {
        console.warn('⚠️ Encounter inserido sem class.code. Ignorado.');
        continue;
      }

      const encounterEnd = fullDocument.period?.end;
      if (!encounterEnd) {
        console.warn('⚠️ Encounter sem period.end. Ignorado.');
        continue;
      }

      const endDate = encounterEnd instanceof Date ? encounterEnd : new Date(encounterEnd);
      if (isNaN(endDate.getTime())) {
        console.warn('⚠️ period.end inválido. Ignorado.');
        continue;
      }

      const profissionais = fullDocument.participant?.map(p => p.individual?.reference) || [];

      let pacienteEmail: string | undefined = undefined;

      const patientReference = fullDocument.subject?.reference;
      if (patientReference && patientReference.startsWith('Patient/')) {
        const patientId = patientReference.split('/')[1];
    
        try {
          const patient = await mongoose.connection.collection('Patient').findOne({ id: patientId });
          if (patient) {
            const telecom = patient.telecom || [];
            const emailEntry = telecom.find((t: any) => t.system === 'email');
            if (emailEntry) {
              pacienteEmail = emailEntry.value;
              console.log(`📧 Email do paciente ${patientId}: ${pacienteEmail}`);
            } else {
              console.log(`ℹ️ Paciente ${patientId} sem email.`);
            }
          } else {
            console.log(`ℹ️ Paciente ${patientId} não encontrado.`);
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar paciente ${patientId}:`, error);
        }
      }
    
      const newQuestionnaire: QuestionnaireDocument = {
        id: randomUUID(),
        code: fullDocument.class.code,
        profissionais,
        DataEvento: endDate,
        pacienteEmail,
        enviado: null,
        reforco: null,
        respondido: null,  
      };
    

      try {
        await questionnaireCollection.insertOne(newQuestionnaire);
        console.log(`✅ Novo Questionnaire criado: ${newQuestionnaire.id} (code: ${newQuestionnaire.code})`);
      } catch (error) {
        console.error('❌ Erro ao criar Questionnaire:', error);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao buscar Encounters:', error);
  }
};
