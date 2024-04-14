

function toggleOptions() {
    var options = document.getElementById("options");
    options.style.display = options.style.display === "block" ? "none" : "block";
}

function openFileInput() {
    document.getElementById("fileInput").click();
}
//to get location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var locationText = "Latitude: " + latitude + ", Longitude: " + longitude;
    document.getElementById("location").textContent = locationText;
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

// Function to handle file upload
document.getElementById("uploadForm").addEventListener("submit", function(event) {
    event.preventDefault();
    var formData = new FormData();
    var fileInput = document.getElementById("fileInput");
    formData.append("file", fileInput.files[0]);
    
    fetch("/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("File uploaded successfully:", data);
        // Handle success (e.g., display a success message)
    })
    .catch(error => {
        console.error("Error uploading file:", error);
        // Handle error (e.g., display an error message)
    });
});

// Request user's location when the page loads
window.onload = getLocation();

function openCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            // Access to the camera is granted
            // Create video element to display camera stream
            var video = document.createElement("video");
            video.srcObject = stream;
            video.autoplay = true;
            document.body.appendChild(video); // Add video element to the document
            
            // Create buttons for capturing pictures and recording video
            var capturePictureBtn = document.createElement("button");
            capturePictureBtn.textContent = "Capture Picture";
            capturePictureBtn.onclick = function() {
                capturePicture(stream);
            };
            
            var recordVideoBtn = document.createElement("button");
            recordVideoBtn.textContent = "Record Video";
            recordVideoBtn.onclick = function() {
                recordVideo(stream);
            };
            
            // Append buttons to the document
            document.body.appendChild(capturePictureBtn);
            document.body.appendChild(recordVideoBtn);
        })
        .catch(function(error) {
            // Access to the camera is denied
            console.error("Camera access denied:", error);
            alert("Camera access denied! Please allow camera access to use this feature.");
        });
    } else {
        // Browser does not support getUserMedia
        console.error("getUserMedia is not supported by this browser.");
        alert("Your browser does not support camera access! Please try using a different browser.");
    }
}

function capturePicture(stream) {
    // Create a canvas element to capture picture from video stream
    var video = document.querySelector("video");
    var canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas content to data URL and open in a new window
    var dataUrl = canvas.toDataURL("image/png");
    window.open(dataUrl);
    
    // Stop video stream
    stopStream(stream);
}

function recordVideo(stream) {
    // Create video element to record video stream
    var video = document.querySelector("video");
    var mediaRecorder = new MediaRecorder(stream);
    var chunks = [];
    
    mediaRecorder.ondataavailable = function(event) {
        chunks.push(event.data);
    };
    
    mediaRecorder.onstop = function() {
        // Concatenate recorded chunks and create a Blob
        var blob = new Blob(chunks, { type: 'video/webm' });
        
        // Create video URL and open in a new window
        var videoUrl = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'recorded_video.webm';
        a.click();
    };
    
    // Start recording
    mediaRecorder.start();
    
    // Stop recording after 5 seconds (adjust duration as needed)
    setTimeout(function() {
        mediaRecorder.stop();
        stopStream(stream);
    }, 5000);
}

function stopStream(stream) {
    // Stop tracks in the stream
    stream.getTracks().forEach(function(track) {
        track.stop();
    });
}
