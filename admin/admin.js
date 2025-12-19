const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

let currentCropper = null;
let currentImageFile = null;
let currentFormType = null;

function getAuthToken() {
    return localStorage.getItem('adminToken');
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
    const token = getAuthToken();
    
    try {
        await fetch(`${API_BASE}/admin/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login.html';
});

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const sectionId = btn.getAttribute('data-section');
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
        
        if (sectionId === 'contacts') {
            loadContactSubmissions();
        } else if (sectionId === 'newsletter') {
            loadNewsletterSubscribers();
        }
    });
});

document.getElementById('projectImage').addEventListener('change', (e) => {
    handleImageSelect(e, 'projectImagePreview', 'project');
});

document.getElementById('clientImage').addEventListener('change', (e) => {
    handleImageSelect(e, 'clientImagePreview', 'client');
});

function handleImageSelect(event, previewId, formType) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    currentImageFile = file;
    currentFormType = formType;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const cropperImage = document.getElementById('cropperImage');
        cropperImage.src = e.target.result;
        
        document.getElementById('cropperModal').classList.add('active');
        
        if (currentCropper) {
            currentCropper.destroy();
        }
        
        currentCropper = new Cropper(cropperImage, {
            aspectRatio: 450 / 350,
            viewMode: 1,
            autoCropArea: 1
        });
    };
    reader.readAsDataURL(file);
}

document.getElementById('cropConfirm').addEventListener('click', () => {
    if (!currentCropper) return;
    
    const canvas = currentCropper.getCroppedCanvas({
        width: 450,
        height: 350
    });
    
    canvas.toBlob((blob) => {
        const previewId = currentFormType === 'project' ? 'projectImagePreview' : 'clientImagePreview';
        const preview = document.getElementById(previewId);
        preview.innerHTML = `<img src="${canvas.toDataURL()}" alt="Preview">`;
        
        const fileName = currentImageFile.name;
        currentImageFile = new File([blob], fileName, { type: 'image/jpeg' });
        
        closeModal();
    }, 'image/jpeg', 0.9);
});

document.getElementById('cropCancel').addEventListener('click', closeModal);

function closeModal() {
    document.getElementById('cropperModal').classList.remove('active');
    if (currentCropper) {
        currentCropper.destroy();
        currentCropper = null;
    }
}

document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('projectName').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    
    if (!name || !description) {
        showMessage('projectMessage', 'All fields are required', 'error');
        return;
    }
    
    if (!currentImageFile) {
        showMessage('projectMessage', 'Please select an image', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('image', currentImageFile);
    
    try {
        const response = await fetch(`${API_BASE}/projects`, {
            method: 'POST',
            headers: {
                'Authorization': getAuthToken()
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('projectMessage', 'Project added successfully!', 'success');
            document.getElementById('projectForm').reset();
            document.getElementById('projectImagePreview').innerHTML = '';
            currentImageFile = null;
        } else {
            showMessage('projectMessage', result.error || 'Failed to add project', 'error');
        }
    } catch (error) {
        console.error('Error adding project:', error);
        showMessage('projectMessage', 'Failed to add project. Please try again.', 'error');
    }
});

document.getElementById('clientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('clientName').value.trim();
    const description = document.getElementById('clientDescription').value.trim();
    const designation = document.getElementById('clientDesignation').value.trim();
    
    if (!name || !description || !designation) {
        showMessage('clientMessage', 'All fields are required', 'error');
        return;
    }
    
    if (!currentImageFile) {
        showMessage('clientMessage', 'Please select an image', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('designation', designation);
    formData.append('image', currentImageFile);
    
    try {
        const response = await fetch(`${API_BASE}/clients`, {
            method: 'POST',
            headers: {
                'Authorization': getAuthToken()
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('clientMessage', 'Client added successfully!', 'success');
            document.getElementById('clientForm').reset();
            document.getElementById('clientImagePreview').innerHTML = '';
            currentImageFile = null;
        } else {
            showMessage('clientMessage', result.error || 'Failed to add client', 'error');
        }
    } catch (error) {
        console.error('Error adding client:', error);
        showMessage('clientMessage', 'Failed to add client. Please try again.', 'error');
    }
});

async function loadContactSubmissions() {
    try {
        const response = await fetch(`${API_BASE}/contact`);
        const result = await response.json();
        
        if (result.success) {
            displayContactSubmissions(result.data);
        }
    } catch (error) {
        console.error('Error loading contact submissions:', error);
    }
}

function displayContactSubmissions(contacts) {
    const tbody = document.getElementById('contactsTableBody');
    
    if (contacts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No contact submissions yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = contacts.map(contact => `
        <tr>
            <td>${contact.full_name}</td>
            <td>${contact.email}</td>
            <td>${contact.mobile}</td>
            <td>${contact.city}</td>
            <td>${new Date(contact.created_at).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

async function loadNewsletterSubscribers() {
    try {
        const response = await fetch(`${API_BASE}/newsletter`);
        const result = await response.json();
        
        if (result.success) {
            displayNewsletterSubscribers(result.data);
        }
    } catch (error) {
        console.error('Error loading newsletter subscribers:', error);
    }
}

function displayNewsletterSubscribers(subscribers) {
    const tbody = document.getElementById('newsletterTableBody');
    
    if (subscribers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">No newsletter subscribers yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = subscribers.map(sub => `
        <tr>
            <td>${sub.email}</td>
            <td>${new Date(sub.created_at).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    
    setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = 'message';
    }, 5000);
}
