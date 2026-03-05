(function () {
  var listEl = document.getElementById("customers-list");
  var formPanel = document.getElementById("form-panel");
  var form = document.getElementById("customer-form");
  var formTitle = document.getElementById("form-title");
  var customerId = document.getElementById("customer-id");
  function esc(s) { if (!s) return ""; var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function showForm(customer) {
    formPanel.classList.remove("hidden");
    if (customer) {
      formTitle.textContent = "Edit customer";
      customerId.value = customer.id;
      document.getElementById("name").value = customer.name || "";
      document.getElementById("email").value = customer.email || "";
      document.getElementById("phone").value = customer.phone || "";
      document.getElementById("address").value = customer.address || "";
      document.getElementById("notes").value = customer.notes || "";
    } else {
      formTitle.textContent = "New customer";
      customerId.value = "";
      form.reset();
    }
  }
  function hideForm() { formPanel.classList.add("hidden"); form.reset(); customerId.value = ""; }
  function load() {
    var q = document.getElementById("search").value.trim();
    var url = "/api/customers" + (q ? "?q=" + encodeURIComponent(q) : "");
    fetch(url).then(function (r) { return r.json(); }).then(function (items) {
      if (items.length === 0) {
        listEl.innerHTML = "<p class=\"empty\">No customers. Add one with the button above.</p>";
        return;
      }
      listEl.innerHTML = items.map(function (c) {
        return "<div class=\"data-row\"><div class=\"info\"><strong>" + esc(c.name) + "</strong><span>" + esc(c.email || c.phone || "—") + "</span></div><div class=\"actions\"><button type=\"button\" class=\"btn btn-secondary\" data-edit>Edit</button><button type=\"button\" class=\"btn btn-danger\" data-delete>Delete</button></div></div>";
      }).join("");
      listEl.querySelectorAll("[data-edit]").forEach(function (btn, idx) {
        btn.addEventListener("click", function () { showForm(items[idx]); });
      });
      listEl.querySelectorAll("[data-delete]").forEach(function (btn, idx) {
        btn.addEventListener("click", function () {
          if (!confirm("Delete this customer?")) return;
          fetch("/api/customers/" + items[idx].id, { method: "DELETE" }).then(function () { load(); hideForm(); });
        });
      });
    });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = customerId.value;
    var payload = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
      notes: document.getElementById("notes").value
    };
    var opts = { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) };
    fetch(id ? "/api/customers/" + id : "/api/customers", opts).then(function () { load(); hideForm(); });
  });
  document.getElementById("btn-new").addEventListener("click", function () { showForm(null); });
  document.getElementById("btn-close-form").addEventListener("click", hideForm);
  document.getElementById("btn-cancel").addEventListener("click", hideForm);
  document.getElementById("search").addEventListener("input", function () { load(); });
  load();
})();
