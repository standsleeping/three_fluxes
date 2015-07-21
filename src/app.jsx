var assign = require('object-assign')

// Actions:
var TodoActions = {
  create: function(text) {
    console.log('TodoActions::create')
    AppDispatcher.handleViewAction({
      actionType: 'TODO_CREATE',
      text: text
    })
  }
}

// Dispatcher
var Dispatcher = require('flux').Dispatcher
var AppDispatcher = assign(new Dispatcher(), {
  handleViewAction: function(action) {
    console.log('AppDispatcher::handleViewAction')
    this.dispatch({
      source: 'VIEW_ACTION',
      action: action
    })
  }
})

// Store
var EventEmitter = require('events').EventEmitter
var _todos = {
  1: {id: 1, done: false, text: 'Number one'},
  2: {id: 2, done: false, text: 'Number two'}
}
var create = function(text) {
  console.log('create!')
  var id = Date.now()
  _todos[id] = {
    id: Date.now(),
    done: false,
    text: text
  }
}
var destroy = function(id) {
  delete _todos[id]
}
var CHANGE_EVENT = 'change'
var TodoStore = assign({}, EventEmitter.prototype, {
  getAll: function() {
    return _todos
  },
  emitChange: function() {
    this.emit(CHANGE_EVENT)
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback)
  },
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback)
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {
    console.log('huh?')
    var action = payload.action
    var text
    console.log(action.actionType)
    switch(action.actionType) {

      case 'TODO_CREATE':
        console.log('TODO_CREATE!')
        text = action.text.trim()
        console.log(text)
        if (text !== '') {
          create(text)
          TodoStore.emitChange()
        }
        break

      case 'TODO_DESTROY':
        destroy(action.id)
        TodoStore.emitChange()
        break
    }

    return true
  })
})

// Components
var getTodoState = function() {
  return {
    allTodos: TodoStore.getAll()
  }
}


var React = require('react')
var TodoApp = React.createClass({
  getInitialState: function() {
    return getTodoState()
  },
  componentDidMount: function() {
    TodoStore.addChangeListener(this._onChange)
  },
  componentWillUnmount: function() {
    TodoStore.removeChangeListener(this._onChange)
  },
  render: function() {
    return <div>
      <Header />
      <List allTodos={this.state.allTodos}/>

          </div>
  },
  _onChange: function() {
    this.setState(getTodoState())
  }
})

var Header = React.createClass({
  render: function() {
    return <span><input onBlur={this.done}></input><button>Enter</button></span>
  },
  done: function() {
    TodoActions.create(event.target.value)
  }
})

var List = React.createClass({
  render: function() {
    var allTodos = this.props.allTodos
    var todos = []
    for (var key in allTodos) {
      todos.push(<TodoItem key={key} todo={allTodos[key]} />)
    }
    return (
      <section id="main">
          <ul id="todo-list">{todos}</ul>
      </section>
    )
  }
})

var TodoItem = React.createClass({
  render: function() {
    var todo = this.props.todo
    return <li>{todo.text}</li>
  }
})

var element = React.createElement(TodoApp, {})
React.render(element, document.querySelector('.container'))
