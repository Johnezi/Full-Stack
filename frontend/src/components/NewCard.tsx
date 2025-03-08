import { Button, Card, CloseButton, ListGroup } from "react-bootstrap"
import { useState } from "react"
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/NewCard.css'
import { TItem } from '../types/types'
import { v4 as uuidv4 } from 'uuid'

interface NewCardProps {
    addNewCard: (item: TItem) => void;
    parentContainerId: string;
    deleteCard: () => void;
}

function NewCard({ addNewCard, parentContainerId, deleteCard }: NewCardProps) {
    const [title, setTitle] = useState("")
    const [secondaryTitle, setSecondaryTitle] = useState("")
    const [mainText, setMainText] = useState("")
    const [cardColor, setCardColor] = useState("white")
    const [tags, setTags] = useState("")
    const [versionText, setVersionText] = useState("")
    const [estimatedTime, setEstimatedTime] = useState("")
    const [actualTime, setActualTime] = useState("insert")

    const newItem: TItem = {
        id: uuidv4(),
        title: title,
        parentContainerId: parentContainerId, 
        secondaryTitle: secondaryTitle,
        mainText: mainText,
        cardColor: cardColor,
        tags: tags,
        versionText: versionText,
        estimatedTime: estimatedTime, 
        actualTime: actualTime, 
        index: 0, 
        createdTimestamp: new Date().toISOString() 
    };
    // Hadles new card creation
    const handleAddNewCard = () => {
        addNewCard(newItem)
        deleteCard()
    };

    return (
        <Card border="primary" className="new-card">
            <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                    <h5>Add new card</h5>
                    <CloseButton onClick={() => deleteCard()} />
                </div>
                <input type="text" placeholder="Insert main title" value={title} onChange={e => setTitle(e.target.value)} />
            </Card.Header>
            <Card.Body>
                <Card.Title>
                    <input type="text" placeholder="Insert secondary title" value={secondaryTitle} onChange={e => setSecondaryTitle(e.target.value)} />
                </Card.Title>
                <Card.Text>
                    <textarea placeholder="Insert main text for card" value={mainText} onChange={e => setMainText(e.target.value)} />
                </Card.Text>
                <input type="text" placeholder="Estimated time" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} /> {/* New input for estimated time */}
                <input type="text" placeholder="Actual time" value={actualTime} onChange={e => setActualTime(e.target.value)} /> {/* New input for actual time */}
            </Card.Body>
            <ListGroup variant="flush">
                <select className="select-color" style={{ backgroundColor: cardColor }} onChange={(e) => setCardColor(e.target.value)}>
                    <option value="white">Select color</option>
                    <option className="option-red" value="red">Red</option>
                    <option className="option-blue" value="dodgerblue">Blue</option>
                    <option className="option-green" value="forestgreen">Green</option>
                    <option className="option-yellow" value="goldenrod">Yellow</option>
                    <option className="option-orange" value="orange">Orange</option>
                    <option className="option-grey" value="dimgrey">Grey</option>
                </select>
                <input className="input-tags" type="text" placeholder="Insert tags separate with ; " value={tags} onChange={(e) => setTags(e.target.value)} />
                <input className="input-version" type="text" placeholder="Insert update's version number" value={versionText} onChange={(e) => setVersionText(e.target.value)} />
                <ListGroup.Item></ListGroup.Item>
            </ListGroup>
            <Button variant="primary" className="btn-add" onClick={handleAddNewCard}>Add new Card</Button>
        </Card>
    );
}

export default NewCard;