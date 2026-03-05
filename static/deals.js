(function () {
  var listEl = document.getElementById("deals-list");
  var formPanel = document.getElementById("form-panel");
  var form = document.getElementById("deal-form");
  var formTitle = document.getElementById("form-title");
  var dealId = document.getElementById("deal-id");
  var customerSelect = document.getElementById("customer_id");
  var leadSelect = document.getElementById("lead_id");
  var vehicleSelect = document.getElementById("vehicle_id");
  function esc(s) { if (!s) return ""; var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function fmtMoney(n) { return n != null && !isNaN(n) ? new Intl.NumberFormat("en-EU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n) : "—"; }
  function loadOptions() {
    Promise.all([
      fetch("/api/customers").then(function (r) { return r.json(); }),
      fetch("/api/leads").then(function (r) { return r.json(); }),
      fetch("/api/vehicles").then(function (r) { return r.json(); })
    ]).then(function (arr) {
      var customers = arr[0], leads = arr[1], vehicles = arr[2];
      customerSelect.innerHTML = "<option value=\"\">— Select —</option>" + customers.map(function (c) { return "<option value=\"" + c.id + "\">" + esc(c.name) + "</option>"; }).join("");
      leadSelect.innerHTML = "<option value=\"\">— Select —</option>" + leads.map(function (l) { return "<option value=\"" + l.id + "\">" + esc(l.name) + "</option>"; }).join("");
      vehicleSelect.innerHTML = "<option value=\"\">— Select —</option>" + vehicles.filter(function (v) { return v.status === "available" || !v.status; }).map(function (v) { return "<option value=\"" + v.id + "\">" + esc(v.make + " " + v.model + " " + (v.year || "") + " " + fmtMoney(v.price)) + "</option>"; }).join("");
    });
  }
  function showForm(deal) {
    loadOptions();
    formPanel.classList.remove("hidden");
    if (deal) {
      formTitle.textContent = "Edit deal";
      dealId.value = deal.id;
      setTimeout(function () {
        document.getElementById("customer_id").value = deal.customer_id || "";
        document.getElementById("lead_id").value = deal.lead_id || "";
        document.getElementById("vehicle_id").value = deal.vehicle_id || "";
        document.getElementById("stage").value = deal.stage || "quote";
        document.getElementById("amount").value = deal.amount != null ? deal.amount : "";
        document.getElementById("notes").value = deal.notes || "";
      }, 100);
    } else {
      formTitle.textContent = "New deal";
      dealId.value = "";
      form.reset();
    }
  }
  function hideForm() { formPanel.classList.add("hidden"); form.reset(); dealId.value = ""; }
  function load() {
    var stage = document.getElementById("filter-stage").value;
    var url = "/api/deals" + (stage ? "?stage=" + encodeURIComponent(stage) : "");
    fetch(url).then(function (r) { return r.json(); }).then(function (items) {
      if (items.length === 0) {
        listEl.innerHTML = "<p class=\"empty\">No deals. Create one with the button above.</p>";
        return;
      }
      listEl.innerHTML = items.map(function (d) {
        var name = d.customer_name || d.lead_name || "—";
        var car = (d.make && d.model) ? d.make + " " + d.model + " (" + (d.year || "") + ")" : "—";
        return "<div class=\"data-row\"><div class=\"info\"><strong>" + esc(name) + "</strong><span>" + esc(car) + " · " + fmtMoney(d.amount) + "</span></div><span class=\"meta\"><span class=\"badge badge-" + (d.stage || "quote") + "\">" + esc(d.stage) + "</span></span><div class=\"actions\"><button type=\"button\" class=\"btn btn-secondary\" data-edit>Edit</button><button type=\"button\" class=\"btn btn-danger\" data-delete>Delete</button></div></div>";
      }).join("");
      listEl.querySelectorAll("[data-edit]").forEach(function (btn, idx) {
        btn.addEventListener("click", function () { showForm(items[idx]); });
      });
      listEl.querySelectorAll("[data-delete]").forEach(function (btn, idx) {
        btn.addEventListener("click", function () {
          if (!confirm("Delete this deal?")) return;
          fetch("/api/deals/" + items[idx].id, { method: "DELETE" }).then(function () { load(); hideForm(); });
        });
      });
    });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = dealId.value;
    var payload = {
      customer_id: customerSelect.value ? parseInt(customerSelect.value, 10) : null,
      lead_id: leadSelect.value ? parseInt(leadSelect.value, 10) : null,
      vehicle_id: vehicleSelect.value ? parseInt(vehicleSelect.value, 10) : null,
      stage: document.getElementById("stage").value,
      amount: document.getElementById("amount").value ? parseFloat(document.getElementById("amount").value) : null,
      notes: document.getElementById("notes").value
    };
    var opts = { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) };
    fetch(id ? "/api/deals/" + id : "/api/deals", opts).then(function () { load(); hideForm(); });
  });
  document.getElementById("btn-new").addEventListener("click", function () { showForm(null); });
  document.getElementById("btn-close-form").addEventListener("click", hideForm);
  document.getElementById("btn-cancel").addEventListener("click", hideForm);
  document.getElementById("filter-stage").addEventListener("change", load);
  load();
})();
