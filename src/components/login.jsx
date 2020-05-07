import React, { useState } from 'react'
import { TextField, Button, Box } from '@material-ui/core'
import { auth } from '../db/firebase'
import { Redirect } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '100%',
      maxWidth: 300,
    },
  },
  button: {
    margin: theme.spacing(1),
  },
}))

const Login = () => {
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [isAuthenticated, setIsAuthenticated] = useState()
  const [firebaseError, setFirebaseError] = useState()
  const classes = useStyles()

  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('authenticated in login component')
      setIsAuthenticated(true)
    } else {
      console.log('not authenticated in login component')
      setIsAuthenticated(false)
    }
  })

  const onSubmit = (e) => {
    e.preventDefault()

    auth
      .signInWithEmailAndPassword(email, password)
      // .then(() => setIsAuthenticated(true))
      .catch((error) => {
        setFirebaseError(error.message)
        console.log(error)
      })
  }

  if (isAuthenticated) return <Redirect to="/" />

  return (
    <form
      className={classes.root}
      noValidate
      autoComplete="off"
      onSubmit={onSubmit}
    >
      <div>{firebaseError}</div>
      <TextField
        display="block"
        fullWidth
        variant="outlined"
        onChange={(e) => setEmail(e.target.value)}
        id="email"
        label="email"
      />
      <TextField
        display="block"
        fullWidth
        variant="outlined"
        onChange={(e) => setPassword(e.target.value)}
        id="password"
        label="password"
        type="password"
      />
      <Box component="span" display="block">
        <Button
          type="submit"
          className={classes.button}
          variant="contained"
          color="primary"
          disabled={!email || !password}
        >
          Submit
        </Button>
      </Box>
    </form>
  )
}

export default Login
