# Mapping S/4CRM ↔ Application CRM Vente Voitures

Correspondance entre les concepts SAP S/4HANA CRM et les écrans/entités de l’application.

| Concept S/4CRM        | Entité / écran application | Table BDD | Remarque |
|-----------------------|----------------------------|-----------|----------|
| Business Partner      | Customers                  | `customers` | Client / partenaire |
| Lead                  | Leads                      | `leads`     | Source, statut, budget, véhicule visé |
| Opportunity           | Deals                      | `deals`     | Pipeline Quote → Negotiation → Won/Lost |
| Product (catalogue)    | Vehicles                   | `vehicles`  | Inventaire véhicules |
| Sales Order           | Deal Won + Vehicle Sold    | `deals` + `vehicles` | Pas d’objet Commande séparé ; représenté par deal gagné |
| Activity              | Activities                 | `activities` | Lié à Deal ou Lead |

## Statuts et étapes

**Leads (S/4CRM Lead status)**  
- New → Contacted → Qualified → Converted / Lost  

**Deals / Opportunities (S/4CRM Opportunity stage)**  
- Quote → Negotiation → Won / Lost  

**Vehicles / Products (disponibilité)**  
- Available → Reserved → Sold  

## Flux recommandé

1. Créer un **Lead** (prospect).
2. Créer un **Customer** si le prospect devient client (ou lier le lead à un customer existant).
3. Créer une **Opportunity (Deal)** liée au Lead et/ou au Customer, et optionnellement à un **Vehicle**.
4. Saisir des **Activities** (appels, essais, réunions) sur le Lead ou l’Opportunity.
5. Quand l’affaire est gagnée : passer l’Opportunity en **Won**, mettre le véhicule en **Sold**.
