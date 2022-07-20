export const fontFaces = `
/* nunito-regular - latin */
@font-face {
  font-family: 'Nunito';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('/fonts/nunito-v20-latin-regular.woff2') format('woff2'),
       url('/fonts/nunito-v20-latin-regular.woff') format('woff');
}

/* nunito-700 - latin */
@font-face {
  font-family: 'Nunito';
  font-style: normal;
  font-weight: 700;
  src: local(''),
       url('/fonts/nunito-v20-latin-700.woff2') format('woff2'),
       url('/fonts/nunito-v20-latin-700.woff') format('woff');
}
       
/* OpenDyslexic Regular */
@font-face {
  font-family: 'OpenDyslexic';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('/fonts/OpenDyslexic-Regular.woff') format('woff');
}
      
/* OpenDyslexic Bold */
@font-face {
  font-family: 'OpenDyslexic';
  font-style: normal;
  font-weight: 700;
  src: local(''),
       url('/fonts/OpenDyslexic-Bold.woff') format('woff');
}
       
/* OpenDyslexic Italic */
@font-face {
  font-family: 'OpenDyslexic';
  font-style: italic;
  font-weight: 400;
  src: local(''),
       url('/fonts/OpenDyslexic-Italic.woff') format('woff');
}
       
/* OpenDyslexic Bold Italic */
@font-face {
  font-family: 'OpenDyslexic';
  font-style: italic;
  font-weight: 700;
  src: local(''),
       url('/fonts/OpenDyslexic-Bold-Italic.woff') format('woff');
}
       
/* OpenDyslexic Mono */
@font-face {
  font-family: 'OpenDyslexic Mono';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('/fonts/OpenDyslexicMono-Regular.otf') format('opentype');
}
       
/* source-code-pro-regular - latin */
@font-face {
  font-family: 'Source Code Pro';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('/fonts/source-code-pro-v18-latin-regular.woff2') format('woff2'),
       url('/fonts/source-code-pro-v18-latin-regular.woff') format('woff');
}
`;

export const fonts = {
  body: `"Nunito", system-ui, sans-serif`,
  heading: `"Nunito", system-ui, sans-serif`,
  mono: `"Source Code Pro", monospace`,
};
