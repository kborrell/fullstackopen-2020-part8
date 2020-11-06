const { ApolloServer, gql, UserInputError, AuthenticationError, PubSub } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const jwt = require('jsonwebtoken')

const MONGODB_URI ='mongodb+srv://phonebook-app:fullstack-phone-20@phonebook.ho34f.mongodb.net/graphql?retryWrites=true&w=majority'
const JWT_SECRET = 'some-secret'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const pubsub = new PubSub()

const typeDefs = gql`
  type Author {
    name: String!
    born: Int,
    bookCount: Int
    id: ID!
  }

  type User {
    username: String!,
    favoriteGenre: String!,
    id: ID!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!,
    published: Int!,
    author: Author!,
    genres: [String!]!,
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!,
      author: String!,
      published: Int!,
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (_, args) => {
      if (args.genre) {
        return Book.find({ genres: args.genre}).populate('author')
      }
      return Book.find({}).populate('author')
    },
    allAuthors: () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      
      var author = await Author.findOne().where('name').equals(args.author)
      if (!author) {
        author = new Author({ name: args.author })
      }

      const book = new Book({ ...args, author: author })
      try {
        await book.save()
        author.bookCount += 1
        author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      const author = await Author.findOne().where('name').equals(args.name)
      author.born = args.setBornTo
      return author.save();
    },
    createUser: async (root, args) => {
      const user = new User({ ...args })
      try {
        await user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
      return user
    },
    login: async (root, args) => {
      const user = await User.findOne().where('username').equals(args.username)
      if (!user || args.password !== 'secred') {
        throw new UserInputError('wrong credentials')
      }
      const userForToken = {
        username: user.username,
        id: user._id
      }
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser };
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})
