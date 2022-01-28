export const Drawer = {
  sizes: {
    full: {
      dialog: {
        maxW: '100vw',
        h: '100vh',
        '@supports(height: -webkit-fill-available)': {
          h: '-webkit-fill-available',
        },
      },
    },
  },
};
