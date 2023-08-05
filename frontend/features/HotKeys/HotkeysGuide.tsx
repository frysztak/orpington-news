import React from 'react';
import {
  allHotkeyScopes,
  HotkeyScope,
  hotkeyScopeArticle,
  hotkeyScopeFeed,
} from './scopes';

export interface HotkeysGuideProps {
  scopes?: HotkeyScope;
}

export const HotkeysGuide: React.FC<HotkeysGuideProps> = ({
  scopes = allHotkeyScopes,
}) => {
  return (
    <div>
      {scopes.includes(hotkeyScopeFeed) && (
        <>
          <h2 className="text-xl font-bold leading-loose">Feed</h2>
          <ul className="list-inside list-disc">
            <li>
              <kbd className="kbd">r</kbd> &mdash; refresh Feed
            </li>
            <li>
              <kbd className="kbd">U</kbd> &mdash; mark Feed as read
            </li>
          </ul>
        </>
      )}

      {scopes.includes(hotkeyScopeArticle) && (
        <>
          <h2 className="text-xl font-bold leading-loose">Article</h2>
          <ul className="list-inside list-disc">
            <li>
              <kbd className="kbd">j</kbd> &mdash; next Article
            </li>
            <li>
              <kbd className="kbd">k</kbd> &mdash; previous Article
            </li>
            <li>
              <kbd className="kbd">o</kbd> &mdash; open Article in browser
            </li>
            <li>
              <kbd className="kbd">u</kbd> &mdash; mark Article read/unread
            </li>
            <li>
              <kbd className="kbd">Esc</kbd> &mdash; close Article
            </li>
          </ul>
        </>
      )}
    </div>
  );
};
