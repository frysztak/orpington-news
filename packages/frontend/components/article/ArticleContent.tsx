import { useMemo } from 'react';
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
  Skeleton,
  Image,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { Element } from 'domhandler';

const SyntaxHighlighterWithTheme = dynamic(
  () => import('./SyntaxHighlighterWithTheme'),
  {
    loading: () => <Skeleton w="full" h={40} />,
  }
);

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

const options: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (!('tagName' in domNode)) {
      return;
    }

    const children = domToReact(domNode.children, options);

    if (
      domNode.attribs?.class?.includes('highlight') &&
      domNode.tagName === 'div'
    ) {
      return <>{children}</>;
    }

    switch (domNode.tagName) {
      case 'a': {
        const href = domNode.attribs['href'];

        return (
          <Link
            isExternal={!href?.startsWith('#')}
            href={href}
            color="teal.400"
            overflowWrap="anywhere"
          >
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
        return <UnorderedList maxW="full">{children}</UnorderedList>;
      }
      case 'ol': {
        return <OrderedList maxW="full">{children}</OrderedList>;
      }
      case 'li': {
        return (
          <ListItem ml={4} my={2}>
            {children}
          </ListItem>
        );
      }
      case 'code': {
        return <Code overflowWrap="anywhere">{children}</Code>;
      }
      case 'img': {
        const { src, alt } = domNode.attribs;
        if (!src) {
          return <></>;
        }
        return <Image src={src} alt={alt} />;
      }
      case 'article': {
        return <>{children}</>;
      }
      case 'pre': {
        const isChildCode =
          domNode.children.length === 1 &&
          (domNode.children[0] as any).tagName === 'code';

        if (isChildCode) {
          const text: string = getNodeText(domNode);
          return (
            <Box w="full">
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
  const content = useMemo(() => {
    return html ? (
      parse(html, options)
    ) : (
      <Text as="i" color="gray.500">
        No content
      </Text>
    );
  }, [html]);

  return (
    <VStack w="full" align="flex-start" spacing={4}>
      <>{content}</>
    </VStack>
  );
};
