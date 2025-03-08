import React, { createContext, useState, useEffect, ReactNode } from "react"
import axios from "axios"

interface AuthContextSettings {
  user: { id: string; username: string } | null
  accessToken: string | null
  containers: any[]
  cards: any[]
  setContainers: React.Dispatch<React.SetStateAction<any[]>>
  setCards: React.Dispatch<React.SetStateAction<any[]>>
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextSettings | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null); 
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [containers, setContainers] = useState<any[]>([])
  const [cards, setCards] = useState<any[]>([])

  

  const fetchUserData = async (token: string) => {
    try {
      const containersResponse = await axios.get("http://localhost:5000/api/protected/containers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContainers(containersResponse.data)

      const cardsResponse = await axios.get("http://localhost:5000/api/protected/cards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCards(cardsResponse.data)
    } catch (error) {
      console.error("Error fetching user data", error)
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchUserData(accessToken)
    }
  }, [accessToken])

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { username, password }, { withCredentials: true });
      setAccessToken(response.data.accessToken)

      const decoded = JSON.parse(atob(response.data.accessToken.split(".")[1]))
      setUser({ id: decoded.id, username: decoded.username })

      fetchUserData(response.data.accessToken)
    } catch (error: any) {
      if (error.response?.data?.error === "Username not found!") {
        throw new Error("Username not found!");
      }
      throw new Error(error.response?.data?.error || "Login failed")
    }
  };

  const logout = async () => {
    await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true })
    setUser(null)
    setAccessToken(null)
    setContainers([])
    setCards([])
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, containers, cards, setContainers, setCards, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

