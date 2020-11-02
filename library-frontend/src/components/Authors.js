  
import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'
import Select from 'react-select'

const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [ changeBorn, changeResult ] = useMutation(EDIT_AUTHOR)
  const result = useQuery(ALL_AUTHORS)

  useEffect(() => {
    if (changeResult.data && changeResult.data.editAuthor === null) {
      console.log('person not found')
    }
  }, [changeResult.data])

  if (!props.show || result.loading) {
    return null
  }  

  const submit = (event) => {
    event.preventDefault()

    changeBorn({ variables: { name, setBornTo: parseInt(born) } })

    setName('')
    setBorn('')
  }

  const authors = result.data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <Select
          defaultValue={ authors[0].name }
          onChange={ (option) => { setName(option.value) } }
          options={ authors.map(author => { return { value: author.name, label: author.name }; } ) }
        />
        <div>
          born
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default Authors
