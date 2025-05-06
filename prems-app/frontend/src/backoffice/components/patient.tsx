import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface PatientProps {
  patientId: string;
}

interface PatientData {
  id: string;
  text: {
    div: string;
  };
}

const Patient: React.FC<PatientProps> = ({ patientId }) => {
  const [patient, setPatient] = useState<PatientData | null>(null);

  useEffect(() => {
    axios
      .get<PatientData>(`http://localhost:5000/api/patient/${patientId}`)
      .then((response) => {
        setPatient(response.data);
      })
      .catch((error) => {
        console.error('Error fetching patient data:', error);
      });
  }, [patientId]);

  if (!patient) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dados do Paciente</h1>
      <div dangerouslySetInnerHTML={{ __html: patient.text.div }} />
    </div>
  );
};

export default Patient;
