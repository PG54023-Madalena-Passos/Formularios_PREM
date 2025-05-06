'use client';
import "survey-core/survey-core.css";
import "survey-creator-core/survey-creator-core.css";
import { useState, useEffect } from "react";
import { SurveyCreator } from "survey-creator-react";
import { SurveyCreatorComponent } from "survey-creator-react";
import type { ISurveyCreatorOptions } from "survey-creator-core";

interface SurveyCreatorWidgetProps {
  options?: ISurveyCreatorOptions;
}

export default function SurveyCreatorWidget({ options }: SurveyCreatorWidgetProps) {
  const [creator, setCreator] = useState<SurveyCreator | null>(null);

  useEffect(() => {
    if (!creator) {
      const newCreator = new SurveyCreator(options || {});
      
      // ⚙️ Aqui podes setar as propriedades extra diretamente
      newCreator.showLogicTab = true;
      newCreator.showTranslationTab = true;
      newCreator.collapseOnDrag = true;
      newCreator.isAutoSave = true;

      setCreator(newCreator);
    }
  }, [creator, options]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {creator && <SurveyCreatorComponent creator={creator} />}
    </div>
  );
}
