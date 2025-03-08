import { useContext, useEffect } from 'react';
import CardContainer from './CardContainer';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { TItem, TContainer } from '../types/types';
import '../styles/CardContainerGrid.css';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const PlusIcon = ({ onClick }: { onClick: () => void }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16" onClick={onClick} style={{ cursor: 'pointer' }}>
        <path d="M8.5 6a.5.5 0 0 0-1 0v1.5H6a.5.5 0 0 0 0 1h1.5V10a.5.5 0 0 0 1 0V8.5H10a.5.5 0 0 0 0-1H8.5z"/>
        <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1"/>
    </svg>
);

function CardContainerGrid({ searchTerm }: { searchTerm: string }) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return null; // or handle the error appropriately
  }
  const { containers, cards, accessToken, setContainers, setCards } = authContext;
  
  //fetch containers and cards on right order from database
  useEffect(() => {
    async function fetchContainers() {
      try {
        const response = await axios.get('http://localhost:5000/api/protected/containers', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const sortedContainers = response.data.sort((a: TContainer, b: TContainer) => a.index - b.index);
        setContainers(sortedContainers);
      } catch (error) {
        console.error("Error fetching containers", error);
      }
    }

    async function fetchCards() {
      try {
        const response = await axios.get('http://localhost:5000/api/protected/cards', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const sortedCards = response.data.sort((a: TItem, b: TItem) => a.index - b.index);
        setCards(sortedCards);
      } catch (error) {
        console.error("Error fetching cards", error);
      }
    }

    fetchContainers();
    fetchCards();
  }, [accessToken, setContainers, setCards]);

  const filteredItems = cards.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));

  async function addContainer() {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/protected/containers",
        { header: "Container" }, 
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setContainers((prevContainers) => [...prevContainers, response.data]);
    } catch (error) {
      console.error("Error adding container", error);
    }
  }

  async function addNewCard(newCard: TItem) {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/protected/cards",
        newCard,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setCards((prevCards) => [...prevCards, response.data]);
    } catch (error) {
      console.error("Error adding card", error);
    }
  }

  async function removeCard(cardId: string) {
    try {
      await axios.delete(`http://localhost:5000/api/protected/cards/${cardId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCards((prevItems) => prevItems.filter(item => item.id !== cardId)); // Compare item.id
    } catch (error) {
      console.error("Error removing card", error);
    }
  }

  async function handleDeleteContainer(containerId: string) {
    try {
      await axios.delete(
        `http://localhost:5000/api/protected/containers/${containerId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      // Remove the container and its cards from the state
      setContainers(prevContainers => prevContainers.filter(container => container._id !== containerId));
      setCards(prevCards => prevCards.filter(card => card.parentContainerId !== containerId));
    } catch (error) {
      console.error("Failed to delete container:", error);
    }
  }

  async function moveCard(draggedItem: TItem, fromContainer: string, toContainer: string) {
  
    if (fromContainer === toContainer) return;
  
    setCards((prevItems) => {
      return prevItems.map((item) => {
        if (item.id === draggedItem.id) {
          return { ...item, parentContainerId: toContainer };
        }
        return item;
      });
    });
  
    try {
      await axios.put(
        `http://localhost:5000/api/protected/cards/${draggedItem.id}`,
        { parentContainerId: toContainer },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      console.error(`Error updating card ${draggedItem.id}`, error);
    }
  }

  function reorderCards(draggedIndex: number, targetIndex: number, containerId: string) {
  
    setCards((prevItems) => {
      const containerItems = prevItems.filter(item => item.parentContainerId === containerId);
      const otherItems = prevItems.filter(item => item.parentContainerId !== containerId);
  
      const updatedItems = [...containerItems];
      const [movedItem] = updatedItems.splice(draggedIndex, 1);
      updatedItems.splice(targetIndex, 0, movedItem);
  
      // Update indices
      const reorderedItems = updatedItems.map((item, index) => ({ ...item, index }));
  
  
      // Send updated indices to the backend
      reorderedItems.forEach(async (item) => {
        try {
          await axios.put(
            `http://localhost:5000/api/protected/cards/${item.id}`,
            { index: item.index },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
        } catch (error) {
          console.error(`Error updating card ${item.id}`, error);
        }
      });
  
      return [...otherItems, ...reorderedItems];
    });
  }

  function moveContainer(draggedIndex: number, targetIndex: number) {
    console.log(`Moving container from index ${draggedIndex} to ${targetIndex}`);
  
    const updatedContainers = [...containers];
    const [removed] = updatedContainers.splice(draggedIndex, 1);
    updatedContainers.splice(targetIndex, 0, removed);
  
    // Update indices
    const reorderedContainers = updatedContainers.map((container, index) => ({ ...container, index }));
  
    console.log('Reordered containers:', reorderedContainers);
  
    // Send updated indices to the backend
    reorderedContainers.forEach(async (container) => {
      try {
        console.log(`Updating container ${container._id} with new index ${container.index}`);
        await axios.put(
          `http://localhost:5000/api/protected/containers/${container._id}`,
          { index: container.index },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        console.log(`Successfully updated container ${container._id}`);
      } catch (error) {
        console.error(`Error updating container ${container._id}`, error);
      }
    });
  
    setContainers(reorderedContainers);
  }

  function handleDoubleClick(itemId: string, field: string, newValue: string) {
    setCards((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, [field]: newValue } : item 
    ))
  }

  function handleContainerDoubleClick(containerId: string, newHeader: string) {
    setContainers((prevContainers) =>
      prevContainers.map((container) =>
        container._id === containerId ? { ...container, header: newHeader } : container 
      )
    );
  }

  const isMobile = window.innerWidth <= 768;

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className="card-container-grid">
        {containers.map((container, index) => (
          <ContainerWrapper
            key={container._id} // Ensure the correct key is used
            index={index}
            moveContainer={moveContainer}
          >
            <CardContainer
              containerId={container._id} // Ensure containerId is correctly passed
              header={container.header}
              items={filteredItems.filter(item => item.parentContainerId === container._id)}
              addNewCard={addNewCard}
              removeCard={removeCard}
              moveCard={moveCard}
              reorderCards={reorderCards}
              handleDoubleClick={handleDoubleClick}
              handleContainerDoubleClick={handleContainerDoubleClick}
              handleDeleteContainer={handleDeleteContainer} // Pass down the delete handler
            />
          </ContainerWrapper>
        ))}
        <PlusIcon onClick={addContainer} />
      </div>
    </DndProvider>
  );
}

interface ContainerWrapperProps {
  index: number;
  moveContainer: (draggedIndex: number, targetIndex: number) => void;
  children: React.ReactNode;
}

function ContainerWrapper({ index, moveContainer, children }: ContainerWrapperProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'CONTAINER',
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'CONTAINER',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveContainer(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} className={`container-wrapper ${isDragging ? 'dragging' : ''}`}>
      {children}
    </div>
  );
}

export default CardContainerGrid;