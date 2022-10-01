import MainAdvancedOptions from './MainAdvancedOptions';
import MainCFGScale from './MainCFGScale';
import MainHeight from './MainHeight';
import MainIterations from './MainIterations';
import MainSampler from './MainSampler';
import MainSteps from './MainSteps';
import MainWidth from './MainWidth';

export const fontSize = '1.1rem';
export const inputWidth = 'auto';

export default function MainOptions() {
  return (
    <div className="main-options">
      <div className="main-options-list">
        <div className="main-options-row">
          <MainIterations />
          <MainSteps />
          <MainCFGScale />
        </div>
        <div className="main-options-row">
          <MainWidth />
          <MainHeight />
          <MainSampler />
        </div>
        <MainAdvancedOptions />
      </div>
    </div>
  );
}
