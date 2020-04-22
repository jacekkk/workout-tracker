import React, { useState } from 'react'
import { TextField, Button } from '@material-ui/core'
import { auth } from '../db/firebase'
import { Redirect } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [isAuthenticated, setIsAuthenticated] = useState()

  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('authenticated in login component')
      setIsAuthenticated(true)
    } else {
      console.log('not authenticated in login component')
      setIsAuthenticated(false)
    }
  })

  const handleSubmit = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      // .then(() => setIsAuthenticated(true))
      .catch((error) => {
        console.log(error)
      })
  }

  if (isAuthenticated) return <Redirect to="/" />

  return (
    <form noValidate autoComplete="off">
      <div>
        <TextField
          fullWidth
          onChange={(e) => setEmail(e.target.value)}
          error
          id="email"
          label="email"
          helperText="Incorrect entry."
        />
        <TextField
          fullWidth
          onChange={(e) => setPassword(e.target.value)}
          error
          id="password"
          label="password"
          helperText="Incorrect entry."
        />
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </form>
  )
}

export default Login
