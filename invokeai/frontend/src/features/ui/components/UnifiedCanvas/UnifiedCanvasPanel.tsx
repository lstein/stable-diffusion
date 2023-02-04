// import { Feature } from 'app/features';
import { Feature } from 'app/features';
import BoundingBoxSettings from 'features/parameters/components/AdvancedParameters/Canvas/BoundingBox/BoundingBoxSettings';
import InfillAndScalingSettings from 'features/parameters/components/AdvancedParameters/Canvas/InfillAndScalingSettings';
import SeamCorrectionSettings from 'features/parameters/components/AdvancedParameters/Canvas/SeamCorrection/SeamCorrectionSettings';
import ImageToImageStrength from 'features/parameters/components/AdvancedParameters/ImageToImage/ImageToImageStrength';
import SeedSettings from 'features/parameters/components/AdvancedParameters/Seed/SeedSettings';
import GenerateVariationsToggle from 'features/parameters/components/AdvancedParameters/Variations/GenerateVariations';
import VariationsSettings from 'features/parameters/components/AdvancedParameters/Variations/VariationsSettings';
import MainSettings from 'features/parameters/components/MainParameters/MainParameters';
import ParametersAccordion from 'features/parameters/components/ParametersAccordion';
import ProcessButtons from 'features/parameters/components/ProcessButtons/ProcessButtons';
import PromptInput from 'features/parameters/components/PromptInput/PromptInput';
import InvokeOptionsPanel from 'features/ui/components/InvokeParametersPanel';
import { useTranslation } from 'react-i18next';

export default function UnifiedCanvasPanel() {
  const { t } = useTranslation();

  const unifiedCanvasAccordions = {
    boundingBox: {
      header: `${t('parameters:boundingBoxHeader')}`,
      feature: Feature.BOUNDING_BOX,
      content: <BoundingBoxSettings />,
    },
    seamCorrection: {
      header: `${t('parameters:seamCorrectionHeader')}`,
      feature: Feature.SEAM_CORRECTION,
      content: <SeamCorrectionSettings />,
    },
    infillAndScaling: {
      header: `${t('parameters:infillScalingHeader')}`,
      feature: Feature.INFILL_AND_SCALING,
      content: <InfillAndScalingSettings />,
    },
    seed: {
      header: `${t('parameters:seed')}`,
      feature: Feature.SEED,
      content: <SeedSettings />,
    },
    variations: {
      header: `${t('parameters:variations')}`,
      feature: Feature.VARIATIONS,
      content: <VariationsSettings />,
      additionalHeaderComponents: <GenerateVariationsToggle />,
    },
  };

  return (
    <InvokeOptionsPanel>
      <PromptInput />
      <ProcessButtons />
      <MainSettings />
      <ImageToImageStrength
        label={t('parameters:img2imgStrength')}
        styleClass="main-settings-block image-to-image-strength-main-option"
      />
      <ParametersAccordion accordionInfo={unifiedCanvasAccordions} />
    </InvokeOptionsPanel>
  );
}
