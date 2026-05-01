// Load all businesses when the page opens
async function loadBusinesses() {
    const response   = await fetch("/api/businesses");
    const businesses = await response.json();
    displayBusinesses(businesses);
}

// Search businesses by keyword
// async function searchBusinesses() {
//     const searchInput = document.getElementById("searchInput").value;
//     const response    = await fetch(`/api/businesses/search?q=${searchInput}`);
//     const businesses  = await response.json();
//     displayBusinesses(businesses);
// }

// Add a new business to the database
async function addBusiness() {
    const newBusiness = {
        BusinessName:    document.getElementById("businessName").value,
        BusinessType:    document.getElementById("businessType").value,
        City:            document.getElementById("city").value,
        State:           document.getElementById("state").value,
        Phone:           document.getElementById("phone").value,
        Email:           document.getElementById("email").value,
        Website:         document.getElementById("website").value,
        ServicesOffered: document.getElementById("servicesOffered").value
    };
    const response = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBusiness)
    });
    // const result = await response.json();
    // alert(result.message);
    // clearForm();
    // loadBusinesses();
    const result = await response.json();
alert(result.message);
clearForm();
}

// Display businesses as cards on the page
function displayBusinesses(businesses) {
    const resultsDiv = document.getElementById("businessResults");
    resultsDiv.innerHTML = "";
    if (businesses.length === 0) {
        resultsDiv.innerHTML = "<p>No businesses found.</p>";
        return;
    }
        businesses.forEach(business => {
        const card = document.createElement("div");
        card.className = "business-card";
        card.innerHTML = `
            <h3>${business.BusinessName}</h3>
            <p><strong>Type:</strong> ${business.BusinessType}</p>
            <p><strong>Location:</strong> ${business.City}, ${business.State}</p>
            <p><strong>Phone:</strong> ${business.Phone || 'N/A'}</p>
            <p><strong>Email:</strong> ${business.Email || 'N/A'}</p>
            <p><strong>Website:</strong>
                <a href='${business.Website}' target='_blank'>${business.Website || 'N/A'}</a>
            </p>
            <p><strong>Services:</strong> ${business.ServicesOffered || 'N/A'}</p>
        `;
        resultsDiv.appendChild(card);
    });
}

// Clear all form inputs
function clearForm() {
    ["businessName","businessType","city","state",
     "phone","email","website","servicesOffered"]
    .forEach(id => document.getElementById(id).value = '');
}

// Auto-load businesses when the page opens
// loadBusinesses();