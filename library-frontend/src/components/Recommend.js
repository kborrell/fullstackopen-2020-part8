import React, { useEffect, useState } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { ALL_BOOKS, ME } from '../queries'

const Recommend = (props) => {
  const meResult = useQuery(ME)
  const [getBooks, booksResult] = useLazyQuery(ALL_BOOKS)
  const [books, setBooks] = useState([])

  useEffect(() => {
    if (meResult.data) {
      getBooks({ variables: { genre: meResult.data.me.favoriteGenre } })
    }
  }, [meResult.data]) // eslint-disable-line 

  useEffect(() => {
    if (booksResult.data) {
      setBooks(booksResult.data.allBooks)
    }
  }, [booksResult.data])

  if (!props.show || meResult.loading || booksResult.loading) {
    return null
  }

  console.log("BOOKS", books)
  return (
    <div>
      <h2>recommendations</h2>
      <p>book in your favorite genre <b>{meResult.data.me.favoriteGenre}</b></p>
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
          { books.map(b =>
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ) }
        </tbody>
      </table>
    </div>
  )
}

export default Recommend