import { Button, Card, CloseButton } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useDrag, useDrop } from 'react-dnd';
import { TItem, Comment } from '../types/types';
import { useState, useContext } from 'react';
import '../styles/CardComponent.css';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';

interface CardProps {
    item: TItem;
    deleteCard: (id: string) => void;
    index: number;
    moveCard: (draggedIndex: number, targetIndex: number) => void;
    handleDoubleClick: (itemId: string, field: string, newValue: string) => void;
}

function CardComponent({ item, deleteCard, index, moveCard, handleDoubleClick }: CardProps) {


    const [showCommentBox, setShowCommentBox] = useState(false);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<Comment[]>(item.comments || []);
    const authContext = useContext(AuthContext);
    const accessToken = authContext ? authContext.accessToken : '';
    // handles drag and drop functionality

    const [{ isDragging }, drag] = useDrag({
        type: 'CARD',
        item: { id: item.id, index },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });
    // handles drag and drop functionality
    const [, drop] = useDrop({
        accept: 'CARD',
        hover: (draggedItem: { id: string; index: number }) => {
            if (draggedItem.index !== index) {
                moveCard(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });
    // handles the doubleclick event when editing data
    const handleDoubleClickEvent = async (field: string) => {
        const newValue = prompt(`Enter new ${field}:`, item[field as keyof TItem] as string);
        if (newValue !== null) {
            try {
                await axios.put(
                    `http://localhost:5000/api/protected/cards/${item.id}`,
                    { [field]: newValue },
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                handleDoubleClick(item.id, field, newValue);
            } catch (error) {
                console.error("Failed to update card:", error);
            }
        }
    };
    // handles doubleclick event for touch devices
    const handleTouchEvent = (field: string) => {
        return {
            onTouchEnd: () => handleDoubleClickEvent(field),
        };
    };


    // Handles the whole add comment functionality and adds it to db
    const handleAddComment = async () => {
        const newComment = {
            commentId: uuidv4(),
            text: comment,
            timestamp: new Date().toISOString(),
            edited: false
        };
        try {
            await axios.post(
                `http://localhost:5000/api/protected/cards/${item.id}/comments`,
                newComment,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            setComments([...comments, newComment]);
            setComment('');
            setShowCommentBox(false);
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };
    // handles comment edit functionality
    const handleEditComment = async (index: number) => {
        const newText = prompt('Edit your comment:', comments[index].text);
        if (newText !== null) {
            const newTimestamp = new Date().toISOString();
            const updatedComment = { ...comments[index], text: newText, timestamp: newTimestamp, edited: true };
            try {
                await axios.put(
                    `http://localhost:5000/api/protected/cards/${item.id}/comments/${comments[index].commentId}`,
                    updatedComment,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                setComments(comments.map((c, i) => i === index ? updatedComment : c));
            } catch (error) {
                console.error("Error updating comment:", error);
            }
        }
    };
    // deletes open comment box
    const handleCancelComment = () => {
        setComment('');
        setShowCommentBox(false);
    };
    // deletes comment from db
    const handleDeleteComment = async (index: number) => {
        const targetCommentId = comments[index].commentId;
        try {
            await axios.delete(
                `http://localhost:5000/api/protected/cards/${item.id}/comments/${targetCommentId}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            setComments(comments.filter((_, i) => i !== index));
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    return (
        <Card ref={(node) => drag(drop(node))} className={`mb-3 card-component ${isDragging ? 'dragging' : ''}`} style={{ minWidth: '18rem', maxWidth: '100%' }}>
            <Card.Header 
                className="d-flex justify-content-between align-items-center"
                onDoubleClick={() => handleDoubleClickEvent('title')}
                {...handleTouchEvent('title')}
                style={{ backgroundColor: item.cardColor }}
            >
                <h5 className="card-title">{item.title}</h5>
                <CloseButton
                    onClick={() => {
                        deleteCard(item.id);
                    }}
                />
            </Card.Header>
            <Card.Body style={{backgroundColor: '#f8f9fa'}}>
                <Card.Title onDoubleClick={() => handleDoubleClickEvent('secondaryTitle')} {...handleTouchEvent('secondaryTitle')}>{item.secondaryTitle}</Card.Title>
                <div>
                    <p onDoubleClick={() => handleDoubleClickEvent('mainText')} {...handleTouchEvent('mainText')}>{item.mainText}</p>
                    <p onDoubleClick={() => handleDoubleClickEvent('tags')} {...handleTouchEvent('tags')}>{item.tags}</p>
                    <p onDoubleClick={() => handleDoubleClickEvent('versionText')} {...handleTouchEvent('versionText')}>{item.versionText}</p>
                    <div>
                        <small>Estimated time: </small>
                        <small onDoubleClick={() => handleDoubleClickEvent('estimatedTime')} {...handleTouchEvent('estimatedTime')}>{item.estimatedTime}</small>
                    </div>
                    <div>
                        <small>Actual time: </small>
                        <small onDoubleClick={() => handleDoubleClickEvent('actualTime')} {...handleTouchEvent('actualTime')}>{item.actualTime}</small>
                    </div>
                </div>
                <Button variant="primary" onClick={() => setShowCommentBox(true)}>Add Comment</Button>
                {showCommentBox && (
                    <div className="comment-box">
                        <textarea 
                            value={comment} 
                            onChange={(e) => setComment(e.target.value)} 
                            placeholder="Write your comment here"
                        />
                        <div className="comment-box-buttons">
                            <Button variant="success" onClick={handleAddComment}>Save Comment</Button>
                            <Button variant="secondary" onClick={handleCancelComment}>Cancel</Button>
                        </div>
                    </div>
                )}
                {comments.map((c, idx) => (
                    <div key={idx} className="comment">
                        <div onDoubleClick={() => handleEditComment(idx)}
    onTouchEnd={() => handleEditComment(idx)} >{c.text}</div>
                        <small>{moment(c.timestamp).format('DD-MM-YYYY HH:mm:ss')} {c.edited && '(edited)'}</small>
                        <CloseButton onClick={() => handleDeleteComment(idx)} />
                    </div>
                ))}
                <div className="created-timestamp">
                    <small>Card created: {moment(item.createdTimestamp).format('DD-MM-YYYY HH:mm:ss')}</small>
                </div>
            </Card.Body>
        </Card>
    );
}

export default CardComponent