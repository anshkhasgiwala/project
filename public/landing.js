const API_BASE = 'http://localhost:3000/api';

async function fetchProjects() {
    try {
        const response = await fetch(`${API_BASE}/projects`);
        const result = await response.json();
        
        if (result.success) {
            displayProjects(result.data);
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}

function displayProjects(projects) {
    const container = document.getElementById('projectsContainer');
    
    if (projects.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No projects available yet.</p>';
        return;
    }
    
    container.innerHTML = projects.map(project => renderProject(project)).join('');
}

function renderProject(project) {
    return `
        <div class="project-card">
            <img src="${project.image_url}" alt="${project.name}">
            <div class="project-info">
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <a href="#" class="read-more-btn">Read More</a>
            </div>
        </div>
    `;
}

async function fetchClients() {
    try {
        const response = await fetch(`${API_BASE}/clients`);
        const result = await response.json();
        
        if (result.success) {
            displayClients(result.data);
        }
    } catch (error) {
        console.error('Error fetching clients:', error);
    }
}

function displayClients(clients) {
    const container = document.getElementById('clientsContainer');
    
    if (clients.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No client testimonials yet.</p>';
        return;
    }
    
    container.innerHTML = clients.map(client => renderClient(client)).join('');
}

function renderClient(client) {
    return `
        <div class="client-card">
            <img src="${client.image_url}" alt="${client.name}">
            <p>"${client.description}"</p>
            <h4>${client.name}</h4>
            <span class="designation">${client.designation}</span>
        </div>
    `;
}

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const city = document.getElementById('city').value.trim();
    
    if (!fullName || !email || !mobile || !city) {
        showMessage('contactMessage', 'All fields are required', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name: fullName,
                email: email,
                mobile: mobile,
                city: city
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('contactMessage', 'Thank you! We will get back to you soon.', 'success');
            document.getElementById('contactForm').reset();
        } else {
            showMessage('contactMessage', result.error || 'Failed to submit form', 'error');
        }
    } catch (error) {
        console.error('Error submitting contact form:', error);
        showMessage('contactMessage', 'Failed to submit form. Please try again.', 'error');
    }
});

document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('newsletterEmail').value.trim();
    
    if (!email) {
        showMessage('newsletterMessage', 'Email is required', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/newsletter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('newsletterMessage', 'Successfully subscribed to newsletter!', 'success');
            document.getElementById('newsletterForm').reset();
        } else {
            showMessage('newsletterMessage', result.error || 'Failed to subscribe', 'error');
        }
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        showMessage('newsletterMessage', 'Failed to subscribe. Please try again.', 'error');
    }
});

function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    
    setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = 'message';
    }, 5000);
}

window.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
    fetchClients();
});
