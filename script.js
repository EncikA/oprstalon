// Date Input Formatter
function formatDateInput(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
    input.value = value.slice(0, 10);
}

// Time Formatter (12-hour format with AM/PM)
function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const twelveHour = hour % 12 || 12;
    return `${twelveHour}:${minutes} ${ampm}`;
}

// File Upload Handlers
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('images');
const fileList = document.getElementById('fileList');

// Drag and Drop Event Listeners
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight);
});

dropZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', updateFileList);

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropZone.classList.add('dragover');
}

function unhighlight() {
    dropZone.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    fileInput.files = dt.files;
    updateFileList();
}

function updateFileList() {
    const files = Array.from(fileInput.files).slice(0, 4);
    fileList.textContent = files.map(f => f.name).join(', ');
    if (files.length > 4) {
        fileList.textContent += ' (First 4 images only)';
    }
}

// Form Submission Handler
document.getElementById('reportForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect Form Data
    const formData = {
        programName: document.getElementById('programName').value,
        date: document.getElementById('date').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        location: document.getElementById('location').value,
        targetAudience: document.getElementById('targetAudience').value,
        objectives: document.getElementById('objectives').value,
        activities: document.getElementById('activities').value,
        strengths: document.getElementById('strengths').value,
        weaknesses: document.getElementById('weaknesses').value,
        preparedBy: document.getElementById('preparedBy').value,
        position: document.getElementById('position').value
    };

    // Process Images
    const imageFiles = Array.from(fileInput.files).slice(0, 4);
    const imagePreviews = await Promise.all(imageFiles.map(processImage));

    // Format Time Range
    const timeRange = `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`;

    // Generate Report HTML
    const outputHTML = `
        <div class="report-header">
            <div class="report-title">${formData.programName}</div>
            <div class="report-subtitle">
                <span>${formData.date}</span> | 
                <span>${timeRange}</span> | 
                <span>${formData.location}</span>
            </div>
        </div>

        <div class="report-content">
            <div class="report-section">
                <div class="section-title">Maklumat Program</div>
                <p><strong>Sasaran:</strong> ${formData.targetAudience}</p>
                <p><strong>Objektif:</strong> ${formData.objectives}</p>
            </div>

            <div class="report-section">
                <div class="section-title">Aktiviti Dilaksanakan</div>
                <p>${formData.activities}</p>
                <div class="image-grid">${imagePreviews.join('')}</div>
            </div>

            <div class="analysis-container">
                <div class="report-section strengths">
                    <div class="section-title">Kekuatan</div>
                    <p>${formData.strengths}</p>
                </div>
                <div class="report-section weaknesses">
                    <div class="section-title">Kelemahan</div>
                    <p>${formData.weaknesses}</p>
                </div>
            </div>

            <div class="report-footer">
                <p>Disediakan oleh:<br>
                <strong>${formData.preparedBy}</strong><br>
                ${formData.position}</p>
            </div>
        </div>
    `;

    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = outputHTML;

    document.getElementById('downloadPdfBtn').style.display = 'block';
});

// Image Processor
function processImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(`
                <div class="image-item">
                    <img src="${e.target.result}" alt="${file.name}">
                    <div class="image-caption">${file.name}</div>
                </div>
            `);
        };
        reader.readAsDataURL(file);
    });
}

// PDF Generator
document.getElementById('downloadPdfBtn').addEventListener('click', async () => {
    const element = document.getElementById('output');
    const options = {
        margin: [15, 15],
        filename: 'Laporan_OPR.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            logging: true
        },
        jsPDF: { 
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            hotfixes: ["px_scaling"]
        }
    };

    try {
        const worker = html2pdf().set(options).from(element).toPdf().get('pdf').then((pdf) => {
            pdf.setFontSize(10);
            pdf.text("© Sekolah Kebangsaan Stalon", 105, 280, null, null, "center");
        }).save();
    } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Error generating PDF. Please check console for details.');
    }
});

// Input Validation
document.getElementById('date').addEventListener('input', function(e) {
    formatDateInput(e.target);
});

document.getElementById('endTime').addEventListener('change', function() {
    const start = document.getElementById('startTime');
    const end = document.getElementById('endTime');
    if (start.value && end.value && start.value >= end.value) {
        alert('End time must be after start time');
        end.value = '';
    }
});
