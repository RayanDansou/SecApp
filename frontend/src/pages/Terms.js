import React from 'react';
import Layout from '../components/Layout';
import './LegalPage.css';

const Terms = () => {
  return (
    <Layout>
      <div className="legal-container">
        <div className="legal-card">
          <h1>Conditions Générales d'Utilisation</h1>
        
          <div className="legal-content">
            <p className="last-updated">Dernière mise à jour : Janvier 2026</p>

            <section>
              <h2>1. Objet et Acceptation</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités de mise à disposition et d'utilisation de l'application <strong>GuardianIQ</strong>. 
              L'accès et l'utilisation du service supposent l'acceptation pleine et entière et le respect des présentes conditions par l'utilisateur.
            </p>
          </section>

          <section>
            <h2>2. Description du Service</h2>
            <p>
              GuardianIQ est une plateforme SaaS destinée aux professionnels de la cybersécurité et de la gestion de projet. Elle permet :
            </p>
            <ul>
              <li>La création et la gestion de questionnaires de sécurité.</li>
              <li>L'analyse automatisée des réponses via des services d'Intelligence Artificielle (Azure OpenAI).</li>
              <li>La collaboration entre différents rôles (Chefs de projet, Analystes, Business Owners).</li>
              <li>La génération de rapports et de scores de conformité (CIA).</li>
            </ul>
          </section>

          <section>
            <h2>3. Accès et Compte Utilisateur</h2>
            <p>
              L'accès au service est restreint aux utilisateurs disposant d'un compte créé par un administrateur ou via une inscription validée.
              L'utilisateur est responsable de la confidentialité de ses identifiants (login et mot de passe). Toute action effectuée via son compte est réputée effectuée par lui.
              En cas de suspicion de compromission, l'utilisateur doit immédiatement en informer l'administration de la plateforme.
            </p>
          </section>

          <section>
            <h2>4. Utilisation de l'Intelligence Artificielle</h2>
            <p>
              Le service intègre des fonctionnalités d'analyse basées sur l'API Azure OpenAI. L'utilisateur reconnaît que :
            </p>
            <ul>
              <li>Les résultats fournis par l'IA (scores, recommandations, détection d'incohérences) sont une aide à la décision et ne remplacent pas le jugement d'un expert humain.</li>
              <li>L'éditeur ne garantit pas l'exactitude, l'exhaustivité ou la pertinence absolue des analyses générées par l'IA.</li>
              <li>Il est de la responsabilité de l'Analyste de valider les suggestions avant toute prise de décision critique.</li>
            </ul>
          </section>

          <section>
            <h2>5. Propriété Intellectuelle</h2>
            <p>
              <strong>Plateforme :</strong> L'ensemble des éléments constituant GuardianIQ (code, design, logos, bases de données) est la propriété exclusive de l'éditeur.
              <br/>
              <strong>Données Utilisateur :</strong> Les questionnaires, réponses et documents téléversés restent la propriété exclusive de l'organisation utilisatrice. GuardianIQ n'acquiert aucun droit de propriété sur ces données.
            </p>
          </section>

          <section>
            <h2>6. Obligations de l'Utilisateur</h2>
            <p>L'utilisateur s'engage à :</p>
            <ul>
              <li>Ne pas utiliser le service à des fins illégales ou malveillantes.</li>
              <li>Ne pas tenter de porter atteinte à l'intégrité ou à la sécurité de la plateforme (pentesting non autorisé, injection, etc.).</li>
              <li>Ne soumettre que des données professionnelles pour lesquelles il dispose des droits nécessaires.</li>
            </ul>
          </section>

          <section>
            <h2>7. Limitation de Responsabilité</h2>
            <p>
              Le service est fourni "tel quel". L'éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le service, 
              y compris les pertes de données ou interruptions d'activité, sauf en cas de faute lourde prouvée de sa part.
            </p>
          </section>

          <section>
            <h2>8. Modification et Résiliation</h2>
            <p>
              L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. L'utilisateur sera notifié des changements substantiels.
              L'accès au service peut être suspendu ou résilié de plein droit en cas de non-respect des présentes conditions.
            </p>
          </section>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default Terms;