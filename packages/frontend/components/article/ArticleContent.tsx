import parse, {
  domToReact,
  attributesToProps,
  HTMLReactParserOptions,
} from 'html-react-parser';
import {
  Box,
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

const extractText = (node: any) =>
  node.type === 'text' ? (node as any).data : '';

const getNodeText = (node: Element): string => {
  return (
    node.children?.reduce((acc, child) => {
      return acc + extractText(child) + getNodeText(child as any);
    }, extractText(node)) || ''
  );
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

    if (domNode.attribs?.class?.includes('gatsby-highlight'))
      return <>{children}</>;

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
        return <Code>{children}</Code>;
      }
      case 'pre': {
        const isChildCode =
          domNode.children.length === 1 &&
          (domNode.children[0] as any).tagName === 'code';

        if (isChildCode) {
          const text: string = getNodeText(domNode);
          return (
            <Box maxW="full">
              <SyntaxHighlighterWithTheme>{text}</SyntaxHighlighterWithTheme>
            </Box>
          );
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
