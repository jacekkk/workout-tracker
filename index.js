import React from 'react'
import { render } from 'react-dom'
import App from './src/App'
import registerServiceWorker from './src/register-service-worker'

render(<App />, document.getElementById('root'))

registerServiceWorker() // Runs register() as default function
