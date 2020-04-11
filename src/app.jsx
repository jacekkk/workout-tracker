import React from 'react'
import { Container, Button } from '@material-ui/core'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import './app.css'
import Home from './components/home'

const App = () => (
  <Router>
    <Container maxWidth="sm">
      <nav>
        <Link className={'nav-button'} to="/">
          <Button>lol</Button>
        </Link>
        <Link className={'nav-button'} to="about">
          About
        </Link>
      </nav>

      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={Home} />
      </Switch>
    </Container>
  </Router>
)

export default App
