import React from 'react';
import { RootState, useAppSelector } from '../../app/store';
import MainOptions from './MainOptions/MainOptions';
import OptionsAccordion from './OptionsAccordion';
import ProcessButtons from './ProcessButtons/ProcessButtons';
import PromptInput from './PromptInput/PromptInput';

export default function WorkPanel() {
  const showAdvancedOptions = useAppSelector(
    (state: RootState) => state.options.showAdvancedOptions
  );
  return (
    <div className="app-options">
      <PromptInput />
      <ProcessButtons />
      <MainOptions />
      {showAdvancedOptions ? <OptionsAccordion /> : null}
    </div>
  );
}
