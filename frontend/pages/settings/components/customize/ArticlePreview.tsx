import { Box, Text } from '@chakra-ui/react';
import { ArticleHeader, ArticleContent } from '@components/article';
import {
  ArticleFontSizeValues,
  ArticleFontFamiliesNames,
  ArticleMonoFontFamiliesNames,
} from '@shared';
import { useFormikContext } from 'formik';
import { articlePreviewData } from './articlePreviewData';
import { CustomizeAppearanceData } from './types';

export const ArticlePreview: React.FC = (props) => {
  const {
    values: { articleFontSize, articleFontFamily, articleMonoFontFamily },
  } = useFormikContext<CustomizeAppearanceData>();

  return (
    <>
      <Text fontWeight="bold" fontSize="lg" fontFamily="heading">
        Article settings preview
      </Text>

      <Box
        rounded="lg"
        shadow="lg"
        bg="white"
        _dark={{
          bg: 'gray.900',
        }}
        maxW={{ base: 'full', md: 'md', lg: '2xl' }}
        sx={{
          '--article-font-size-scale': `${ArticleFontSizeValues[articleFontSize]}`,
          '--article-font-family': ArticleFontFamiliesNames[articleFontFamily],
          '--article-mono-font-family':
            ArticleMonoFontFamiliesNames[articleMonoFontFamily],
        }}
      >
        <ArticleHeader article={articlePreviewData} disableActionButtons />
        <Box w="full" px={4} py={4}>
          <ArticleContent html={articlePreviewData.fullText} />
        </Box>
      </Box>
    </>
  );
};
