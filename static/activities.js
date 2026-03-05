(function () {
  var listEl = document.getElementById("activities-list");
  var formPanel = document.getElementById("form-panel");
  var form = document.getElementById("activity-form");
  var formTitle = document.getElementById("form-title");
  var activityId = document.getElementById("activity-id");
  var filterDeal = document.getElementById("filter-deal");
  var filterLead = document.getElementById("filter-lead");
  function esc(s) { if (!s) return ""; var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function loadFilters() {
    fetch("/api/deals").then(function (r) { return r.json(); }).then(function (deals) {
      filterDeal.innerHTML = "<option value=\"\">All deals</option>" + deals.map(function (d) { return "<option value=\"" + d.id + "\">Deal #" + d.id + "</option>"; }).join("");
    });
    fetch("/api/leads").then(function (r) { return r.json(); }).then(function (leads) {
      filterLead.innerHTML = "<option value=\"\">All leads</option>" + leads.map(function (l) { return "<option value=\"" + l.id + "\">" + esc(l.name) + "</option>"; }).join("");
    });
  }
  function showForm(activity) {
    formPanel.classList.remove("hidden");
    fetch("/api/deals").then(function (r) { return r.json(); }).then(function (deals) {
      document.getElementById("deal_id").innerHTML = "<option value=\"\">— None —</option>" + deals.map(function (d) { return "<option value=\"" + d.id + "\">Deal #" + d.id + "</option>"; }).join("");
      return fetch("/api/leads").then(function (r) { return r.json(); });
    }).then(function (leads) {
      document.getElementById("lead_id").innerHTML = "<option value=\"\">— None —</option>" + leads.map(function (l) { return "<option value=\"" + l.id + "\">" + esc(l.name) + "</option>"; }).join("");
      if (activity) {
        formTitle.textContent = "Edit activity";
        activityId.value = activity.id;
        document.getElementById("deal_id").value = activity.deal_id || "";
        document.getElementById("lead_id").value = activity.lead_id || "";
        document.getElementById("type").value = activity.type || "call";
        document.getElementById("description").value = activity.description || "";
        document.getElementById("due_date").value = activity.due_date ? activity.due_date.slice(0, 10) : "";
      } else {
        formTitle.textContent = "New activity";
        activityId.value = "";
        form.reset();
      }
    });
  }
  function hideForm() { formPanel.classList.add("hidden"); form.reset(); activityId.value = ""; }
  function load() {
    var dealId = filterDeal.value;
    var leadId = filterLead.value;
    var params = [];
    if (dealId) params.push("deal_id=" + dealId);
    if (leadId) params.push("lead_id=" + leadId);
    var url = "/api/activities" + (params.length ? "?" + params.join("&") : "");
    fetch(url).then(function (r) { return r.json(); }).then(function (items) {
      if (items.length === 0) {
        listEl.innerHTML = "<p class=\"empty\">No activities. Add one with the button above.</p>";
        return;
      }
      listEl.innerHTML = items.map(function (a) {
        var typeLabel = (a.type || "call").replace("_", " ");
        var due = a.due_date ? a.due_date.slice(0, 10) : "—";
        var done = a.completed_at ? " ✓" : "";
        return "<div class=\"data-row\"><div class=\"info\"><strong>" + typeLabel + done + "</strong><span>" + esc(a.description || "—") + " · Due: " + due + (a.deal_id ? " · Deal #" + a.deal_id : "") + (a.lead_id ? " · Lead #" + a.lead_id : "") + "</span></div><div class=\"actions\"><button type=\"button\" class=\"btn btn-secondary\" data-edit>Edit</button><button type=\"button\" class=\"btn btn-danger\" data-delete>Delete</button></div></div>";
      }).join("");
      listEl.querySelectorAll("[data-edit]").forEach(function (btn, idx) {
        btn.addEventListener("click", function () { showForm(items[idx]); });
      });
      listEl.querySelectorAll("[data-delete]").forEach(function (btn, idx) {
        btn.addEventListener("click", function () {
          if (!confirm("Delete this activity?")) return;
          fetch("/api/activities/" + items[idx].id, { method: "DELETE" }).then(function () { load(); hideForm(); });
        });
      });
    });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = activityId.value;
    var payload = {
      deal_id: document.getElementById("deal_id").value ? parseInt(document.getElementById("deal_id").value, 10) : null,
      lead_id: document.getElementById("lead_id").value ? parseInt(document.getElementById("lead_id").value, 10) : null,
      type: document.getElementById("type").value,
      description: document.getElementById("description").value,
      due_date: document.getElementById("due_date").value || null
    };
    var opts = { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) };
    fetch(id ? "/api/activities/" + id : "/api/activities", opts).then(function () { load(); hideForm(); loadFilters(); });
  });
  document.getElementById("btn-new").addEventListener("click", function () { showForm(null); });
  document.getElementById("btn-close-form").addEventListener("click", hideForm);
  document.getElementById("btn-cancel").addEventListener("click", hideForm);
  filterDeal.addEventListener("change", load);
  filterLead.addEventListener("change", load);
  loadFilters();
  load();
})();
