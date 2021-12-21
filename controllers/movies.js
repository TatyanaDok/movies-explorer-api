const Movie = require('../models/movie');

const BadRequestError = require('../errors/badRequestErr');
const ForbiddenError = require('../errors/forbiddenErr');
const NotFoundError = require('../errors/notFoundErr');

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    owner: req.user._id,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные');
      }
      throw err;
    })
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;

  Movie.findOne({ owner: req.user._id, movieId })
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм не найден');
      }
      if (movie.owner.toString() !== req.user._id.toString()) {
        throw new ForbiddenError('Вы пытаетесь удалить чужой фильм');
      } else {
        return movie
          .remove()
          .then(() => res.status(200).send({ message: 'Фильм удалён' }));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные');
      }
      throw err;
    })
    .catch(next);
};

module.exports.getMovies = (req, res, next) => {
  const id = req.user._id;
  Movie.find({ owner: id })
    .then((movies) => res.send(movies))
    .catch((err) => {
      if (err.statusCode === 404 || err.statusCode === 403) {
        throw err;
      }
      throw err;
    })
    .catch(next);
};
