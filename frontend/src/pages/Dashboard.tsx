import { useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import CardContainerGrid from "../components/CardContainerGrid"

interface DashboardProps {
  searchTerm: string
}

function Dashboard({ searchTerm }: DashboardProps) {
  const authentication = useContext(AuthContext)
  const navigate = useNavigate()

  // Redirect to login page if user is not authenticated
  useEffect(() => {
    if (!authentication?.user) {
      navigate("/login")
    }
  }, [authentication?.user, navigate])

  // Return null if user is not authenticated
  if (!authentication?.user) {
    return null
  }

  return (
    <div>
      
      <CardContainerGrid searchTerm={searchTerm} />
    </div>
  );
}

export default Dashboard