# 📄 Guide d'Export PDF/Word - GuardianIQ

## 🎯 Vue d'ensemble

Cette fonctionnalité permet d'exporter les analyses de sécurité en **PDF** et **Word (DOCX)** pour les questionnaires **validés** ou **rejetés**.

---

## ✨ Fonctionnalités

### Contenu du rapport

Les rapports générés incluent:

- ✅ **Informations générales** (Questionnaire, Chef de projet, Dates, Statut)
- ✅ **Scores CIA** (Cohérence, Confidentialité, Intégrité, Disponibilité)
- ✅ **Questions et Réponses** complètes
- ✅ **Analyse IA détaillée**
  - Résumé de l'analyse
  - Points forts
  - Points faibles
  - Recommandations
  - Incohérences détectées
- ✅ **Commentaires** de tous les utilisateurs
- ✅ **Historique des statuts**
- ✅ **Liste des documents** associés

### Formats disponibles

| Format | Extension | Usage |
|--------|-----------|-------|
| **PDF** | `.pdf` | Archivage, partage, présentation |
| **Word** | `.docx` | Édition, personnalisation, rapport final |

---

## 🔒 Permissions

### Qui peut exporter?

Les rapports peuvent être téléchargés par:

- ✅ **Chef de projet** (propriétaire de la réponse)
- ✅ **Analyste** (tous les rapports)
- ✅ **Business Owner** (rapports validés/rejetés)
- ✅ **Admin** (tous les rapports)

### Conditions d'export

- ⚠️ Le questionnaire doit avoir le statut **VALIDE** ou **REJETE**
- ⚠️ Une analyse IA doit avoir été générée
- ⚠️ L'utilisateur doit avoir les permissions appropriées

---

## 🚀 Utilisation

### Backend (API)

#### Endpoints

```http
# Export PDF
GET /api/responses/{id}/export/pdf/

# Export DOCX
GET /api/responses/{id}/export/docx/
```

#### Exemple avec cURL

```bash
# Export PDF
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -o rapport.pdf \
     http://localhost:8888/api/responses/1/export/pdf/

# Export Word
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -o rapport.docx \
     http://localhost:8888/api/responses/1/export/docx/
```

#### Réponses

**Succès (200 OK)**
```
Content-Type: application/pdf (ou application/vnd.openxmlformats-officedocument.wordprocessingml.document)
Content-Disposition: attachment; filename="Rapport_Projet_CRM_20251116_103000.pdf"

[Binary file content]
```

**Erreurs**

```json
// 400 Bad Request - Statut incorrect
{
  "error": "Le rapport ne peut être exporté que pour les questionnaires validés ou rejetés."
}

// 403 Forbidden - Pas de permission
{
  "detail": "Vous n'avez pas la permission d'exporter ce rapport."
}

// 404 Not Found - Réponse inexistante
{
  "detail": "Not found."
}

// 500 Internal Server Error - Erreur génération
{
  "error": "Erreur lors de la génération du PDF: ..."
}
```

---

### Frontend (React)

#### Intégration du composant

```jsx
import ExportButtons from '../components/ExportButtons';

function ResponseDetailPage() {
  const { response } = useResponse(); // Votre hook de récupération

  return (
    <div>
      {/* ... autres informations ... */}

      {/* Boutons d'export */}
      <ExportButtons
        responseId={response.id}
        status={response.status}
      />
    </div>
  );
}
```

#### Props du composant

| Prop | Type | Description |
|------|------|-------------|
| `responseId` | number | ID de la réponse au questionnaire |
| `status` | string | Statut actuel ('VALIDE', 'REJETE', etc.) |

#### États du composant

- **Statut non-exportable**: Affiche un message informatif
- **Chargement**: Spinner pendant la génération
- **Erreur**: Message d'erreur en cas de problème
- **Succès**: Téléchargement automatique du fichier

---

## 🎨 Personnalisation

### Styles PDF

Modifiez les styles dans `export_service.py` → `_get_pdf_styles()`:

```python
def _get_pdf_styles(self):
    return """
        @page {
            size: A4;
            margin: 2cm;
            /* Personnaliser en-tête et pied de page */
        }

        body {
            font-family: 'Arial', sans-serif;
            /* Personnaliser police, couleurs */
        }

        /* Ajouter vos styles custom */
    """
```

### Styles Word

Modifiez la génération DOCX dans `export_service.py` → `generate_docx()`:

```python
# Changer les couleurs
title.runs[0].font.color.rgb = RGBColor(30, 64, 175)

# Changer les marges
section.top_margin = Inches(1)

# Personnaliser les tableaux
table.style = 'Light Grid Accent 1'
```

### Template HTML

Modifiez `questionnaires/templates/questionnaires/export/report_template.html`:

```html
<!-- Personnaliser la structure du rapport -->
<div class="section">
    <h2>Votre section custom</h2>
    <!-- Votre contenu -->
</div>
```

---

## 🛠️ Installation & Déploiement

### 1. Dépendances

```bash
# Backend
pip install weasyprint python-docx

# Ou via requirements.txt (déjà ajouté)
pip install -r requirements.txt
```

### 2. Vérification

```bash
# Tester WeasyPrint
python -c "from weasyprint import HTML; print('WeasyPrint OK')"

# Tester python-docx
python -c "from docx import Document; print('python-docx OK')"
```

### 3. Build & Deploy

```bash
# Rebuild l'image backend
docker build -t rayandans/guardianiq:backend-latest ./backend

# Ou via Jenkins (automatique)
git add .
git commit -m "feat: Add PDF/Word export functionality"
git push
```

---

## 🧪 Tests

### Test manuel

```python
# Dans le shell Django
python manage.py shell

from questionnaires.models import QuestionnaireResponse
from questionnaires.export_service import ReportExportService

# Récupérer une réponse validée
response = QuestionnaireResponse.objects.filter(status='VALIDE').first()

# Tester PDF
service = ReportExportService(response.id)
pdf = service.generate_pdf()
print(f"PDF généré: {len(pdf.read())} bytes")

# Tester DOCX
docx = service.generate_docx()
print(f"DOCX généré: {len(docx.read())} bytes")
```

### Test API

```bash
# Obtenir un token
TOKEN=$(curl -X POST http://localhost:8888/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"analyste","password":"password"}' \
  | jq -r '.access')

# Tester export PDF
curl -H "Authorization: Bearer $TOKEN" \
     -o test_rapport.pdf \
     http://localhost:8888/api/responses/1/export/pdf/

# Vérifier le fichier
file test_rapport.pdf
# Output: test_rapport.pdf: PDF document, version 1.4
```

### Test Frontend

```javascript
// Dans la console navigateur
import questionnaireService from './services/questionnaireService';

// Tester export PDF
questionnaireService.exportResponsePdf(1)
  .then(response => console.log('PDF OK', response))
  .catch(error => console.error('Erreur', error));
```

---

## 📊 Exemples de rapports

### PDF - Aperçu
```
┌─────────────────────────────────────────────┐
│   Rapport d'Analyse de Sécurité             │
│   GuardianIQ                                │
│                                             │
│   Statut: [VALIDÉ]                          │
├─────────────────────────────────────────────┤
│                                             │
│   Informations Générales                    │
│   ┌───────────────┬─────────────────────┐   │
│   │ Questionnaire │ Projet CRM Interne  │   │
│   │ Chef de Projet│ Jean Dupont         │   │
│   └───────────────┴─────────────────────┘   │
│                                             │
│   Scores CIA                                │
│   ┌──────┬──────┬──────┬──────┐            │
│   │ Cohé │  C   │  I   │  A   │            │
│   │  85% │  90  │  88  │  82  │            │
│   └──────┴──────┴──────┴──────┘            │
│                                             │
│   Questions et Réponses...                  │
│   Analyse IA...                             │
│   Recommandations...                        │
└─────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Erreur: "WeasyPrint not found"

```bash
# Sur Ubuntu/Debian
sudo apt-get install python3-dev python3-pip python3-cffi python3-brotli libpango-1.0-0 libpangoft2-1.0-0

# Sur Windows
# Installer GTK+ : https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases
```

### Erreur: "PDF généré mais vide"

- Vérifier que le template HTML est présent
- Vérifier les données dans `_get_context_data()`
- Activer le mode debug Django

### Erreur: "Permission denied"

- Vérifier le rôle de l'utilisateur
- Vérifier le statut du questionnaire (VALIDE ou REJETE)
- Vérifier que l'utilisateur a accès à cette réponse

### Fichier téléchargé corrompu

```bash
# Vérifier le Content-Type dans la réponse
curl -I -H "Authorization: Bearer $TOKEN" \
     http://localhost:8888/api/responses/1/export/pdf/

# Doit contenir:
# Content-Type: application/pdf
# Content-Disposition: attachment; filename="..."
```

---

## 📈 Améliorations futures

### Idées d'évolution

1. **Templates multiples**
   - Template "Exécutif" (résumé court)
   - Template "Technique" (détails complets)
   - Template "Audit" (focus conformité)

2. **Personnalisation**
   - Logo personnalisé par client
   - Couleurs de l'entreprise
   - Sections custom

3. **Formats additionnels**
   - Excel (tableaux de données)
   - HTML (rapport web interactif)
   - Markdown (documentation technique)

4. **Fonctionnalités avancées**
   - Export multi-questionnaires (rapport consolidé)
   - Planification d'exports automatiques
   - Envoi email automatique après validation
   - Watermarking (confidentiel, brouillon, etc.)

5. **Analytics**
   - Tracking des téléchargements
   - Stats d'utilisation
   - Rapports les plus consultés

---

## 📞 Support

### Fichiers modifiés

#### Backend
- `backend/requirements.txt` - Dépendances ajoutées
- `backend/questionnaires/export_service.py` - Service d'export (nouveau)
- `backend/questionnaires/views.py` - Endpoints API
- `backend/questionnaires/templates/questionnaires/export/report_template.html` - Template PDF (nouveau)

#### Frontend
- `frontend/src/components/ExportButtons.js` - Composant React (nouveau)
- `frontend/src/styles/ExportButtons.css` - Styles (nouveau)
- `frontend/src/services/questionnaireService.js` - Méthodes API

### Logs & Debug

```python
# Activer les logs dans export_service.py
import logging
logger = logging.getLogger(__name__)

class ReportExportService:
    def generate_pdf(self):
        logger.info(f"Generating PDF for response {self.response.id}")
        # ... code
        logger.info(f"PDF generated successfully: {filename}")
```

---

## ✅ Checklist de déploiement

- [ ] Dépendances installées (`weasyprint`, `python-docx`)
- [ ] Template HTML créé
- [ ] Service d'export testé en local
- [ ] Endpoints API testés
- [ ] Composant React intégré
- [ ] Permissions vérifiées
- [ ] Tests manuels passés (PDF + DOCX)
- [ ] Build Docker OK
- [ ] Déploiement en staging
- [ ] Tests utilisateurs
- [ ] Déploiement en production ✅

---

**Version:** 1.0
**Date:** 2025-11-16
**Auteur:** Claude Assistant
**Projet:** GuardianIQ - Export Feature
