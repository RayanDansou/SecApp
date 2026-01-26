import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ProfilePictureUpload.css';

// Avatars prédéfinis utilisant DiceBear API
const AVATARS = [
  {
    id: 'avatar1',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4'
  },
  {
    id: 'avatar2',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede'
  },
  {
    id: 'avatar3',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Princess&backgroundColor=ffd5dc'
  },
  {
    id: 'avatar4',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper&backgroundColor=d1d4f9'
  },
  {
    id: 'avatar5',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe&backgroundColor=ffdfbf'
  },
  {
    id: 'avatar6',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar&backgroundColor=c5e4e7'
  }
];

const ProfilePictureUpload = ({ currentUser, onUpdate }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('avatars'); // 'avatars' ou 'upload'
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || '');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const getCurrentProfilePicture = () => {
    if (currentUser?.profile_picture) {
      return currentUser.profile_picture;
    } else if (currentUser?.avatar) {
      const avatar = AVATARS.find(a => a.id === currentUser.avatar);
      return avatar?.url || AVATARS[0].url;
    }
    return AVATARS[0].url;
  };

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert(t('profile.profilePicture.fileTooLarge'));
        return;
      }

      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        alert(t('profile.profilePicture.invalidFileType'));
        return;
      }

      setUploadedFile(file);
      setSelectedAvatar('');

      // Créer une preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      const formData = new FormData();

      if (selectedTab === 'avatars' && selectedAvatar) {
        // Sélection d'un avatar prédéfini
        formData.append('avatar', selectedAvatar);
        formData.append('profile_picture', ''); // Retirer la photo personnalisée
      } else if (selectedTab === 'upload' && uploadedFile) {
        // Upload d'une photo personnalisée
        formData.append('profile_picture', uploadedFile);
        formData.append('avatar', ''); // Retirer l'avatar
      } else {
        alert(t('profile.profilePicture.selectOption'));
        setUploading(false);
        return;
      }

      await onUpdate(formData);
      setUploadedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert(t('errors.generic'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-picture-upload">
      <div className="current-picture-section">
        <h3>{t('profile.profilePicture.currentPicture')}</h3>
        <div className="current-picture-wrapper">
          <img
            src={getCurrentProfilePicture()}
            alt="Profile"
            className="current-picture"
          />
        </div>
      </div>

      <div className="picture-tabs">
        <button
          className={`tab-button ${selectedTab === 'avatars' ? 'active' : ''}`}
          onClick={() => setSelectedTab('avatars')}
        >
          {t('profile.profilePicture.chooseAvatar')}
        </button>
        <button
          className={`tab-button ${selectedTab === 'upload' ? 'active' : ''}`}
          onClick={() => setSelectedTab('upload')}
        >
          {t('profile.profilePicture.uploadPhoto')}
        </button>
      </div>

      <div className="picture-content">
        {selectedTab === 'avatars' ? (
          <div className="avatars-grid">
            {AVATARS.map((avatar) => (
              <div
                key={avatar.id}
                className={`avatar-option ${selectedAvatar === avatar.id ? 'selected' : ''}`}
                onClick={() => handleAvatarSelect(avatar.id)}
              >
                <img src={avatar.url} alt={`Avatar ${avatar.id}`} />
                {selectedAvatar === avatar.id && (
                  <div className="selected-badge">✓</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="upload-section">
            <div className="upload-area">
              {previewUrl ? (
                <div className="upload-preview">
                  <img src={previewUrl} alt="Preview" />
                  <button
                    className="remove-preview"
                    onClick={() => {
                      setUploadedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p>{t('profile.profilePicture.clickToUpload')}</p>
                    <span className="upload-hint">{t('profile.profilePicture.maxSize')}</span>
                  </div>
                </label>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="picture-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={uploading || (selectedTab === 'avatars' && !selectedAvatar) || (selectedTab === 'upload' && !uploadedFile)}
        >
          {uploading ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
