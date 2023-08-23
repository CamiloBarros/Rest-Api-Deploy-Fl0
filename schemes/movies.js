const zod = require('zod')

const schemeMovies = zod.object({
  title: zod.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: zod.number().int().min(1900).max(2025),
  director: zod.string(),
  duration: zod.number().positive(),
  rate: zod.number().min(0).max(10).default(1),
  poster: zod.string().url({
    message: 'Poster must be a valid URL'
  }),
  genre: zod.array(
    zod.enum([
      'Drama',
      'Action',
      'Crime',
      'Adventure',
      'Sci-Fi',
      'Romance',
      'Biography',
      'Fantasy'
    ]),
    {
      required_error: 'Movie genre is required',
      invalid_type_error: 'Movie genre must be an array of enum Genre'
    }
  )
})

function validateMovies (object) {
  return schemeMovies.safeParse(object)
}

function validatePartialMovies (object) {
  return schemeMovies.partial().safeParse(object)
}

module.exports = { validateMovies, validatePartialMovies }
