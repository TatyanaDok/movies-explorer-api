module.exports.corsConfig = {
  origin: [
    'https://andjustlikethat.nomoredomains.rocks',
    'http://andjustlikethat.nomoredomains.rocks',
    'http://localhost:3001',
    'http://localhost:3000',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: [
    'Content-Type',
    'Origin',
    'Referer',
    'Accept',
    'Authorization',
  ],
  credentials: true,
};
