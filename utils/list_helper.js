const dummy = (blogs) => {
}

const totalLikes = (blogs) => {
  const totalLikes = blogs.reduce( (sum, val) => {
    return sum + val.likes
  }, 0)

  return totalLikes
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  const favBlog = blogs.reduce( (previous, current) => {
    return (previous.likes > current.likes) ? previous : current
  })

  return {
    title: favBlog.title,
    author: favBlog.author,
    likes: favBlog.likes
  }
}

const mostBlogs = (blogs) => {

  if (blogs.length === 0) return null

  let authors = [ { author: blogs[0].author, blogs: 1} ]

  for (let i = 1; i < blogs.length; i++) {
    for (let j = 0; j < authors.length; j++) {
      if (blogs[i].author === authors[j].author) {
        authors[j].blogs++
      } else if (j === authors.length - 1) {
        authors.push({ author: blogs[i].author, blogs: 0})
      }
    }
  }

  let highest = 0
  let index = 0
  for (let i = 0; i < authors.length; i++) {
    if (authors[i].blogs > highest) {
      highest = authors[i].blogs
      index = i
    }
  }	

  return authors[index]
}

const mostLikes = (blogs) => {

  if (blogs.length === 0) return null

  let authors = [ { author: blogs[0].author, likes: blogs[0].likes } ]

  for (let i = 1; i < blogs.length; i++) {
    for (let j = 0; j < authors.length; j++) {
      if (blogs[i].author === authors[j].author) {
        authors[j].likes += blogs[i].likes
      } else if (j === authors.length - 1) {
        authors.push({ author: blogs[i].author, likes: 0})
      }
    }
  }

  let highest = 0
  let index = 0
  for (let i = 0; i < authors.length; i++) {
    if (authors[i].likes > highest) {
      highest = authors[i].likes
      index = i
    }
  }	

  return authors[index]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}