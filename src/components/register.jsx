import React, { useState } from 'react'
import { TextField, Button, Box } from '@material-ui/core'
import { auth } from '../db/firebase'
import { Redirect } from 'react-router-dom'
import { isEmailValid, isPasswordValid } from '../utils/validators'
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

const Register = () => {
  const classes = useStyles()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState()
  const [firebaseError, setFirebaseError] = useState()

  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('authenticated in register component')
      setIsAuthenticated(true)
    } else {
      console.log('not authenticated in register component')
      setIsAuthenticated(false)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    auth
      .createUserWithEmailAndPassword(email, password)
      // .then(() => setIsAuthenticated(true))
      .catch((error) => {
        setFirebaseError(error.message)
        console.log(error)
      })
  }

  const emailError = () => (email.length > 0 ? !isEmailValid(email) : null)

  const getEmailHelperText = () =>
    emailError() ? 'Please enter a valid email address' : ''

  const passwordError = (pass) => {
    if (pass.length === 0) {
      return null
    } else if (
      isPasswordValid(password) &&
      isPasswordValid(confirmPassword) &&
      password !== confirmPassword
    ) {
      return true
    } else {
      return !isPasswordValid(pass)
    }
  }

  const getPasswordHelperText = (password) => {
    if (!passwordError(password)) return ''
    if (passwordError(password) && password.length < 6) {
      return 'Password must be at least 6 characters long'
    } else {
      return 'Passwords must match'
    }
  }

  const submitDisabled = () => {
    if (!email || !password || !confirmPassword) {
      return true
    } else {
      return (
        emailError() ||
        passwordError(password) ||
        passwordError(confirmPassword)
      )
    }
  }

  if (isAuthenticated) return <Redirect to="/" />

  return (
    <form
      className={classes.root}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <div>{firebaseError}</div>
      <TextField
        fullWidth
        variant="outlined"
        onChange={(e) => setEmail(e.target.value)}
        error={emailError()}
        id="email"
        label="email"
        helperText={getEmailHelperText()}
      />
      <TextField
        fullWidth
        variant="outlined"
        onChange={(e) => setPassword(e.target.value)}
        error={passwordError(password)}
        id="password"
        label="password"
        type="password"
        helperText={getPasswordHelperText(password)}
      />
      <TextField
        fullWidth
        variant="outlined"
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={passwordError(confirmPassword)}
        id="confirm-password"
        label="confirm password"
        type="password"
        helperText={getPasswordHelperText(confirmPassword)}
      />
      <Box component="span" display="block">
        <Button
          type="submit"
          className={classes.button}
          variant="contained"
          color="primary"
          disabled={submitDisabled()}
        >
          Submit
        </Button>
      </Box>
    </form>
  )
}

export default Register
