import { useState } from "react";
import { X, Plus } from "lucide-react";

export default function ModalQuestionario({ isOpen, onClose }) {
  const [periodicidade, setPeriodicidade] = useState("Diária");
  const [horario, setHorario] = useState("");
  const [horarios, setHorarios] = useState([]);

  if (!isOpen) return null;

  const addHorario = () => {
    if (horario && !horarios.includes(horario)) {
      setHorarios([...horarios, horario]);
      setHorario("");
    }
  };

  const salvarDados = async () => {
    const payload = { periodicidade, horarios };

    try {
      const res = await fetch("http://localhost:5000/api/questionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Dados salvos com sucesso!");
        onClose();
      } else {
        alert("Erro ao salvar!");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com servidor.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-gray-200 rounded-2xl p-6 w-[450px] relative shadow-lg">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black hover:text-red-600"
        >
          <X size={20} />
        </button>

        <h2 className="font-bold text-lg mb-4">Geração de Questionários</h2>

        {/* Periodicidade */}
        <div className="mb-4 flex items-center">
          <label className="w-32 font-medium">Periodicidade:</label>
          <select
            value={periodicidade}
            onChange={(e) => setPeriodicidade(e.target.value)}
            className="border px-3 py-1 rounded w-40"
          >
            <option value="Diária">Diária</option>
            <option value="Semanal">Semanal</option>
          </select>
        </div>

        {/* Horários */}
        <div className="flex items-center mb-3">
          <label className="w-32 font-medium">Horário:</label>
          <input
            type="time"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="border px-3 py-1 rounded w-32"
          />
          <button
            onClick={addHorario}
            className="ml-3 text-gray-600 hover:text-black"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Lista de horários */}
        <ul className="ml-32 mb-4 list-disc text-sm">
          {horarios.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>

        {/* Salvar */}
        <button
          onClick={salvarDados}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
