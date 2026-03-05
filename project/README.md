# Projet S/4CRM – Vente de voitures

Ce dossier contient la définition du **projet S/4CRM pour la vente de voitures** et le mapping avec l’application CRM du dépôt.

## Fichiers

| Fichier | Description |
|---------|-------------|
| **S4CRM_Projet_Vente_Voitures.md** | Document de projet : objectifs, modules, entités S/4CRM, processus, KPIs, évolution. |
| **Mapping_S4CRM_Application.md** | Correspondance S/4CRM ↔ application (tables, écrans, statuts). |
| **README.md** | Ce fichier. |

## Résumé du projet

- **Objectif :** CRM type S/4HANA CRM pour la vente automobile (lead → opportunité → vente).
- **Modules :** Sales, Business Partner, Product (véhicules), Activities.
- **Application :** L’app CRM à la racine du dépôt implémente ce modèle (Dashboard, Leads, Customers, Vehicles, Deals, Activities).

Pour lancer l’application : à la racine du dépôt, `python app.py` puis ouvrir http://127.0.0.1:5000.
