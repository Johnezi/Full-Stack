import React, { useState, useContext } from "react"
import { Form as BootstrapForm, Button } from 'react-bootstrap'
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import "../styles/LoginPage.css"

function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const auth = useContext(AuthContext)
  const navigate = useNavigate()

  // Handle user login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    if (auth) {
      try {
        await auth.login(username, password)
        navigate("/dashboard")
      } catch (error: any) {
        if (error.message === "Username not found!") {
          setMessage("Incorrect username or password!")
        } else {
          setMessage(error.message)
        }
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Sign in</h1>
        {message && <p style={{ color: "red" }}>{message}</p>}
        <form onSubmit={handleLogin}>
          <BootstrapForm.Group className="mb-3" controlId="formBasicEmail">
            <BootstrapForm.Label>Username</BootstrapForm.Label>
            <BootstrapForm.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </BootstrapForm.Group>

          <BootstrapForm.Group className="mb-3" controlId="formBasicPassword">
            <BootstrapForm.Label>Password</BootstrapForm.Label>
            <BootstrapForm.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </BootstrapForm.Group>

          <Button variant="primary" type="submit">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage