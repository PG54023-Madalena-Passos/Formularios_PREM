// Identificar os Encounters do dia anterior e transformá-los em recursos Data anonimizados

import mongoose from 'mongoose';
import { randomUUID } from 'crypto';
import DataModel from '../models/data';

// Estrutura do Encounter
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

export const generateQuestionnairesForYesterday = async () => {
  console.log('🔄 Iniciando geração de Questionnaires para o dia anterior...');

  const encounterCollection = mongoose.connection.collection('Encounter');
  const patientCollection = mongoose.connection.collection('Patient');

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


  console.log(`📅 Procurando Encounters de ${startOfYesterday} até ${endOfYesterday}`);

  // Filtra os questionários com a data de ontem
  const existing = await DataModel.findOne({
  DataEvento: {
    $gte: startOfYesterday,
    $lte: endOfYesterday
    }
  });

  
  // Verificação: Se já existirem questionários com a data do dia anterior na bd estes não são duplicados.
  // É util quando o sistema vai a baixo e é necessário reiniciar. 

  if (existing) {
    console.log('⛔ Já existem questionarios criados para o dia anterior.');
    return;
  }
  else{

    try {
      const encounters = await encounterCollection.find({
        'period.end': {
          $gte: startOfYesterday,
          $lte: endOfYesterday
        }
      }).toArray(); // Faz uma lista de Encounters do dia anterior

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

        const profissionais = [];

        for (const p of fullDocument.participant || []) {
          const ref = p.individual?.reference || '';
          const profissionalId = ref.split('/')[1] || ref;

          let area = 'UNK';

          if (profissionalId) {
            try {
              const practitioner = await mongoose.connection
                .collection('Practitioner')
                .findOne({ id: profissionalId });

              const cod = practitioner?.qualification?.[0]?.code?.coding?.[0]?.code;
              if (cod) area = cod;
            } catch (error) {
              console.error(`❌ Erro ao buscar Practitioner ${profissionalId}:`, error);
            }
          }

          profissionais.push({ profissionalId, area });
        }

        let pacienteEmail: string | undefined = undefined;

        const patientReference = fullDocument.subject?.reference;
        if (patientReference && patientReference.startsWith('Patient/')) {
          const patientId = patientReference.split('/')[1];
      
          try {

            // Vai buscar os contacto de email do utente de cada Encounter recolhido para o dia anterior

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
      
        try {
        const newDoc = new DataModel({
          id: randomUUID(),
          code: fullDocument.class.code,
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
          console.error('❌ Erro ao criar Questionnaire:', error);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar Encounters:', error);
    }}
};
