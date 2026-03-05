# Projet S/4CRM – Vente de voitures

## 1. Vue d’ensemble

**Nom du projet :** S/4CRM Vente Automobile  
**Objectif :** Mise en place d’un CRM type S/4HANA CRM pour la gestion du cycle de vente véhicules (lead → opportunité → commande).

**Périmètre métier :** Concession / réseau de vente automobile.

---

## 2. Modules S/4CRM couverts

| Module S/4CRM        | Description                          | Dans ce projet        |
|----------------------|--------------------------------------|------------------------|
| **Sales (Ventes)**   | Leads, opportunités, commandes       | ✅ Complet             |
| **Business Partner** | Clients / partenaires                | ✅ Customers           |
| **Product Master**   | Catalogue produits (véhicules)       | ✅ Vehicle inventory   |
| **Activities**       | Appels, réunions, essais             | ✅ Activities          |
| **Marketing**        | Campagnes, leads marketing           | Optionnel (sources)    |

---

## 3. Objets métier (entités S/4CRM)

### 3.1 Business Partner (Partenaire commercial)
- **Rôle :** Client / prospect.
- **Données :** Nom, email, téléphone, adresse, notes.
- **Équivalent app :** **Customers**.

### 3.2 Lead (Prospect)
- **Rôle :** Prise de contact non qualifiée (web, salon, téléphone, walk-in).
- **Données :** Nom, contact, source, statut, véhicule visé, budget, lien éventuel vers Business Partner.
- **Statuts type S/4CRM :** New → Contacted → Qualified → Converted / Lost.
- **Équivalent app :** **Leads**.

### 3.3 Opportunity (Opportunité)
- **Rôle :** Affaire commerciale liée à un partenaire et/ou un lead, avec véhicule et montant.
- **Étapes pipeline :** Quote (Devis) → Negotiation (Négociation) → Won / Lost.
- **Données :** Lien Lead, Business Partner, Produit (véhicule), stade, montant, notes.
- **Équivalent app :** **Deals**.

### 3.4 Product (Produit – véhicule)
- **Rôle :** Catalogue / stock véhicules.
- **Données :** Marque, modèle, année, VIN, prix, kilométrage, carburant, transmission, couleur, statut (disponible / réservé / vendu).
- **Équivalent app :** **Vehicles**.

### 3.5 Sales Order (Commande de vente)
- **Rôle :** Commande fermée (opportunité gagnée).
- **Dans ce projet :** Représentée par une opportunité au stade **Won** + éventuellement mise à jour du statut véhicule en **Sold**.

### 3.6 Activities (Activités)
- **Rôle :** Tâches liées à un lead ou une opportunité (appel, email, réunion, essai).
- **Données :** Type, description, date d’échéance, lien Lead/Opportunity.
- **Équivalent app :** **Activities**.

---

## 4. Processus métier (flux S/4CRM)

```
[Lead]  ──qualification──►  [Opportunity]  ──gagnée──►  [Sales Order / Véhicule vendu]
   │                              │
   └──── Activities (appels,      └──── Activities (devis, essai, négociation)
         emails, essais)
```

1. **Lead Management :** création lead (source, véhicule visé, budget) → qualification → conversion en opportunité ou perte.
2. **Opportunity Management :** création opportunité (client, lead, véhicule) → pipeline (Devis → Négociation → Gagné/Perdu).
3. **Order closure :** opportunité Gagnée = vente ; mise à jour du véhicule en « vendu » et enregistrement du montant (revenu).

---

## 5. Règles métier principales

- Un **Lead** peut être converti en **Business Partner** (customer) et donner une **Opportunity**.
- Une **Opportunity** doit être liée à un **Business Partner** et/ou un **Lead**, et optionnellement à un **Product** (véhicule).
- Quand une opportunité passe en **Won**, le véhicule associé peut passer en **Sold**.
- Les **Activities** sont rattachées à un Lead ou une Opportunity pour le suivi commercial.

---

## 6. Indicateurs (KPIs) type S/4CRM

- Nombre de leads actifs / nouveaux.
- Nombre d’opportunités ouvertes par stade (Quote, Negotiation).
- Taux de conversion Lead → Opportunity, Opportunity → Won.
- Chiffre d’affaires (somme des opportunités Won).
- Stock véhicules : disponibles / réservés / vendus.

---

## 7. Application livrée (CRM actuel)

L’application dans ce dépôt implémente ce modèle S/4CRM pour la vente de voitures :

- **Dashboard :** KPIs (leads, clients, véhicules, deals, revenu) + récents leads et deals.
- **Leads :** CRUD, sources, statuts, véhicule visé, budget.
- **Customers (Business Partners) :** CRUD, recherche.
- **Vehicles (Products) :** inventaire, statuts available / reserved / sold.
- **Deals (Opportunities) :** pipeline, lien client / lead / véhicule, stades, montant.
- **Activities :** tâches liées aux deals ou leads (call, email, meeting, test drive).

Lancer l’app : `python app.py` → http://127.0.0.1:5000

---

## 8. Évolutions possibles (roadmap S/4CRM)

- **Documents :** pièces jointes (devis, contrat) par opportunité.
- **Marketing :** campagnes et sources de leads (origine campagne).
- **Service :** suivi après-vente (contrats, SAV) sur le Business Partner.
- **Reporting :** rapports par commercial, par source, par modèle véhicule.
- **Intégration :** API REST pour connexion à un vrai S/4HANA ou autre ERP.

---

*Projet S/4CRM Vente de voitures – Document de définition.*
