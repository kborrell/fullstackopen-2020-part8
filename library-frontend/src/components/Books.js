import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  const [genres, setGenres] = useState([])
  const [books, setBooks] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')

  useEffect(() => {
    if (result.data) {
      var books = result.data.allBooks
      var genres = []
        books.forEach(book => {
          book.genres.forEach(genre => {
            if (!genres.includes(genre))
            {
              genres.push(genre)
            }
          })
        });

      setGenres(genres)
      setBooks(selectedGenre
        ? books.filter(book => book.genres.includes(selectedGenre))
        : books)
    }
  }, [result.data, selectedGenre])

  if (!props.show || result.loading) {
    return null
  }  

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      {genres.map(genre => <button key={genre} onClick={() => setSelectedGenre(genre)}>{genre}</button>)}
    </div>
  )
}

export default Books