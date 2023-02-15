import { Box, Radio, Wrap, WrapItem } from '@chakra-ui/react';
import { RadioGroupField } from '@components/forms';
import {
  ArticleFontFamilies,
  ArticleFontFamiliesNames,
  ArticleFontFamily,
  ArticleFontSize,
  ArticleFontSizes,
  ArticleMonoFontFamilies,
  ArticleMonoFontFamiliesNames,
  ArticleMonoFontFamily,
} from '@shared';
import { ArticlePreview } from './ArticlePreview';

const ArticleFontSizesNames: Record<ArticleFontSize, string> = {
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
  xl: 'Extra Large',
};

export const ArticleSettings: React.FC = (props) => {
  return (
    <>
      <RadioGroupField
        label="Article font family"
        name="articleFontFamily"
        stackProps={{
          as: Wrap,
        }}
      >
        {({ getRadioProps }) =>
          ArticleFontFamilies.map((value: ArticleFontFamily) => {
            const radio = getRadioProps({ value });
            return (
              <WrapItem key={value}>
                <Radio {...radio}>{ArticleFontFamiliesNames[value]}</Radio>
              </WrapItem>
            );
          })
        }
      </RadioGroupField>

      <RadioGroupField
        label="Article monospace font family"
        name="articleMonoFontFamily"
        stackProps={{
          as: Wrap,
        }}
      >
        {({ getRadioProps }) =>
          ArticleMonoFontFamilies.map((value: ArticleMonoFontFamily) => {
            const radio = getRadioProps({ value });
            return (
              <WrapItem key={value}>
                <Radio {...radio}>{ArticleMonoFontFamiliesNames[value]}</Radio>
              </WrapItem>
            );
          })
        }
      </RadioGroupField>

      <RadioGroupField
        label="Article font size"
        name="articleFontSize"
        stackProps={{
          as: Wrap,
        }}
      >
        {({ getRadioProps }) =>
          ArticleFontSizes.map((value: ArticleFontSize) => {
            const radio = getRadioProps({ value });
            return (
              <WrapItem key={value}>
                <Radio {...radio}>{ArticleFontSizesNames[value]}</Radio>
              </WrapItem>
            );
          })
        }
      </RadioGroupField>

      <Box maxW="full" display={{ base: 'block', md: 'none' }}>
        <ArticlePreview />
      </Box>
    </>
  );
};
