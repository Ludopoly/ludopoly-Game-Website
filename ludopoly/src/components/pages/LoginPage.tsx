import React from 'react'
import { LoginForm } from '../../features/auth'
import { useReduxAuth } from '../../features/auth/context/ReduxAuthProvider'

const LoginPage: React.FC = () => {
  const { login, isLoading } = useReduxAuth()

  return <LoginForm onLogin={login} isLoading={isLoading} />
}

export default LoginPage
