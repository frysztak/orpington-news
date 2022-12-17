import Highlight, { Prism } from 'prism-react-renderer';
import cx from 'classnames';
// thank you https://github.com/FormidableLabs/prism-react-renderer/issues/53#issuecomment-1004292161
// @ts-ignore
(typeof global !== 'undefined' ? global : window).Prism = Prism;
require('prismjs/components/prism-rust');

export interface SyntaxHighlightProps {
  className?: string;
  language?: string;
  code: string;
}

export const SyntaxHighlight: React.FC<SyntaxHighlightProps> = ({
  code,
  language,
  className: additionalClassName,
}) => {
  return (
    <Highlight Prism={Prism} code={code} language={language as any}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={cx(className, additionalClassName)}
          style={style}
          // prevent `move` events from bubbling up.
          // they cause tiny movements of `Article` component (since it supports drag)
          onTouchMove={(event) => event.stopPropagation()}
          onPointerMove={(event) => event.stopPropagation()}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};
