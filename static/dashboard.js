(function () {
  function esc(s) {
    if (!s) return "";
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }
  function fmtMoney(n) {
    if (n == null || isNaN(n)) return "—";
    return new Intl.NumberFormat("en-EU", { style: "currency", currency: "EUR" }).format(n);
  }
  function load() {
    fetch("/api/dashboard")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var grid = document.getElementById("stats-grid");
        grid.innerHTML =
          '<div class="stat-box"><span class="value">' + data.leads_count + '</span><span class="label">Active leads</span></div>' +
          '<div class="stat-box"><span class="value">' + data.leads_new + '</span><span class="label">New leads</span></div>' +
          '<div class="stat-box"><span class="value">' + data.customers_count + '</span><span class="label">Customers</span></div>' +
          '<div class="stat-box"><span class="value">' + data.vehicles_available + '</span><span class="label">Vehicles available</span></div>' +
          '<div class="stat-box"><span class="value">' + data.vehicles_sold + '</span><span class="label">Sold</span></div>' +
          '<div class="stat-box"><span class="value">' + data.deals_open + '</span><span class="label">Open deals</span></div>' +
          '<div class="stat-box"><span class="value">' + data.deals_won + '</span><span class="label">Won</span></div>' +
          '<div class="stat-box"><span class="value">' + fmtMoney(data.revenue) + '</span><span class="label">Revenue</span></div>';
        var leadsEl = document.getElementById("recent-leads");
        if (data.recent_leads.length === 0) {
          leadsEl.innerHTML = '<p class="empty">No leads yet.</p>';
        } else {
          leadsEl.innerHTML = data.recent_leads.map(function (l) {
            return '<div class="item"><strong>' + esc(l.name) + '</strong><span>' + esc(l.status) + (l.vehicle_interest ? " · " + esc(l.vehicle_interest) : "") + '</span></div>';
          }).join("");
        }
        var dealsEl = document.getElementById("recent-deals");
        if (data.recent_deals.length === 0) {
          dealsEl.innerHTML = '<p class="empty">No deals yet.</p>';
        } else {
          dealsEl.innerHTML = data.recent_deals.map(function (d) {
            var name = d.customer_name || d.lead_name || "—";
            var car = (d.make && d.model) ? d.make + " " + d.model : "—";
            return '<div class="item"><strong>' + esc(name) + '</strong><span>' + esc(car) + " · " + esc(d.stage) + " " + (d.amount ? fmtMoney(d.amount) : "") + '</span></div>';
          }).join("");
        }
      });
  }
  load();
})();
