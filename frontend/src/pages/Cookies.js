import React from 'react';
import Layout from '../components/Layout';
import './LegalPage.css';

const Cookies = () => {
  return (
    <Layout>
      <div className="legal-container">
        <div className="legal-card">
          <h1>Politique de Gestion des Cookies</h1>
        
          <div className="legal-content">
            <p className="last-updated">Dernière mise à jour : Janvier 2026</p>

            <section>
              <h2>1. Qu'est-ce qu'un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la visite d'un site web. 
              Il permet à son émetteur d'identifier le terminal dans lequel il est enregistré, pendant la durée de validité ou d'enregistrement du cookie.
              Dans le cadre de GuardianIQ, nous utilisons également le "Local Storage" du navigateur, qui remplit une fonction similaire. Cela permet de conserver des données utilisateur afin de faciliter la navigation et de permettre certaines fonctionnalités.
            </p>
          </section>

          <section>
            <h2>2. Cookies utilisés sur GuardianIQ</h2>
            <p className="mb-4">Notre application utilise exclusivement des cookies techniques et fonctionnels, exemptés de consentement préalable selon les recommandations de la CNIL, car strictement nécessaires à la fourniture du service.</p>
            
            <div className="legal-table-wrapper">
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Nom / Type</th>
                    <th>Finalité</th>
                    <th>Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Auth Token (JWT)</td>
                    <td>Authentification sécurisée et maintien de la session utilisateur.</td>
                    <td>Session (ou persistant si "Se souvenir de moi")</td>
                  </tr>
                  <tr>
                    <td>Refresh Token</td>
                    <td>Renouvellement automatique de la session sans reconnexion.</td>
                    <td>7 jours</td>
                  </tr>
                  <tr>
                    <td>i18next</td>
                    <td>Mémorisation certaines préférences d'affichage (comme la langue ou le thème) pour améliorer votre expérience.</td>
                    <td>Persistant</td>
                  </tr>
                  <tr>
                    <td>CSRF Token</td>
                    <td>Protection contre les attaques Cross-Site Request Forgery.</td>
                    <td>Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>3. Cookies Tiers</h2>
            <p>
              GuardianIQ limite au strict minimum l'utilisation de services tiers.
            </p>
            <ul>
              <li><strong>Google OAuth :</strong> Si vous utilisez la connexion via Google, Google peut déposer ses propres cookies d'authentification. Ces cookies sont régis par la politique de confidentialité de Google.</li>
              <li><strong>Pas de publicité :</strong> Nous n'utilisons aucun cookie publicitaire, de retargeting ou de partage vers les réseaux sociaux à des fins commerciales.</li>
            </ul>
          </section>

          <section>
            <h2>4. Gestion de vos préférences</h2>
            <p>
              Bien que les cookies que nous utilisons soient essentiels au fonctionnement de l'application, vous pouvez configurer votre navigateur pour les refuser.
              <strong>Attention :</strong> Le refus des cookies d'authentification empêchera toute connexion à la plateforme.
            </p>
            <p className="mt-2">Pour gérer les cookies dans votre navigateur :</p>
            <ul>
              <li>Chrome : Paramètres &gt; Confidentialité et sécurité &gt; Cookies</li>
              <li>Firefox : Options &gt; Vie privée et sécurité &gt; Cookies</li>
              <li>Safari : Préférences &gt; Confidentialité</li>
              <li>Edge : Paramètres &gt; Cookies et autorisations de site</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default Cookies;