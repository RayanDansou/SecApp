import React, { useState, useEffect } from 'react';
import questionnaireService from '../../services/questionnaireService';
import { useAuth } from '../../contexts/AuthContext';
import './CommentsList.css';

const CommentsList = ({ responseId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadComments();
  }, [responseId]);

  const loadComments = async () => {
    try {
      const data = await questionnaireService.getComments(responseId);
      setComments(data);
    } catch (err) {
      console.error('Erreur chargement commentaires:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    setError('');

    try {
      await questionnaireService.createComment(responseId, { content: newComment });
      setNewComment('');
      loadComments();
    } catch (err) {
      setError(err.error || 'Erreur lors de l\'ajout du commentaire');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comments-section">
      <h3>Commentaires ({comments.length})</h3>

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">Aucun commentaire pour le moment</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">
                  {comment.author.first_name} {comment.author.last_name}
                </span>
                <span className="comment-role">({comment.author.role})</span>
                <span className="comment-date">{formatDate(comment.created_at)}</span>
              </div>
              <div className="comment-content">{comment.content}</div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <h4>Ajouter un commentaire</h4>
        {error && <div className="error-message">{error}</div>}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Écrivez votre commentaire..."
          rows="4"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !newComment.trim()}>
          {loading ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
};

export default CommentsList;
