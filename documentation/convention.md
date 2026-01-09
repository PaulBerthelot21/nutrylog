NutryLog — Code & Workflow Conventions
🎯 Objectif

Ces conventions garantissent que le projet reste :

lisible

maintenable

scalable

compatible équipe + CI/CD

Aucune PR ne doit violer ces règles.

🧩 1. Structure du repository
nutrylog/
├─ frontend/     # NuxtJS
├─ backend/      # NestJS
├─ docker/       # Docker, Nginx, K8s
├─ documentation/
└─ README.md


Chaque couche est indépendante et versionnée ensemble.

🧪 2. Environnements
Environnement	Branche
dev	develop
test	staging
prod	main

main doit toujours être déployable

pas de commit direct sur main

📝 3. Convention de commits (Conventional Commits)

Format :

<type>: <message>


Types autorisés :

Type	Utilisation
feat	Nouvelle fonctionnalité
fix	Correction de bug
chore	Config, dépendances, setup
refactor	Restructuration du code
docs	Documentation
test	Tests
style	Formatage, lint

Exemples :

feat: add meal creation endpoint
fix: correct calorie calculation
chore: update docker-compose
docs: add architecture documentation

🧱 4. Architecture Frontend (Nuxt)

Règles :

aucune logique métier dans les composants UI

les appels API passent par /services

l’état global passe par stores

frontend/
├─ pages/
├─ components/
├─ services/
├─ stores/
└─ types/

🧱 5. Architecture Backend (NestJS)

Structure :

backend/src/
├─ modules/
│   ├─ users/
│   ├─ meals/
│   ├─ foods/
│   └─ menus/
├─ common/
└─ main.ts


Règles :

1 module = 1 domaine métier

pas de SQL dans les controllers

pas de logique métier dans les DTO

🔗 6. API Design (REST)

Règles :

noms au pluriel

pas de verbes dans les URLs

Exemples :

GET    /meals
POST   /meals
GET    /meals/{id}
DELETE /meals/{id}


Les actions complexes passent par :

POST /menus/generate

🧬 7. Naming conventions
Variables
camelCase

Classes
PascalCase

Fichiers
kebab-case.ts
meal.service.ts
meal.controller.ts

🧪 8. Tests

chaque module NestJS doit avoir :

unit tests

integration tests si logique métier

le frontend doit tester :

stores

services

🚫 9. Ce qui est interdit

logique métier dans le frontend

accès direct à la DB depuis un controller

commit sans message conventionné

console.log en prod

secrets dans le repo

NutryLog doit rester un projet propre, sérieux et industrialisable.