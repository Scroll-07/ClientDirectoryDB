// ── Page navigation ─────────────────────────────────────────────────────────
function showPage(name) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

    document.getElementById("page-" + name).classList.add("active");

    const navMap = { home: 0, add: 1, search: 2 };
    document.querySelectorAll(".nav-item")[navMap[name]].classList.add("active");

    // Only load businesses when user navigates to the Dashboard tab
    if (name === "home") loadBusinesses();
}

// ── Load all businesses — Dashboard only ─────────────────────────────────────
async function loadBusinesses() {
    const resultsDiv = document.getElementById("businessResults");
    resultsDiv.innerHTML = '<div class="empty-state"><p>Loading...</p></div>';

    try {
        const response   = await fetch("/api/businesses");
        const businesses = await response.json();
        displayBusinesses(businesses, "businessResults");
        updateStats(businesses);
    } catch (err) {
        resultsDiv.innerHTML = '<div class="empty-state"><p>Could not connect to the server. Make sure node server.js is running.</p></div>';
    }
}

// ── Update dashboard stats ───────────────────────────────────────────────────
function updateStats(businesses) {
    document.getElementById("totalCount").textContent = businesses.length;

    const cities     = new Set(businesses.map(b => b.City).filter(Boolean));
    const industries = new Set(businesses.map(b => b.BusinessType).filter(Boolean));

    document.getElementById("cityCount").textContent = cities.size;
    document.getElementById("typeCount").textContent = industries.size;
}

// ── Search businesses ────────────────────────────────────────────────────────
async function searchBusinesses() {
    const term       = document.getElementById("searchInput").value.trim();
    const resultsDiv = document.getElementById("searchResults");

    if (!term) {
        resultsDiv.innerHTML = '<div class="empty-state"><p>Please enter a keyword to search.</p></div>';
        return;
    }

    resultsDiv.innerHTML = '<div class="empty-state"><p>Searching...</p></div>';

    try {
        const response   = await fetch(`/api/businesses/search?q=${encodeURIComponent(term)}`);
        const businesses = await response.json();
        displayBusinesses(businesses, "searchResults");
    } catch (err) {
        resultsDiv.innerHTML = '<div class="empty-state"><p>Search failed. Make sure the server is running.</p></div>';
    }
}

function clearSearch() {
    document.getElementById("searchInput").value = "";
    document.getElementById("searchResults").innerHTML =
        '<div class="empty-state"><p>Enter a keyword above to search your directory.</p></div>';
}

// ── Add a new business ───────────────────────────────────────────────────────
// NOTE: After a successful submit, ONLY a confirmation message is shown.
//       No business data is fetched or displayed on this page.
async function addBusiness() {
    const name  = document.getElementById("businessName").value.trim();
    const type  = document.getElementById("businessType").value.trim();
    const city  = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();

    // Validation — required fields only
    if (!name || !type || !city || !state) {
        showFormMessage("Please fill in all required fields: Business Name, Industry, City, and State.", "error");
        return;
    }

    const newBusiness = {
        BusinessName:    name,
        BusinessType:    type,
        City:            city,
        State:           state,
        Phone:           document.getElementById("phone").value.trim(),
        Email:           document.getElementById("email").value.trim(),
        Website:         document.getElementById("website").value.trim(),
        ServicesOffered: document.getElementById("servicesOffered").value.trim()
    };

    // Disable button while submitting
    const btn = document.getElementById("submitBtn");
    btn.disabled    = true;
    btn.textContent = "Saving...";

    try {
        const response = await fetch("/api/businesses", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(newBusiness)
        });

        const result = await response.json();

        if (response.ok) {
            // ✅ Clear the form and show a confirmation message ONLY.
            // No data is loaded or displayed after this point.
            clearForm();
            showFormMessage("✓  " + name + " has been added to the directory successfully.", "success");
        } else {
            showFormMessage("Error: " + (result.message || "Something went wrong. Please try again."), "error");
        }
    } catch (err) {
        showFormMessage("Could not reach the server. Make sure node server.js is running.", "error");
    } finally {
        // Re-enable button regardless of outcome
        btn.disabled    = false;
        btn.textContent = "+ Add to Directory";
    }
}

// ── Display businesses as cards ──────────────────────────────────────────────
function displayBusinesses(businesses, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!businesses || businesses.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">⊙</div><p>No businesses found.</p></div>';
        return;
    }

    businesses.forEach(b => {
        const card = document.createElement("div");
        card.className = "business-card";

        const website = b.Website
            ? `<a href="${b.Website}" target="_blank" rel="noopener">${b.Website}</a>`
            : "—";

        card.innerHTML = `
            <h3>${b.BusinessName || "—"}</h3>
            <span class="card-type">${b.BusinessType || "—"}</span>
            <div class="card-details">
                <div class="card-row">
                    <span class="label">Location</span>
                    <span>${[b.City, b.State].filter(Boolean).join(", ") || "—"}</span>
                </div>
                <div class="card-row">
                    <span class="label">Phone</span>
                    <span>${b.Phone || "—"}</span>
                </div>
                <div class="card-row">
                    <span class="label">Email</span>
                    <span>${b.Email || "—"}</span>
                </div>
                <div class="card-row">
                    <span class="label">Website</span>
                    <span>${website}</span>
                </div>
                <div class="card-row">
                    <span class="label">Services</span>
                    <span>${b.ServicesOffered || "—"}</span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function clearForm() {
    ["businessName", "businessType", "city", "state",
     "phone", "email", "website", "servicesOffered"]
    .forEach(id => document.getElementById(id).value = "");

    // Clear any previous message when starting a new entry
    const msg = document.getElementById("formMessage");
    if (msg) msg.className = "form-message hidden";
}

function showFormMessage(text, type) {
    const msg = document.getElementById("formMessage");
    msg.textContent = text;
    msg.className   = "form-message " + type;

    // Auto-hide success message after 6 seconds
    if (type === "success") {
        setTimeout(() => {
            msg.className = "form-message hidden";
        }, 6000);
    }
}

// ── Init: Dashboard loads on page open ───────────────────────────────────────
// The Add Business page does NOT auto-load anything on init.
// Data only appears on the Dashboard tab when the user navigates there.
loadBusinesses();