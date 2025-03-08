import { useState, useContext, useEffect } from 'react'
import CardComponent from './CardComponent'
import NewCard from './NewCard'
import 'bootstrap/dist/css/bootstrap.min.css'
import { ButtonGroup, Card, Dropdown } from 'react-bootstrap'
import '../styles/CardContainer.css'
import { useDrop } from 'react-dnd'
import { TItem } from '../types/types'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'

interface CardContainerProps {
  containerId: string
  header: string
  items: TItem[]
  addNewCard: (newCard: TItem) => void
  removeCard: (id: string) => void
  moveCard: (draggedItem: TItem, fromContainer: string, toContainer: string) => void
  reorderCards: (draggedIndex: number, targetIndex: number, containerId: string) => void
  handleDoubleClick: (itemId: string, field: string, newValue: string) => void
  handleContainerDoubleClick: (containerId: string, newHeader: string) => void
  handleDeleteContainer: (containerId: string) => void; // Add the delete handler prop
}

function CardContainer({ containerId, header, items, addNewCard, removeCard, moveCard, reorderCards, handleDoubleClick, handleContainerDoubleClick, handleDeleteContainer }: CardContainerProps) {
  const [showNewCard, setShowNewCard] = useState(false)
  const authContext = useContext(AuthContext)
  const accessToken = authContext ? authContext.accessToken : ''

  const [headerColor, setHeaderColor] = useState<string>('')
  // fetches the container data from the backend
  useEffect(() => {
    const fetchContainer = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/protected/containers/${containerId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setHeaderColor(response.data.headerColor || '')
      } catch (error) {
        console.error("Failed to fetch container:", error)
      }
    };

    fetchContainer();
  }, [containerId, accessToken]);
  // handles the color change of the header
  const handleColorChange = async (color: string) => {
    setHeaderColor(color);
    try {
      await axios.put(
        `http://localhost:5000/api/protected/containers/${containerId}`,
        { headerColor: color },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      console.error("Failed to update header color:", error)
    }
  };

  const colorOptions = [
    { name: 'Red', hex: '#FF5733' },
    { name: 'Green', hex: '#33FF57' },
    { name: 'Blue', hex: '#3357FF' },
    { name: 'Khaki', hex: '#F0E68C' },
    { name: 'Pink', hex: '#FF69B4' }
  ];
  // handles the drag and drop functionality
  const [{ isOver }, drop] = useDrop({
    accept: 'CARD',
    drop: (draggedItem: TItem, monitor) => {
      const didDrop = monitor.didDrop()
      if (!didDrop) {
        moveCard(draggedItem, draggedItem.parentContainerId, containerId)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  // shows the new card template
  function createNewCardTemplate() {
    setShowNewCard(true)
  }
  // hides the new card template
  function deleteNewCardTemplate() {
    setShowNewCard(false)
  }
  // handles the drag and drop functionality
  const handleMoveCard = (draggedIndex: number, targetIndex: number) => {
    if (draggedIndex !== targetIndex) {
      reorderCards(draggedIndex, targetIndex, containerId)
    }
  };
  // handles the doubleclick event for editing container header
  const handleHeaderDoubleClick = async () => {
    const newHeader = prompt("Enter new header:", header)
    if (newHeader !== null) {
      try {
        await axios.put(
          `http://localhost:5000/api/protected/containers/${containerId}`,
          { header: newHeader },
          { headers: {
            Authorization: `Bearer ${accessToken}`
          }}
        );
        handleContainerDoubleClick(containerId, newHeader)
      } catch (error) {
        console.error("Failed to update header:", error)
      }
    }
  };

  return (
    <div ref={drop} className={`card-container ${isOver ? 'over' : ''}`}>
      <Card className="outer-card mb-3" style={{ width: '100%',  minHeight: items.length === 0 ? '335px' : '200px' , minWidth: items.length === 0 ? '310px' : '200px' }}>
        <Card.Header className="d-flex justify-content-between align-items-center" style={{ width: '100%', backgroundColor: headerColor }} onDoubleClick={handleHeaderDoubleClick}>
          <h5 style={{padding: 10}}>{header}</h5>
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              <i className="bi bi-menu-button-wide"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="1" onClick={createNewCardTemplate}>Add Card</Dropdown.Item>
              <Dropdown.Item eventKey="2" onClick={() => handleDeleteContainer(containerId)}>Delete Container</Dropdown.Item>
              {colorOptions.map((color, index) => (
                <Dropdown.Item key={index} eventKey={`color-${index}`} onClick={() => handleColorChange(color.hex)}>
                  <div style={{ backgroundColor: color.hex, width: '20px', height: '20px', display: 'inline-block', marginRight: '10px' }}></div>
                  {color.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Card.Header>
        <Card.Body>
          {items.map((item, index) => (
            <CardComponent 
              key={item.id} 
              item={item} 
              deleteCard={(id: string) => {
                removeCard(id);
              }}
              index={index} 
              moveCard={handleMoveCard} 
              handleDoubleClick={handleDoubleClick} 
            />
          ))}
          {showNewCard && (
          <NewCard addNewCard={addNewCard} parentContainerId={containerId} deleteCard={deleteNewCardTemplate} />
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default CardContainer;