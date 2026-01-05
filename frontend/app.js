const API_BASE = "http://localhost:3000";

const grid = document.getElementById("grid");
const modal = document.getElementById("modal");
const form = document.getElementById("form");
const openBtn = document.getElementById("open");
const closeBtn = document.getElementById("close");
const searchInput = document.getElementById("search");

function showModal() {
  modal.style.display = "block";
}

function hideModal() {
  modal.style.display = "none";
  form.reset();
}

function buildDoctorCard(doc) {
  const expYears = doc.experience || "—";
  const ageDisplay = doc.age ? `${doc.age} yrs old` : "Age TBD";
  const ageValue = doc.age || "—";
  
  return `
    <article class="doc-card">
      <div class="doc-card__header">
        <div>
          <p class="eyebrow small">${doc.specialization}</p>
          <h2>${doc.name}</h2>
        </div>
        <span class="doc-card__badge">${expYears} yrs exp</span>
      </div>

      <p class="doc-card__status">
        ${ageDisplay}
      </p>

      <dl class="doc-card__meta">
        <div>
          <dt>Specialty</dt>
          <dd>${doc.specialization}</dd>
        </div>
        <div>
          <dt>Age</dt>
          <dd>${ageValue}</dd>
        </div>
        <div>
          <dt>Experience</dt>
          <dd>${expYears} yrs</dd>
        </div>
      </dl>

      <div class="doc-card__actions">
        <button class="ghost" type="button" onclick="editDoctor(${doc.id})">Edit</button>
        <button type="button" onclick="deleteDoctor(${doc.id})">Delete</button>
      </div>
    </article>
  `;
}

function renderDoctors(doctors) {
  let html = "";
  for (let i = 0; i < doctors.length; i++) {
    html += buildDoctorCard(doctors[i]);
  }
  grid.innerHTML = html;
}

async function fetchDoctors(searchQuery) {
  let url = `${API_BASE}/doctors`;
  if (searchQuery) {
    url += `?q=${searchQuery}`;
  }
  
  const response = await fetch(url);
  const doctors = await response.json();
  renderDoctors(doctors);
}

window.editDoctor = async function(doctorId) {
  const response = await fetch(`${API_BASE}/doctors`);
  const doctors = await response.json();
  
  const doctor = doctors.find(d => d.id === doctorId);
  if (!doctor) return;
  
  document.getElementById("id").value = doctor.id || "";
  document.getElementById("name").value = doctor.name || "";
  document.getElementById("specialization").value = doctor.specialization || "";
  document.getElementById("age").value = doctor.age || "";
  document.getElementById("experience").value = doctor.experience || "";
  
  showModal();
};

window.deleteDoctor = async function(doctorId) {
  await fetch(`${API_BASE}/doctors/${doctorId}`, {
    method: "DELETE"
  });
  fetchDoctors();
};

form.onsubmit = async function(e) {
  e.preventDefault();
  
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData);
  
  let url = `${API_BASE}/doctors`;
  let method = "POST";
  
  if (payload.id) {
    url = `${API_BASE}/doctors/${payload.id}`;
    method = "PUT";
  }
  
  await fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  hideModal();
  fetchDoctors();
};

openBtn.onclick = showModal;
closeBtn.onclick = hideModal;

searchInput.oninput = function(e) {
  fetchDoctors(e.target.value);
};

fetchDoctors();
