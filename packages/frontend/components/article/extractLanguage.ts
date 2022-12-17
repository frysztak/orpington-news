import type { Element } from 'html-react-parser';

const classREs = [/language-(\w+)/, /gatsby-code-(\w+)/];
export const extractLanguage = (element: Element): string | undefined => {
  const className = element.attribs?.class;
  for (const classRE of classREs) {
    const match = classRE.exec(className)?.[1];
    if (match) {
      return match;
    }
  }

  const isChildCode = (element.children?.[0] as any).tagName === 'code';
  if (isChildCode) {
    return extractLanguage(element.children[0] as any);
  }
};
