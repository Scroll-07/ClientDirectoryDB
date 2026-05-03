// Add a new business — form submit only, no data is ever displayed on this page
async function addBusiness() {

    const name  = document.getElementById("businessName").value.trim();
    const type  = document.getElementById("businessType").value.trim();
    const city  = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();

    // Required field check
    if (!name || !type || !city || !state) {
        showMessage("Please fill in Business Name, Industry, City, and State.", "error");
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
            clearForm();
            showMessage("✓  " + name + " has been added successfully.", "success");
        } else {
            showMessage("Error: " + (result.message || "Something went wrong."), "error");
        }

    } catch (err) {
        showMessage("Could not reach the server. Please try again.", "error");

    } finally {
        btn.disabled    = false;
        btn.textContent = "Add Business";
    }
}

// Clear all form fields
function clearForm() {
    ["businessName", "businessType", "city", "state",
     "phone", "email", "website", "servicesOffered"]
    .forEach(id => document.getElementById(id).value = "");
}

// Show a success or error message under the form
function showMessage(text, type) {
    const msg = document.getElementById("formMessage");
    msg.textContent = text;
    msg.className   = type === "success" ? "msg-success" : "msg-error";

    // Auto-hide after 5 seconds
    if (type === "success") {
        setTimeout(() => { msg.textContent = ""; msg.className = ""; }, 5000);
    }
}

// ── Nothing else runs on page load. No data is fetched or displayed. ──