export const fontFaces = `
/* nunito-regular - latin */
@font-face {
  font-family: 'Nunito';
  font-style: normal;
  font-weight: 400;
  src: local(''),
       url('/fonts/nunito-v20-latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('/fonts/nunito-v20-latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* nunito-700 - latin */
@font-face {
  font-family: 'Nunito';
  font-style: normal;
  font-weight: 700;
  src: local(''),
       url('/fonts/nunito-v20-latin-700.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('/fonts/nunito-v20-latin-700.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}
`;

export const fonts = {
  body: `"Nunito", system-ui, sans-serif`,
  heading: `"Nunito", system-ui, sans-serif`,
};
