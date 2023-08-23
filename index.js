const express = require('express')
const movies = require('./movies.json')
const crypto = require('node:crypto')
const { validateMovies, validatePartialMovies } = require('./schemes/movies')

const app = express()
app.use(express.json())

app.disable('x-powered-by')

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://192.168.1.30:8080'
]

app.get('/movies', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const target = movies.find(movie => movie.id === id)

  res.json(target)
})

app.post('/movies', (req, res) => {
  const result = validateMovies(req.body)

  if (result.error) return res.status(422).json({ error: JSON.parse(result.error.message) })

  const newMovie = {
    id: crypto.randomUUID(), // uuid v4
    ...result.data
  }

  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  const { id } = req.params

  const movieIndex = movies.findIndex(d => d.id === id)
  if (movieIndex < 0) return res.status(404).json({ error: 'Not foun movie' })

  const deletedMovie = movies.splice(movieIndex, 1)

  res.status(200).json(deletedMovie)
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params

  const dataIndex = movies.findIndex(d => d.id === id)
  if (dataIndex < 0) return res.status(404).json({ error: 'Not found movie' })

  const result = validatePartialMovies(req.body)
  if (result.error) return res.status(422).json({ error: JSON.parse(result.error.message) })

  const movieUpdated = {
    ...movies[dataIndex],
    ...result.data
  }

  movies[dataIndex] = movieUpdated
  res.status(202).json(movieUpdated)
})

app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE')
  }

  res.send(200)
})

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`Server on port http://localhost:${PORT}`)
})

/* Rest es una arquitectura de software, dentro de esta filosofia todo es un recurso (usuario, libro, publicacion de un blog, una imgaen), también existen colecciones de recursos */
