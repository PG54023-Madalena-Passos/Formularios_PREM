/*import React, { useState } from "react";
import questionnaire from "../data/hcahps_questionnaire.json";

type AnswerOption = {
  valueString: string;
  valueInteger?: number;
};

type QuestionItem = {
  linkId: string;
  text: string;
  type: "choice";
  answerOption: AnswerOption[];
};

type Questionnaire = {
  title: string;
  item: QuestionItem[];
};

const HCAHPSForm: React.FC = () => {
  const formData = questionnaire as Questionnaire;
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Respostas enviadas:", answers);
    // Aqui poderias enviar para uma API, guardar local, etc.
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-6">{formData.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {formData.item.map((question) => (
          <div key={question.linkId} className="bg-white shadow rounded-xl p-4">
            <p className="font-medium mb-4">{question.text}</p>
            <div className="space-y-2">
              {question.answerOption.map((option, idx) => (
                <label key={idx} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={question.linkId}
                    value={option.valueString}
                    checked={answers[question.linkId] === option.valueString}
                    onChange={() => handleChange(question.linkId, option.valueString)}
                    className="accent-blue-600"
                  />
                  <span>{option.valueString}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Enviar Respostas
          </button>
        </div>
      </form>
    </div>
  );
};

export default HCAHPSForm;
*/