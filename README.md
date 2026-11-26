<h1 align="center">HOHOCARS</h1>
<p align="center">
  <b>CRM for car dealerships, modelled on SAP S/4HANA CRM</b><br/>
  Follow every sale from first contact to signed deal: leads, customers, vehicle inventory, sales pipeline and activities.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-3-000000?style=flat-square&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-database-003B57?style=flat-square&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/REST-API-555?style=flat-square" />
</p>

---

## Features

| Module | What it does |
|---|---|
| **Dashboard** | KPIs for leads, customers, vehicles, deals and revenue; latest leads and deals |
| **Leads** | Capture and qualify prospects: source, status, vehicle of interest, budget |
| **Customers** | Searchable contact database (Business Partners) |
| **Vehicles** | Inventory with make, model, year, VIN, price, mileage, fuel, transmission and status (available / reserved / sold) |
| **Deals** | Sales pipeline linking customer, lead and vehicle: quote → negotiation → won / lost |
| **Activities** | Calls, emails, meetings and test drives linked to a lead or deal, with due dates |

## Sales process

```
Lead ──qualify──▶ Customer ──▶ Deal ──▶ quote ──▶ negotiation ──▶ won / lost
                                 │
                                 ├── Vehicle   (reserved, then sold)
                                 └── Activities (call, email, meeting, test drive)
```

## S/4HANA CRM mapping

The data model follows SAP S/4HANA CRM concepts (Sales, Business Partner, Product, Activities). The [`project/`](project/) folder contains the project definition and the full mapping between S/4CRM entities and this application:

| File | Content |
|---|---|
| [`S4CRM_Projet_Vente_Voitures.md`](project/S4CRM_Projet_Vente_Voitures.md) | Objectives, modules, entities, processes and KPIs |
| [`Mapping_S4CRM_Application.md`](project/Mapping_S4CRM_Application.md) | S/4CRM to application mapping: tables, screens, statuses |

## Architecture

| Layer | Technology |
|---|---|
| Backend | Flask, server-rendered templates |
| API | REST endpoints for every module (`/api/leads`, `/api/customers`, `/api/vehicles`, `/api/deals`, `/api/activities`, `/api/dashboard`) |
| Database | SQLite (`crm.db`, created automatically) |
| Frontend | HTML templates, vanilla JavaScript (one script per module), CSS |

```
HOHOCARS/
├── app.py            Flask app, database setup and REST API
├── templates/        one page per module + base layout
├── static/           JavaScript per module and styles
└── project/          S/4HANA CRM project documentation
```

## Getting started

```bash
git clone https://github.com/oiseaubleuc/HOHOCARS.git
cd HOHOCARS
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000

---

<p align="center">Built by <a href="https://github.com/oiseaubleuc">Hoho</a> · Belgium</p>
