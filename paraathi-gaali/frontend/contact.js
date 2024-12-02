// Handle form submission
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission
    
    // Send the form data to Formspree
    const form = event.target;
    const formData = new FormData(form);
    
    fetch(form.action, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // Add this line to handle CORS
    })
    
    .then(response => {
        if (response.ok) {
            // If the form is successfully submitted, show the success message
            document.getElementById('success-message').style.display = 'block';
            form.reset();  // Reset the form fields
            
            // Optionally, hide the success message after 3 seconds
            setTimeout(() => {
                document.getElementById('success-message').style.display = 'none';
            }, 3000);
        } else {
            // If there is an issue with the form submission, show an alert with error message
            return response.json().then(errorData => {
                alert(`Error: ${errorData.errors[0].message}`);
            });
        }
    })
    .catch(error => {
        console.error("Error submitting the form:", error);
        alert("There was an error. Please try again.");
    });
});
