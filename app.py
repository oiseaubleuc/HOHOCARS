"""
Car Vending CRM - Full dealership CRM
Leads, Customers, Vehicles, Deals, Activities
"""
import sqlite3
from datetime import datetime
from pathlib import Path

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
DB_PATH = Path(__file__).parent / "crm.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def row_to_dict(r):
    d = dict(r)
    for k, v in d.items():
        if isinstance(v, datetime):
            d[k] = v.isoformat()
    return d


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            source TEXT DEFAULT 'web',
            status TEXT DEFAULT 'new',
            vehicle_interest TEXT,
            budget_min REAL,
            budget_max REAL,
            notes TEXT,
            customer_id INTEGER REFERENCES customers(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            make TEXT NOT NULL,
            model TEXT NOT NULL,
            year INTEGER NOT NULL,
            trim TEXT,
            vin TEXT,
            price REAL NOT NULL,
            mileage_km INTEGER,
            fuel_type TEXT,
            transmission TEXT,
            color TEXT,
            status TEXT DEFAULT 'available',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS deals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER REFERENCES leads(id),
            customer_id INTEGER REFERENCES customers(id),
            vehicle_id INTEGER REFERENCES vehicles(id),
            stage TEXT DEFAULT 'quote',
            amount REAL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deal_id INTEGER REFERENCES deals(id),
            lead_id INTEGER REFERENCES leads(id),
            type TEXT NOT NULL,
            description TEXT,
            due_date DATE,
            completed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()


# ----- Pages -----
@app.route("/")
def index():
    return render_template("dashboard.html")


@app.route("/leads")
def leads_page():
    return render_template("leads.html")


@app.route("/customers")
def customers_page():
    return render_template("customers.html")


@app.route("/vehicles")
def vehicles_page():
    return render_template("vehicles.html")


@app.route("/deals")
def deals_page():
    return render_template("deals.html")


@app.route("/activities")
def activities_page():
    return render_template("activities.html")


# ----- Dashboard API -----
@app.route("/api/dashboard")
def dashboard_stats():
    conn = get_db()
    stats = {
        "leads_count": conn.execute("SELECT COUNT(*) FROM leads WHERE status NOT IN ('converted','lost')").fetchone()[0],
        "leads_new": conn.execute("SELECT COUNT(*) FROM leads WHERE status = 'new'").fetchone()[0],
        "customers_count": conn.execute("SELECT COUNT(*) FROM customers").fetchone()[0],
        "vehicles_available": conn.execute("SELECT COUNT(*) FROM vehicles WHERE status = 'available'").fetchone()[0],
        "vehicles_sold": conn.execute("SELECT COUNT(*) FROM vehicles WHERE status = 'sold'").fetchone()[0],
        "deals_open": conn.execute("SELECT COUNT(*) FROM deals WHERE stage NOT IN ('won','lost')").fetchone()[0],
        "deals_won": conn.execute("SELECT COUNT(*) FROM deals WHERE stage = 'won'").fetchone()[0],
        "revenue": conn.execute("SELECT COALESCE(SUM(amount),0) FROM deals WHERE stage = 'won'").fetchone()[0] or 0,
    }
    recent_leads = conn.execute(
        "SELECT * FROM leads ORDER BY created_at DESC LIMIT 5"
    ).fetchall()
    recent_deals = conn.execute(
        """SELECT d.*, c.name as customer_name, v.make || ' ' || v.model as vehicle_name
           FROM deals d
           LEFT JOIN customers c ON d.customer_id = c.id
           LEFT JOIN vehicles v ON d.vehicle_id = v.id
           ORDER BY d.updated_at DESC LIMIT 5"""
    ).fetchall()
    conn.close()
    stats["recent_leads"] = [row_to_dict(r) for r in recent_leads]
    stats["recent_deals"] = [row_to_dict(r) for r in recent_deals]
    return jsonify(stats)


# ----- Customers API -----
@app.route("/api/customers", methods=["GET"])
def list_customers():
    conn = get_db()
    q = request.args.get("q", "").strip()
    sql = "SELECT * FROM customers"
    params = []
    if q:
        sql += " WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?"
        params = [f"%{q}%", f"%{q}%", f"%{q}%"]
    sql += " ORDER BY name"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/customers", methods=["POST"])
def add_customer():
    data = request.get_json()
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO customers (name, email, phone, address, notes) VALUES (?, ?, ?, ?, ?)",
        (
            data.get("name", "").strip(),
            data.get("email", "").strip(),
            data.get("phone", "").strip(),
            data.get("address", "").strip(),
            data.get("notes", "").strip(),
        ),
    )
    conn.commit()
    cid = cur.lastrowid
    conn.close()
    return jsonify({"id": cid}), 201


@app.route("/api/customers/<int:cid>", methods=["GET"])
def get_customer(cid):
    conn = get_db()
    r = conn.execute("SELECT * FROM customers WHERE id = ?", (cid,)).fetchone()
    conn.close()
    if not r:
        return jsonify({"error": "Not found"}), 404
    return jsonify(row_to_dict(r))


@app.route("/api/customers/<int:cid>", methods=["PUT"])
def update_customer(cid):
    data = request.get_json()
    conn = get_db()
    conn.execute(
        "UPDATE customers SET name=?, email=?, phone=?, address=?, notes=? WHERE id=?",
        (
            data.get("name", "").strip(),
            data.get("email", "").strip(),
            data.get("phone", "").strip(),
            data.get("address", "").strip(),
            data.get("notes", "").strip(),
            cid,
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.route("/api/customers/<int:cid>", methods=["DELETE"])
def delete_customer(cid):
    conn = get_db()
    conn.execute("DELETE FROM customers WHERE id=?", (cid,))
    conn.commit()
    conn.close()
    return "", 204


# ----- Leads API -----
@app.route("/api/leads", methods=["GET"])
def list_leads():
    conn = get_db()
    status = request.args.get("status", "").strip()
    sql = "SELECT l.*, c.name as customer_name FROM leads l LEFT JOIN customers c ON l.customer_id = c.id"
    params = []
    if status:
        sql += " WHERE l.status = ?"
        params.append(status)
    sql += " ORDER BY l.created_at DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/leads", methods=["POST"])
def add_lead():
    data = request.get_json()
    conn = get_db()
    cur = conn.execute(
        """INSERT INTO leads (name, email, phone, source, status, vehicle_interest, budget_min, budget_max, notes, customer_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            data.get("name", "").strip(),
            data.get("email", "").strip(),
            data.get("phone", "").strip(),
            data.get("source", "web"),
            data.get("status", "new"),
            data.get("vehicle_interest", "").strip(),
            data.get("budget_min") or None,
            data.get("budget_max") or None,
            data.get("notes", "").strip(),
            data.get("customer_id") or None,
        ),
    )
    conn.commit()
    lid = cur.lastrowid
    conn.close()
    return jsonify({"id": lid}), 201


@app.route("/api/leads/<int:lid>", methods=["GET"])
def get_lead(lid):
    conn = get_db()
    r = conn.execute("SELECT * FROM leads WHERE id = ?", (lid,)).fetchone()
    conn.close()
    if not r:
        return jsonify({"error": "Not found"}), 404
    return jsonify(row_to_dict(r))


@app.route("/api/leads/<int:lid>", methods=["PUT"])
def update_lead(lid):
    data = request.get_json()
    conn = get_db()
    conn.execute(
        """UPDATE leads SET name=?, email=?, phone=?, source=?, status=?, vehicle_interest=?,
           budget_min=?, budget_max=?, notes=?, customer_id=? WHERE id=?""",
        (
            data.get("name", "").strip(),
            data.get("email", "").strip(),
            data.get("phone", "").strip(),
            data.get("source", "web"),
            data.get("status", "new"),
            data.get("vehicle_interest", "").strip(),
            data.get("budget_min") or None,
            data.get("budget_max") or None,
            data.get("notes", "").strip(),
            data.get("customer_id") or None,
            lid,
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.route("/api/leads/<int:lid>", methods=["DELETE"])
def delete_lead(lid):
    conn = get_db()
    conn.execute("DELETE FROM leads WHERE id=?", (lid,))
    conn.commit()
    conn.close()
    return "", 204


# ----- Vehicles API -----
@app.route("/api/vehicles", methods=["GET"])
def list_vehicles():
    conn = get_db()
    status = request.args.get("status", "").strip()
    sql = "SELECT * FROM vehicles"
    params = []
    if status:
        sql += " WHERE status = ?"
        params.append(status)
    sql += " ORDER BY created_at DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/vehicles", methods=["POST"])
def add_vehicle():
    data = request.get_json()
    conn = get_db()
    cur = conn.execute(
        """INSERT INTO vehicles (make, model, year, trim, vin, price, mileage_km, fuel_type, transmission, color, status, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            data.get("make", "").strip(),
            data.get("model", "").strip(),
            int(data.get("year", 0)),
            data.get("trim", "").strip(),
            data.get("vin", "").strip(),
            float(data.get("price", 0)),
            int(data.get("mileage_km") or 0),
            data.get("fuel_type", "").strip(),
            data.get("transmission", "").strip(),
            data.get("color", "").strip(),
            data.get("status", "available"),
            data.get("notes", "").strip(),
        ),
    )
    conn.commit()
    vid = cur.lastrowid
    conn.close()
    return jsonify({"id": vid}), 201


@app.route("/api/vehicles/<int:vid>", methods=["GET"])
def get_vehicle(vid):
    conn = get_db()
    r = conn.execute("SELECT * FROM vehicles WHERE id = ?", (vid,)).fetchone()
    conn.close()
    if not r:
        return jsonify({"error": "Not found"}), 404
    return jsonify(row_to_dict(r))


@app.route("/api/vehicles/<int:vid>", methods=["PUT"])
def update_vehicle(vid):
    data = request.get_json()
    conn = get_db()
    conn.execute(
        """UPDATE vehicles SET make=?, model=?, year=?, trim=?, vin=?, price=?, mileage_km=?,
           fuel_type=?, transmission=?, color=?, status=?, notes=? WHERE id=?""",
        (
            data.get("make", "").strip(),
            data.get("model", "").strip(),
            int(data.get("year", 0)),
            data.get("trim", "").strip(),
            data.get("vin", "").strip(),
            float(data.get("price", 0)),
            int(data.get("mileage_km") or 0),
            data.get("fuel_type", "").strip(),
            data.get("transmission", "").strip(),
            data.get("color", "").strip(),
            data.get("status", "available"),
            data.get("notes", "").strip(),
            vid,
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.route("/api/vehicles/<int:vid>", methods=["DELETE"])
def delete_vehicle(vid):
    conn = get_db()
    conn.execute("DELETE FROM vehicles WHERE id=?", (vid,))
    conn.commit()
    conn.close()
    return "", 204


# ----- Deals API -----
@app.route("/api/deals", methods=["GET"])
def list_deals():
    conn = get_db()
    stage = request.args.get("stage", "").strip()
    sql = """SELECT d.*, c.name as customer_name, l.name as lead_name, v.make, v.model, v.year, v.price as vehicle_price
             FROM deals d
             LEFT JOIN customers c ON d.customer_id = c.id
             LEFT JOIN leads l ON d.lead_id = l.id
             LEFT JOIN vehicles v ON d.vehicle_id = v.id"""
    params = []
    if stage:
        sql += " WHERE d.stage = ?"
        params.append(stage)
    sql += " ORDER BY d.updated_at DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/deals", methods=["POST"])
def add_deal():
    data = request.get_json()
    conn = get_db()
    cur = conn.execute(
        """INSERT INTO deals (lead_id, customer_id, vehicle_id, stage, amount, notes)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (
            data.get("lead_id") or None,
            data.get("customer_id") or None,
            data.get("vehicle_id") or None,
            data.get("stage", "quote"),
            data.get("amount") or None,
            data.get("notes", "").strip(),
        ),
    )
    conn.commit()
    did = cur.lastrowid
    conn.execute("UPDATE deals SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (did,))
    conn.commit()
    conn.close()
    return jsonify({"id": did}), 201


@app.route("/api/deals/<int:did>", methods=["GET"])
def get_deal(did):
    conn = get_db()
    r = conn.execute(
        """SELECT d.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
                  l.name as lead_name, v.make, v.model, v.year, v.vin, v.price as vehicle_price
           FROM deals d
           LEFT JOIN customers c ON d.customer_id = c.id
           LEFT JOIN leads l ON d.lead_id = l.id
           LEFT JOIN vehicles v ON d.vehicle_id = v.id
           WHERE d.id = ?""",
        (did,),
    ).fetchone()
    conn.close()
    if not r:
        return jsonify({"error": "Not found"}), 404
    return jsonify(row_to_dict(r))


@app.route("/api/deals/<int:did>", methods=["PUT"])
def update_deal(did):
    data = request.get_json()
    conn = get_db()
    conn.execute(
        """UPDATE deals SET lead_id=?, customer_id=?, vehicle_id=?, stage=?, amount=?, notes=?, updated_at=CURRENT_TIMESTAMP
           WHERE id=?""",
        (
            data.get("lead_id") or None,
            data.get("customer_id") or None,
            data.get("vehicle_id") or None,
            data.get("stage", "quote"),
            data.get("amount") or None,
            data.get("notes", "").strip(),
            did,
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.route("/api/deals/<int:did>", methods=["DELETE"])
def delete_deal(did):
    conn = get_db()
    conn.execute("DELETE FROM deals WHERE id=?", (did,))
    conn.commit()
    conn.close()
    return "", 204


# ----- Activities API -----
@app.route("/api/activities", methods=["GET"])
def list_activities():
    conn = get_db()
    deal_id = request.args.get("deal_id", type=int)
    lead_id = request.args.get("lead_id", type=int)
    sql = "SELECT * FROM activities WHERE 1=1"
    params = []
    if deal_id:
        sql += " AND deal_id = ?"
        params.append(deal_id)
    if lead_id:
        sql += " AND lead_id = ?"
        params.append(lead_id)
    sql += " ORDER BY due_date ASC, created_at DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return jsonify([row_to_dict(r) for r in rows])


@app.route("/api/activities", methods=["POST"])
def add_activity():
    data = request.get_json()
    conn = get_db()
    cur = conn.execute(
        """INSERT INTO activities (deal_id, lead_id, type, description, due_date, completed_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (
            data.get("deal_id") or None,
            data.get("lead_id") or None,
            data.get("type", "call"),
            data.get("description", "").strip(),
            data.get("due_date") or None,
            data.get("completed_at") or None,
        ),
    )
    conn.commit()
    aid = cur.lastrowid
    conn.close()
    return jsonify({"id": aid}), 201


@app.route("/api/activities/<int:aid>", methods=["PUT"])
def update_activity(aid):
    data = request.get_json()
    conn = get_db()
    conn.execute(
        """UPDATE activities SET deal_id=?, lead_id=?, type=?, description=?, due_date=?, completed_at=? WHERE id=?""",
        (
            data.get("deal_id") or None,
            data.get("lead_id") or None,
            data.get("type", "call"),
            data.get("description", "").strip(),
            data.get("due_date") or None,
            data.get("completed_at") or None,
            aid,
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.route("/api/activities/<int:aid>", methods=["DELETE"])
def delete_activity(aid):
    conn = get_db()
    conn.execute("DELETE FROM activities WHERE id=?", (aid,))
    conn.commit()
    conn.close()
    return "", 204


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
