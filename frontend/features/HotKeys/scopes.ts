export const hotkeyScopeNone = 'none' as const;
export const hotkeyScopeArticle = 'article' as const;
export const hotkeyScopeFeed = 'feed' as const;
export const hotkeyScopeGlobal = 'global' as const;

export const allHotkeyScopes = [
  hotkeyScopeNone,
  hotkeyScopeArticle,
  hotkeyScopeFeed,
  hotkeyScopeGlobal,
];

export type HotkeyScope =
  | typeof hotkeyScopeNone
  | typeof hotkeyScopeArticle
  | typeof hotkeyScopeFeed
  | typeof hotkeyScopeGlobal;
