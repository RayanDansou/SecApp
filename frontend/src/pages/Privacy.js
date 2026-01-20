import React from 'react';
import Layout from '../components/Layout';
import './LegalPage.css';

const Privacy = () => {
  return (
    <Layout>
      <div className="legal-container">
        <div className="legal-card">
          <h1>Politique de Confidentialité</h1>
        
          <div className="legal-content">
            <p className="last-updated">Dernière mise à jour : Janvier 2026</p>

            <section>
              <h2>1. Introduction</h2>
            <p>
              La protection de vos données personnelles est au cœur de nos préoccupations. Cette politique détaille comment GuardianIQ collecte, traite et protège vos informations 
              dans le cadre de votre utilisation de notre plateforme d'analyse de sécurité.
            </p>
          </section>

          <section>
            <h2>2. Données Collectées</h2>
            <p>Nous collectons les types de données suivants :</p>
            <ul>
              <li><strong>Données d'identification :</strong> Nom, prénom, adresse email professionnelle, identifiant, rôle.</li>
              <li><strong>Données professionnelles :</strong> Réponses aux questionnaires, documents techniques, commentaires d'analyse.</li>
              <li><strong>Données techniques :</strong> Logs de connexion, adresse IP, type de navigateur, actions effectuées sur la plateforme (à des fins de sécurité et d'audit).</li>
            </ul>
          </section>

          <section>
            <h2>3. Finalités et Base Légale</h2>
            <p>Vos données sont traitées pour les finalités suivantes :</p>
            <ul>
              <li><strong>Fourniture du service :</strong> Gestion des comptes, workflow de validation (Base légale : Exécution du contrat).</li>
              <li><strong>Analyse IA :</strong> Traitement du contenu pour générer des scores et recommandations (Base légale : Intérêt légitime / Exécution du contrat).</li>
              <li><strong>Sécurité :</strong> Détection d'activités suspectes et audit (Base légale : Intérêt légitime).</li>
              <li><strong>Communication :</strong> Envoi de notifications liées aux projets (Base légale : Exécution du contrat).</li>
            </ul>
          </section>

          <section>
            <h2>4. Sous-traitants et Partage de Données</h2>
            <p>Nous partageons certaines données avec des prestataires de confiance, dans le strict respect du RGPD :</p>
            <ul>
              <li><strong>Microsoft Azure (OpenAI) :</strong> Pour l'analyse sémantique des questionnaires. Les données ne sont pas utilisées pour entraîner les modèles publics d'OpenAI (Opt-out activé).</li>
              <li><strong>Resend :</strong> Pour l'envoi des emails transactionnels.</li>
              <li><strong>Hébergeur :</strong> Pour le stockage sécurisé des bases de données et fichiers.</li>
            </ul>
          </section>

          <section>
            <h2>5. Sécurité des Données</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles robustes : chiffrement des données au repos et en transit (TLS 1.2+), 
              contrôle d'accès strict basé sur les rôles (RBAC), authentification forte, et audits de sécurité réguliers afin de protéger vos données contre tout accès non autorisé, modification ou perte.
            </p>
          </section>

          <section>
            <h2>6. Durée de Conservation</h2>
            <p>
              Les données personnelles sont conservées tant que votre compte est actif. 
              En cas de suppression de compte, les données peuvent être archivées pendant une durée légale (ex: 5 ans pour la responsabilité civile) avant anonymisation ou suppression définitive.
            </p>
          </section>

          <section>
            <h2>7. Vos Droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li>Droit d'accès et de rectification de vos données.</li>
              <li>Droit à l'effacement ("droit à l'oubli").</li>
              <li>Droit à la limitation du traitement.</li>
              <li>Droit à la portabilité des données.</li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, contactez nous à l'adresse de support guardianiq.cloud@gmail.com : notre Délégué à la Protection des Données (DPO) se chargera de votre requête.
            </p>
          </section>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default Privacy;