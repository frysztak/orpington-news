export const urlRegex = new RegExp(
  '^(?:([a-z0-9+.-]+)://)(?:S+(?::S*)?@)?(?:(?:[1-9]d?|1dd|2[01]d|22[0-3])(?:.(?:1?d{1,2}|2[0-4]d|25[0-5])){2}(?:.(?:[1-9]d?|1dd|2[0-4]d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*.?)(?::d{2,5})?(?:[/?#]S*)?$'
);
