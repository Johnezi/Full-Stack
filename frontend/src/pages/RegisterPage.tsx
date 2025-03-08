import React, { useState } from "react"
import { Form as BootstrapForm, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom"
import "../styles/LoginPage.css"

function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("") 

  const navigate = useNavigate()

  // Handle user registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })

      const responseData = await response.json()
      console.log(responseData)
      if (!responseData.ok) {
        if (responseData.error === "Username already taken") {
          throw new Error("Username already taken")
        }
        throw new Error(responseData.error || "Registration failed")
      }
      setMessage("Registration completed!")
      setTimeout(() => {
        navigate("/login")
      }, 2000) 
    } catch (error: any) {
      setMessage(error.message)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Register</h1>
        {message && <p style={{ color: message === "Registration completed!" ? "green" : "red" }}>{message}</p>}
        <form onSubmit={handleRegister}>
          <BootstrapForm.Group className="mb-3" controlId="formBasicUsername">
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
            Register
          </Button>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage