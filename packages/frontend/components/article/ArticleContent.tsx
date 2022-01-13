import parse, {
  domToReact,
  attributesToProps,
  HTMLReactParserOptions,
} from 'html-react-parser';
import {
  Link,
  Code,
  Text,
  Heading as ChakraHeading,
  Divider,
  VStack,
  UnorderedList,
  OrderedList,
  ListItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { Element } from 'domhandler';
import {
  Light as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from 'react-syntax-highlighter';
import atomOneLight from 'react-syntax-highlighter/dist/cjs/styles/hljs/atom-one-light';
import dracula from 'react-syntax-highlighter/dist/cjs/styles/hljs/dracula';

export interface ArticleContentProps {
  html: string;
}

const getNodeText = (node: Element): string | undefined => {
  return node.children[0]?.type === 'text' && (node.children[0] as any).data;
};

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
const HeadingFontSize: Record<HeadingLevel, string> = {
  h1: 'xl',
  h2: 'lg',
  h3: 'md',
  h4: 'sm',
  h5: 'xs',
};
const Heading: React.FC<{
  domNode: Element;
  level: HeadingLevel;
}> = (props) => {
  const { level, domNode, children } = props;
  const { id } = attributesToProps(domNode.attribs);

  return (
    <ChakraHeading
      as={level}
      size={HeadingFontSize[level]}
      display="flex"
      alignItems="center"
      id={id}
    >
      {children}
    </ChakraHeading>
  );
};

const SyntaxHighlighterWithTheme: React.FC<SyntaxHighlighterProps> = ({
  children,
  ...rest
}) => {
  const style = useColorModeValue(atomOneLight, dracula);

  return (
    <SyntaxHighlighter style={style} {...rest}>
      {children}
    </SyntaxHighlighter>
  );
};

const options: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (!('tagName' in domNode)) {
      return;
    }

    const children = domToReact(domNode.children, options);

    switch (domNode.tagName) {
      case 'a': {
        const href = domNode.attribs['href'];

        return (
          <Link isExternal={!href.startsWith('#')} href={href} color="teal.400">
            {children}
          </Link>
        );
      }
      case 'p': {
        return <Text>{children}</Text>;
      }
      case 'hr': {
        return <Divider />;
      }
      case 'h1': {
        return (
          <Heading level="h1" domNode={domNode}>
            {children}
          </Heading>
        );
      }
      case 'h2': {
        return (
          <Heading level="h2" domNode={domNode}>
            {children}
          </Heading>
        );
      }
      case 'h3': {
        return (
          <Heading level="h3" domNode={domNode}>
            {children}
          </Heading>
        );
      }
      case 'h4': {
        return (
          <Heading level="h4" domNode={domNode}>
            {children}
          </Heading>
        );
      }
      case 'h5': {
        return (
          <Heading level="h5" domNode={domNode}>
            {children}
          </Heading>
        );
      }
      case 'ul': {
        return <UnorderedList>{children}</UnorderedList>;
      }
      case 'ol': {
        return <OrderedList>{children}</OrderedList>;
      }
      case 'li': {
        return (
          <ListItem ml={4} my={2}>
            {children}
          </ListItem>
        );
      }
      case 'code': {
        const isParentPreTag = (domNode.parentNode as any)?.tagName === 'pre';
        if (isParentPreTag) {
          const text: string | undefined = getNodeText(domNode);
          if (text) {
            return (
              <SyntaxHighlighterWithTheme wrapLongLines>
                {text}
              </SyntaxHighlighterWithTheme>
            );
          }
        } else {
          return <Code>{children}</Code>;
        }
      }
    }
  },
};

export const ArticleContent: React.FC<ArticleContentProps> = (props) => {
  const { html } = props;

  return (
    <VStack w="full" align="flex-start" spacing={4}>
      {parse(html, options)}
    </VStack>
  );
};
