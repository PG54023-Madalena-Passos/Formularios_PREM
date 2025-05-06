import React from "react";
import 'survey-core/survey-core.css';
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";

// Inserir tema do frontend do formulário
import { FlatLight } from "survey-core/themes";

// Define o tipo do JSON do questionário
const surveyJSON: Record<string, any> = {
  title: "Survey Example",
  pages: [
    {
      elements: [
        { type: "text", name: "name", title: "What is your name?" }
      ]
    }
  ]
};

const App: React.FC = () => {
  const survey = new Model(surveyJSON);
  survey.applyTheme(FlatLight); // Implementar tema escolhido

  return <Survey model={survey} />;
};

export default App;
