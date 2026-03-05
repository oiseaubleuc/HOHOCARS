# Car Vending CRM

CRM type **S/4CRM** pour la vente de voitures : leads, clients (Business Partners), inventaire véhicules, pipeline opportunités, activités.

📁 **Projet S/4CRM :** voir le dossier [`project/`](project/) pour la définition du projet (entités, processus, mapping S/4CRM ↔ application).

## Features

- **Dashboard** – KPIs (leads, customers, vehicles, deals, revenue), recent leads and deals
- **Leads** – Capture and qualify leads (source, status, vehicle interest, budget)
- **Customers** – Contact database with search
- **Vehicles** – Inventory (make, model, year, VIN, price, mileage, fuel, transmission, status: available/reserved/sold)
- **Deals** – Pipeline linked to customer, lead, and vehicle (stages: quote → negotiation → won/lost)
- **Activities** – Tasks linked to deals or leads (call, email, meeting, test drive) with due dates

## Run

```bash
cd "/Users/hamouchihoudaifa/Documents/IT Projects/CRM"
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open **http://127.0.0.1:5000**. Data is stored in SQLite (`crm.db`).

## Tech

- **Backend:** Flask, SQLite
- **Frontend:** HTML templates, vanilla JS, CSS
