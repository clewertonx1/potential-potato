const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = []

function checksNotExistsUserAccount(request, response, next) {
  // Complete aqui
  const {username} = request.body
  
  const user = users.find(user => user.username === username)

  if(user){
    return response.status(400).json({error: "Usuario ja existe"})
  }

  return next()
}

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const {username} = request.headers
  
  const user = users.find(user => user.username === username)

  if(!user){
    return response.status(404).json({error: "User not found"})
  }

  request.user = user
  return next()
}

function checkSExistsTodo(request, response, next){
  const {id}= request.params
  const {user} = request
  
  const todo = user.todos.find(todo => todo.id == id)

  if(!todo){
    return response.status(404).json({error: "Todo not exist"})
  }

  request.todo = todo
  return next()

}

app.post('/users',checksNotExistsUserAccount, (request, response) => {
  const {name, username} = request.body
  const user = { 
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)
  return response.json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const userTodos = user.todos

  return response.status(201).json(userTodos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {user} = request

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }  

  user.todos.push(todo)

  return response.status(201).json(todo)
  
});

app.put('/todos/:id', checksExistsUserAccount, checkSExistsTodo, (request, response) => {
  const {title, deadline} = request.body
  const {todo} = request

  todo.title = title
  todo.deadline = deadline

  return response.status(201).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkSExistsTodo, (request, response) => {
  const {todo} = request
  todo.done = true
  response.status(201).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, checkSExistsTodo, (request, response) => {
  const {todo, user} = request
  user.todos.splice(todo, 1)
  response.status(204).send()
});




module.exports = app;