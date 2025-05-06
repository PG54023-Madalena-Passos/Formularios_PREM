import React, { useEffect, useState } from 'react';
import axios from 'axios';


interface Patient {
  id: string;
  text: {
    div: string;
  };
}

const AllPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    axios.get<Patient[]>('http://localhost:5000/api/patient')
      .then(response => {
        setPatients(response.data);
      })
      .catch(error => {
        console.error('Error fetching patients data:', error);
      });
  }, []);

  if (patients.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Todos os Pacientes</h1>
      <ul>
        {patients.map((patient) => (
          <li key={patient.id}>
            {patient.text.div}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllPatients;