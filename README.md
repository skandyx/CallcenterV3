# Call Center Pulse

**Call Center Pulse** est un tableau de bord analytique en temps réel conçu pour les centres d'appels modernes. Il offre une visualisation claire des indicateurs de performance clés (KPI) en utilisant des données diffusées en continu, une détection d'anomalies alimentée par l'IA et une vue murale (wallboard) pour un suivi en direct.

## ✨ Fonctionnalités

- **Tableau de bord en temps réel :** Visualisez les métriques cruciales telles que le volume total d'appels, le temps d'attente moyen, le niveau de service et le taux de réponse.
- **Filtrage par date :** Analysez les performances historiques en sélectionnant des dates spécifiques.
- **Journaux d'appels détaillés :** Explorez les données d'appels simplifiées et avancées pour une analyse approfondie.
- **Distribution des appels :** Comprenez la répartition géographique de vos appels.
- **Vue Murale (Wallboard) :** Un affichage optimisé pour les grands écrans montrant le statut des agents et des files d'attente en temps réel.
- **Détection d'anomalies par IA :** Utilisez Genkit de Google pour analyser les données d'appel et identifier des schémas inhabituels ou des problèmes potentiels.
- **Configuration facile :** Gérez les paramètres de l'application, y compris l'activation/désactivation du streaming de données, des fonctionnalités d'IA, et la gestion des données.

## 🚀 Pile Technique

- **Framework :** [Next.js](https://nextjs.org/) (avec App Router)
- **Langage :** [TypeScript](https://www.typescriptlang.org/)
- **UI :** [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **IA Générative :** [Google Genkit](https://firebase.google.com/docs/genkit)
- **Icônes :** [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## 🔧 Installation et Lancement

1.  **Installer les dépendances :**
    ```bash
    npm install
    ```

2.  **Lancer le serveur de développement :**
    ```bash
    npm run dev
    ```
    L'application sera accessible à l'adresse [http://localhost:9002](http://localhost:9002).

## ⚙️ Utilisation

### Configuration des Endpoints

Pour alimenter le tableau de bord avec des données, votre système PBX ou tout autre source de données doit envoyer des requêtes `POST` aux endpoints suivants. Vous pouvez trouver les URLs complètes dans la boîte de dialogue des **Paramètres** de l'application.

- **Données d'appel de base :** `/api/stream`
- **Données d'appel avancées :** `/api/stream/advanced-calls`
- **Statut des agents :** `/api/stream/agent-status`

### Exemples de requêtes `curl`

Voici comment vous pouvez simuler l'envoi de données à l'aide de `curl`. Assurez-vous d'abord d'activer le **Data Streaming** dans les paramètres de l'application.

**Envoyer une donnée d'appel de base :**
```bash
curl -X POST http://localhost:9002/api/stream \
-H "Content-Type: application/json" \
-d '{
  "callId": "c1",
  "timestamp": "2024-07-15T10:00:00Z",
  "status": "completed",
  "duration": 120,
  "queue": "Support"
}'
```

**Envoyer un événement d'appel avancé :**
```bash
curl -X POST http://localhost:9002/api/stream/advanced-calls \
-H "Content-Type: application/json" \
-d '{
  "callId": "c1",
  "timestamp": "2024-07-15T10:01:00Z",
  "event": "transfer",
  "from": "Agent-007",
  "to": "Sales"
}'
```

**Envoyer un statut d'agent :**
```bash
curl -X POST http://localhost:9002/api/stream/agent-status \
-H "Content-Type: application/json" \
-d '{
  "agentId": "Agent-007",
  "agentName": "James Bond",
  "timestamp": "2024-07-15T10:05:00Z",
  "status": "on_call",
  "queue": "Support"
}'
```

### Gestion des Données

Dans la boîte de dialogue des **Paramètres**, vous pouvez :
- **Activer/Désactiver le streaming de données.**
- **Activer/Désactiver les fonctionnalités d'analyse par IA.**
- **Supprimer toutes les données** stockées dans l'application. (Attention : cette action est irréversible).
