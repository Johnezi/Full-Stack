import "../styles/navbar.css"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { Form, FormControl} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

interface NavBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

function NavBar({ searchTerm, setSearchTerm }: NavBarProps) {
    const authentication = useContext(AuthContext)

    return (
        <Navbar bg="dark" data-bs-theme="dark" className="navbar-custom" expand="lg">
            <Container>
                <Navbar.Brand href="/"><h3>Kanban Board</h3></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto nav-ul-list-custom">
                        
                        {authentication?.user ? (
                            <>
                                <Nav.Link onClick={authentication?.logout} className="nav-link-custom">Log out</Nav.Link>
                                <Nav.Link className="nav-link-custom">
                                    <Form className="ml-auto d-inline">
                                        <FormControl
                                            type="text"
                                            placeholder="Search by title"
                                            className="mr-sm-2"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ marginLeft: '10px' }}
                                        />
                                    </Form>
                                </Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link href="/login" className="nav-link-custom">Kirjaudu sisään</Nav.Link>
                                <Nav.Link href="/register" className="nav-link-custom">Rekisteröidy</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavBar;