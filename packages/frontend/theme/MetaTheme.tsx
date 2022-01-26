import Head from 'next/head';
import { useColorModeValue, useToken } from '@chakra-ui/system';

export const MetaTheme: React.FC = ({ children }) => {
  const colorKey = useColorModeValue('white', 'gray.800');
  const color = useToken('colors', colorKey);
  return (
    <Head>
      <meta name="theme-color" content={color} />
    </Head>
  );
};
