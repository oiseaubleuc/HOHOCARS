(function () {
  var listEl = document.getElementById("vehicles-list");
  var formPanel = document.getElementById("form-panel");
  var form = document.getElementById("vehicle-form");
  var formTitle = document.getElementById("form-title");
  var vehicleId = document.getElementById("vehicle-id");
  function esc(s) { if (!s) return ""; var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function fmtPrice(n) { return n != null && !isNaN(n) ? new Intl.NumberFormat("en-EU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n) : "—"; }
  function showForm(vehicle) {
    formPanel.classList.remove("hidden");
    if (vehicle) {
      formTitle.textContent = "Edit vehicle";
      vehicleId.value = vehicle.id;
      document.getElementById("make").value = vehicle.make || "";
      document.getElementById("model").value = vehicle.model || "";
      document.getElementById("year").value = vehicle.year || "";
      document.getElementById("trim").value = vehicle.trim || "";
      document.getElementById("vin").value = vehicle.vin || "";
      document.getElementById("price").value = vehicle.price != null ? vehicle.price : "";
      document.getElementById("mileage_km").value = vehicle.mileage_km != null ? vehicle.mileage_km : "";
      document.getElementById("fuel_type").value = vehicle.fuel_type || "";
      document.getElementById("transmission").value = vehicle.transmission || "";
      document.getElementById("color").value = vehicle.color || "";
      document.getElementById("status").value = vehicle.status || "available";
      document.getElementById("notes").value = vehicle.notes || "";
    } else {
      formTitle.textContent = "Add vehicle";
      vehicleId.value = "";
      form.reset();
    }
  }
  function hideForm() { formPanel.classList.add("hidden"); form.reset(); vehicleId.value = ""; }
  function load() {
    var status = document.getElementById("filter-status").value;
    var url = "/api/vehicles" + (status ? "?status=" + encodeURIComponent(status) : "");
    fetch(url).then(function (r) { return r.json(); }).then(function (items) {
      if (items.length === 0) {
        listEl.innerHTML = "<p class=\"empty\">No vehicles. Add one with the button above.</p>";
        return;
      }
      listEl.innerHTML = items.map(function (v) {
        var title = esc(v.make) + " " + esc(v.model) + " (" + (v.year || "") + ")";
        var sub = fmtPrice(v.price) + (v.mileage_km ? " · " + v.mileage_km + " km" : "") + (v.vin ? " · " + esc(v.vin) : "");
        return "<div class=\"data-row\"><div class=\"info\"><strong>" + title + "</strong><span>" + sub + "</span></div><span class=\"meta\"><span class=\"badge badge-" + (v.status || "available") + "\">" + esc(v.status) + "</span></span><div class=\"actions\"><button type=\"button\" class=\"btn btn-secondary\" data-edit>Edit</button><button type=\"button\" class=\"btn btn-danger\" data-delete>Delete</button></div></div>";
      }).join("");
      listEl.querySelectorAll("[data-edit]").forEach(function (btn, idx) {
        btn.addEventListener("click", function () { showForm(items[idx]); });
      });
      listEl.querySelectorAll("[data-delete]").forEach(function (btn, idx) {
        btn.addEventListener("click", function () {
          if (!confirm("Delete this vehicle?")) return;
          fetch("/api/vehicles/" + items[idx].id, { method: "DELETE" }).then(function () { load(); hideForm(); });
        });
      });
    });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = vehicleId.value;
    var payload = {
      make: document.getElementById("make").value,
      model: document.getElementById("model").value,
      year: parseInt(document.getElementById("year").value, 10),
      trim: document.getElementById("trim").value,
      vin: document.getElementById("vin").value,
      price: parseFloat(document.getElementById("price").value) || 0,
      mileage_km: parseInt(document.getElementById("mileage_km").value, 10) || 0,
      fuel_type: document.getElementById("fuel_type").value,
      transmission: document.getElementById("transmission").value,
      color: document.getElementById("color").value,
      status: document.getElementById("status").value,
      notes: document.getElementById("notes").value
    };
    var opts = { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) };
    fetch(id ? "/api/vehicles/" + id : "/api/vehicles", opts).then(function () { load(); hideForm(); });
  });
  document.getElementById("btn-new").addEventListener("click", function () { showForm(null); });
  document.getElementById("btn-close-form").addEventListener("click", hideForm);
  document.getElementById("btn-cancel").addEventListener("click", hideForm);
  document.getElementById("filter-status").addEventListener("change", load);
  load();
})();
