import { useColorModeValue } from '@chakra-ui/react';
import {
  Light as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from 'react-syntax-highlighter';
import atomOneLight from 'react-syntax-highlighter/dist/cjs/styles/hljs/atom-one-light';
import dracula from 'react-syntax-highlighter/dist/cjs/styles/hljs/dracula';
import cpp from 'react-syntax-highlighter/dist/cjs/languages/hljs/cpp';
import js from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/dist/cjs/languages/hljs/typescript';
import xml from 'react-syntax-highlighter/dist/cjs/languages/hljs/xml';
import diff from 'react-syntax-highlighter/dist/cjs/languages/hljs/diff';
import go from 'react-syntax-highlighter/dist/cjs/languages/hljs/go';
import python from 'react-syntax-highlighter/dist/cjs/languages/hljs/python';
import rust from 'react-syntax-highlighter/dist/cjs/languages/hljs/rust';
import sql from 'react-syntax-highlighter/dist/cjs/languages/hljs/sql';
import { ReactFCC } from '@utils/react';

SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('xml', xml);
SyntaxHighlighter.registerLanguage('diff', diff);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('sql', sql);

const C = SyntaxHighlighter as any;

const SyntaxHighlighterWithTheme: ReactFCC<SyntaxHighlighterProps> = ({
  children,
  ...rest
}) => {
  const style = useColorModeValue(atomOneLight, dracula);

  return (
    <C
      {...rest}
      style={style}
      codeTagProps={{
        style: {
          fontFamily: 'var(--article-mono-font-family)',
        },
      }}
    >
      {children}
    </C>
  );
};

export default SyntaxHighlighterWithTheme;
