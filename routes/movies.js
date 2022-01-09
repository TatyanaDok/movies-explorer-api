const router = require('express').Router();
const {
  createMovieValidator,
  deleteMovieValidator,
} = require('../middlewares/celebrate');
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/movies', getMovies);
router.post('/movies', createMovieValidator, createMovie);
router.delete('/movies/:movieId', deleteMovieValidator, deleteMovie);

module.exports = router;
