(function () {
  var listEl = document.getElementById("leads-list");
  var formPanel = document.getElementById("form-panel");
  var form = document.getElementById("lead-form");
  var formTitle = document.getElementById("form-title");
  var leadId = document.getElementById("lead-id");
  function esc(s) { if (!s) return ""; var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function showForm(lead) {
    formPanel.classList.remove("hidden");
    if (lead) {
      formTitle.textContent = "Edit lead";
      leadId.value = lead.id;
      document.getElementById("name").value = lead.name || "";
      document.getElementById("email").value = lead.email || "";
      document.getElementById("phone").value = lead.phone || "";
      document.getElementById("source").value = lead.source || "web";
      document.getElementById("status").value = lead.status || "new";
      document.getElementById("vehicle_interest").value = lead.vehicle_interest || "";
      document.getElementById("budget_min").value = lead.budget_min || "";
      document.getElementById("budget_max").value = lead.budget_max || "";
      document.getElementById("notes").value = lead.notes || "";
    } else {
      formTitle.textContent = "New lead";
      leadId.value = "";
      form.reset();
    }
  }
  function hideForm() { formPanel.classList.add("hidden"); form.reset(); leadId.value = ""; }
  function load() {
    var status = document.getElementById("filter-status").value;
    var url = "/api/leads" + (status ? "?status=" + encodeURIComponent(status) : "");
    fetch(url).then(function (r) { return r.json(); }).then(function (items) {
      if (items.length === 0) {
        listEl.innerHTML = "<p class=\"empty\">No leads. Add one with the button above.</p>";
        return;
      }
      listEl.innerHTML = items.map(function (l) {
        var budget = (l.budget_min || l.budget_max) ? (l.budget_min || "") + "–" + (l.budget_max || "") : "";
        return "<div class=\"data-row\"><div class=\"info\"><strong>" + esc(l.name) + "</strong><span>" + esc(l.email || l.phone || "—") + (l.vehicle_interest ? " · " + esc(l.vehicle_interest) : "") + "</span></div><span class=\"meta\"><span class=\"badge badge-" + (l.status || "new") + "\">" + esc(l.status) + "</span></span><div class=\"actions\"><button type=\"button\" class=\"btn btn-secondary\" data-edit>Edit</button><button type=\"button\" class=\"btn btn-danger\" data-delete>Delete</button></div></div>";
      }).join("");
      listEl.querySelectorAll("[data-edit]").forEach(function (btn) {
        var row = btn.closest(".data-row");
        var idx = Array.from(listEl.querySelectorAll(".data-row")).indexOf(row);
        btn.addEventListener("click", function () { showForm(items[idx]); });
      });
      listEl.querySelectorAll("[data-delete]").forEach(function (btn) {
        var row = btn.closest(".data-row");
        var idx = Array.from(listEl.querySelectorAll(".data-row")).indexOf(row);
        btn.addEventListener("click", function () {
          if (!confirm("Delete this lead?")) return;
          fetch("/api/leads/" + items[idx].id, { method: "DELETE" }).then(function () { load(); hideForm(); });
        });
      });
    });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = leadId.value;
    var payload = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      source: document.getElementById("source").value,
      status: document.getElementById("status").value,
      vehicle_interest: document.getElementById("vehicle_interest").value,
      budget_min: document.getElementById("budget_min").value ? parseFloat(document.getElementById("budget_min").value) : null,
      budget_max: document.getElementById("budget_max").value ? parseFloat(document.getElementById("budget_max").value) : null,
      notes: document.getElementById("notes").value
    };
    var opts = { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) };
    fetch(id ? "/api/leads/" + id : "/api/leads", opts).then(function () { load(); hideForm(); });
  });
  document.getElementById("btn-new").addEventListener("click", function () { showForm(null); });
  document.getElementById("btn-close-form").addEventListener("click", hideForm);
  document.getElementById("btn-cancel").addEventListener("click", hideForm);
  document.getElementById("filter-status").addEventListener("change", load);
  load();
})();
