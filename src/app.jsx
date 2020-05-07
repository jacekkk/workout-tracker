import React, { Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Container,
  Button,
  createMuiTheme,
  CssBaseline,
} from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles'
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
  Link,
} from 'react-router-dom'
import './app.css'
import { Home, Login, Register } from './components'
import { auth } from './db/firebase'

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
})

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState()

  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('authenticated in app component')
      setIsAuthenticated(true)
    } else {
      console.log('not authenticated in app component')
      setIsAuthenticated(false)
    }
  })

  if (isAuthenticated === undefined) return null

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm">
          <nav>
            {isAuthenticated ? (
              <Fragment>
                <Link className={'nav-button'} to="/">
                  <Button>Home</Button>
                  <Button onClick={() => auth.signOut()}>Logout</Button>
                </Link>
              </Fragment>
            ) : (
              <Fragment>
                <Link className={'nav-button'} to="/login">
                  <Button>Login</Button>
                </Link>
                <Link className={'nav-button'} to="/register">
                  <Button>Register</Button>
                </Link>
              </Fragment>
            )}
          </nav>

          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <PrivateRoute
              exact
              path="/"
              component={Home}
              authenticated={isAuthenticated}
            />
          </Switch>
        </Container>
      </ThemeProvider>
    </Router>
  )
}

// A wrapper for <Route> that redirects to the login screen if you're not yet authenticated.
const PrivateRoute = ({
  exact = false,
  path,
  component: Component,
  authenticated,
}) => {
  return (
    <Route
      exact={exact}
      path={path}
      render={(props) =>
        authenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  )
}

PrivateRoute.propTypes = {
  path: PropTypes.string.isRequired,
  component: PropTypes.elementType.isRequired,
  authenticated: PropTypes.bool.isRequired,
  exact: PropTypes.bool,
}

export default App
