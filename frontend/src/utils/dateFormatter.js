/**
 * Formate une date selon la langue de l'utilisateur
 * @param {string|Date} dateString - Date à formater
 * @param {string} language - Code de langue ('fr' ou 'en')
 * @param {Object} options - Options de formatage (optionnel)
 * @returns {string} Date formatée
 */
export const formatDate = (dateString, language = 'fr', options = null) => {
  if (!dateString) return '';

  const locale = language === 'fr' ? 'fr-FR' : 'en-US';

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  const formatOptions = options || defaultOptions;

  try {
    return new Date(dateString).toLocaleString(locale, formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Formate une date courte (sans heure)
 * @param {string|Date} dateString - Date à formater
 * @param {string} language - Code de langue ('fr' ou 'en')
 * @returns {string} Date formatée
 */
export const formatDateShort = (dateString, language = 'fr') => {
  if (!dateString) return '';

  const locale = language === 'fr' ? 'fr-FR' : 'en-US';

  try {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Formate une date relative (il y a X minutes/heures/jours)
 * @param {string|Date} dateString - Date à formater
 * @param {string} language - Code de langue ('fr' ou 'en')
 * @returns {string} Date relative formatée
 */
export const formatRelativeTime = (dateString, language = 'fr') => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    const translations = {
      fr: {
        justNow: 'À l\'instant',
        minutesAgo: (n) => `Il y a ${n} minute${n > 1 ? 's' : ''}`,
        hoursAgo: (n) => `Il y a ${n} heure${n > 1 ? 's' : ''}`,
        daysAgo: (n) => `Il y a ${n} jour${n > 1 ? 's' : ''}`
      },
      en: {
        justNow: 'Just now',
        minutesAgo: (n) => `${n} minute${n > 1 ? 's' : ''} ago`,
        hoursAgo: (n) => `${n} hour${n > 1 ? 's' : ''} ago`,
        daysAgo: (n) => `${n} day${n > 1 ? 's' : ''} ago`
      }
    };

    const t = translations[language] || translations['fr'];

    if (diffMins < 1) return t.justNow;
    if (diffHours < 1) return t.minutesAgo(diffMins);
    if (diffDays < 1) return t.hoursAgo(diffHours);
    if (diffDays < 7) return t.daysAgo(diffDays);

    // Pour les dates plus anciennes, utiliser le format complet
    return formatDate(dateString, language);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return dateString;
  }
};
