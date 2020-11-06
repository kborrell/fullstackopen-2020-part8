
import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Recommend from './components/Recommend'
import { useApolloClient, useSubscription } from '@apollo/client'
import { ALL_BOOKS, BOOK_ADDED } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const updateCacheWithBook = (addedBook) => {
    const includedIn = (set, object) => set.map(b => b.id).includes(object.id)

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks : dataInStore.allBooks.concat(addedBook) }
      })
    }

    addedBook.genres.forEach(genre => {
      try{
        const dataInStore = client.readQuery({ query: ALL_BOOKS, variables: { genre }})
        if (!includedIn(dataInStore.allBooks, addedBook)) {
          client.writeQuery({
            query: ALL_BOOKS,
            variables: { genre },
            data: { allBooks : dataInStore.allBooks.concat(addedBook) }
          })
        }
      } catch (error) {
      }
    });
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      var book = subscriptionData.data.bookAdded
      window.alert(`Added ${book.title} by ${book.author.name}`)
      updateCacheWithBook(book)
    }
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const login = (value) => {
    setToken(value)
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommend')}>recommend</button>
        {!token && <button onClick={() => setPage('login')}>login</button>}
        {token && <button onClick={() => logout()}>logout</button>}
      </div>

      <Authors
        show={page === 'authors'}
      />

      <Books
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
      />

      <Recommend
        show={page === 'recommend'}
      />

      <Login
        setToken={(value) => login(value)}
        show={page === 'login'}
      />

    </div>
  )
}

export default App