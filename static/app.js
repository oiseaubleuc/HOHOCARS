const API = "/api/contacts";
const listEl = document.getElementById("contacts-list");
const emptyEl = document.getElementById("empty-msg");
const formPanel = document.getElementById("form-panel");
const form = document.getElementById("contact-form");
const formTitle = document.getElementById("form-title");
const contactId = document.getElementById("contact-id");

function showForm(editContact = null) {
  formPanel.classList.remove("hidden");
  if (editContact) {
    formTitle.textContent = "Edit contact";
    contactId.value = editContact.id;
    document.getElementById("name").value = editContact.name || "";
    document.getElementById("email").value = editContact.email || "";
    document.getElementById("company").value = editContact.company || "";
    document.getElementById("phone").value = editContact.phone || "";
    document.getElementById("notes").value = editContact.notes || "";
  } else {
    formTitle.textContent = "New contact";
    contactId.value = "";
    form.reset();
  }
}

function hideForm() {
  formPanel.classList.add("hidden");
  form.reset();
  contactId.value = "";
}

async function loadContacts() {
  const res = await fetch(API);
  const contacts = await res.json();
  emptyEl.style.display = contacts.length ? "none" : "block";
  listEl.querySelectorAll(".contact-card").forEach((el) => el.remove());
  contacts.forEach((c) => {
    const card = document.createElement("div");
    card.className = "contact-card";
    card.innerHTML = `
      <div class="contact-info">
        <strong>${escapeHtml(c.name)}</strong>
        <span>${escapeHtml(c.company || c.email || "—")}</span>
      </div>
      <div class="contact-actions">
        <button type="button" class="btn btn-secondary edit-btn" data-id="${c.id}">Edit</button>
        <button type="button" class="btn btn-danger delete-btn" data-id="${c.id}">Delete</button>
      </div>
    `;
    card.querySelector(".edit-btn").addEventListener("click", () => showForm(c));
    card.querySelector(".delete-btn").addEventListener("click", () => deleteContact(c.id));
    listEl.appendChild(card);
  });
}

function escapeHtml(s) {
  if (!s) return "";
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

async function deleteContact(id) {
  if (!confirm("Delete this contact?")) return;
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadContacts();
  hideForm();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = contactId.value;
  const payload = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    company: document.getElementById("company").value,
    phone: document.getElementById("phone").value,
    notes: document.getElementById("notes").value,
  };
  if (id) {
    await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
  loadContacts();
  hideForm();
});

document.getElementById("btn-new").addEventListener("click", () => showForm());
document.getElementById("btn-close-form").addEventListener("click", hideForm);
document.getElementById("btn-cancel").addEventListener("click", hideForm);

formPanel.classList.add("hidden");
loadContacts();
