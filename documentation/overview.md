NutryLog — Project Overview
🎯 Vision

NutryLog est une application web qui permet de :

enregistrer ses repas

suivre ses calories et macros

générer des menus hebdomadaires

analyser ses habitudes alimentaires

Le but est de fournir un outil simple, rapide et fiable pour gérer son alimentation sans dépendre d’applications fermées ou payantes.

NutryLog est conçu comme une plateforme technique sérieuse :

scalable

observable

dockerisée

prête pour le cloud

🧠 Core Features

NutryLog doit permettre :

1. Suivi des repas

créer un repas

ajouter des aliments

calculer calories, protéines, lipides, glucides

historique par jour / semaine

2. Catalogue d’aliments

recherche via API publique

stockage en base des aliments utilisés

valeurs nutritionnelles normalisées

3. Menus hebdomadaires

créer un menu pour une semaine

associer des repas à des jours

calcul automatique des totaux nutritionnels

4. Objectifs

calories cibles par jour

macros cibles

suivi des écarts

🏗️ Technical Goals

NutryLog n’est pas juste une app, c’est un projet d’architecture moderne.

Objectifs techniques :

Frontend : NuxtJS

Backend : NestJS

Base de données : PostgreSQL

Cache / sessions : Redis

Messaging : Kafka

Reverse proxy : Nginx

Observabilité :

Metrics → Prometheus

Logs → Loki

Traces → Tempo / Jaeger

Dashboards → Grafana

Déploiement :

Docker en local

Kubernetes en cible

🔁 Data Flow (simplifié)
User → NuxtJS → NestJS → PostgreSQL
                 ↓
               Redis
                 ↓
               Kafka


Nuxt gère l’UI + SSR

Nest gère la logique métier

PostgreSQL stocke les données

Redis accélère et gère les sessions

Kafka permet l’async (stats, events, logs)

🧭 Long-term Vision

NutryLog pourra évoluer vers :

mobile (Nuxt + Capacitor)

API publique

coaching nutritionnel

IA de recommandation de menus

La base est pensée dès le départ pour supporter la montée en charge et la complexité.