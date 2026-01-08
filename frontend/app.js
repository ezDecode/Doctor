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
    url += `?q=${encodeURIComponent(searchQuery)}`;
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
  if (!confirm("Are you sure you want to delete this doctor?")) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/doctors/${doctorId}`, {
      method: "DELETE"
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      alert(`Error: ${errorData.message || 'Failed to delete doctor'}`);
      return;
    }
    
    alert("✓ Doctor has been deleted successfully!");
    fetchDoctors();
  } catch (error) {
    console.error("Error deleting doctor:", error);
    alert(`Error: ${error.message}`);
  }
};

form.onsubmit = async function(e) {
  e.preventDefault();
  
  const formData = new FormData(form);
  const rawPayload = Object.fromEntries(formData);
  
  // Build clean payload
  const payload = {
    name: rawPayload.name,
    specialization: rawPayload.specialization
  };
  
  // Add optional fields with proper types
  if (rawPayload.age && rawPayload.age.trim()) {
    payload.age = parseInt(rawPayload.age, 10);
  }
  if (rawPayload.experience && rawPayload.experience.trim()) {
    payload.experience = parseInt(rawPayload.experience, 10);
  }
  
  let url = `${API_BASE}/doctors`;
  let method = "POST";
  let isUpdate = false;
  
  if (rawPayload.id && rawPayload.id.trim()) {
    url = `${API_BASE}/doctors/${rawPayload.id}`;
    method = "PUT";
    isUpdate = true;
  }
  
  try {
    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      alert(`Error: ${errorData.message || 'Failed to save doctor'}`);
      return;
    }
    
    const savedDoctor = await response.json();
    hideModal();
    searchInput.value = "";
    
    // Show confirmation message
    const action = isUpdate ? "updated" : "added";
    alert(`✓ Doctor "${savedDoctor.name}" has been ${action} successfully!`);
    
    fetchDoctors();
  } catch (error) {
    console.error("Error saving doctor:", error);
    alert(`Error: ${error.message}`);
  }
};

openBtn.onclick = showModal;
closeBtn.onclick = hideModal;

searchInput.oninput = function(e) {
  fetchDoctors(e.target.value);
};

fetchDoctors();
