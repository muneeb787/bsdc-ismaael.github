// Handle form submission
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission
    
    // Send the form data to Formspree
    const form = event.target;
    const formData = new FormData(form);
    
    // Fetch request to send form data to Formspree
    fetch(form.action, {
        method: 'POST',  // Set method as POST
        body: formData,  // Send form data
        headers: {
            'Accept': 'application/json', // Ensures we handle the response as JSON
        },
    })
    .then(response => {
        if (response.ok) {  // If the response is OK, show success message
            document.getElementById('success-message').style.display = 'block';
            form.reset();  // Reset the form fields
            
            // Optionally, hide the success message after 3 seconds
            setTimeout(() => {
                document.getElementById('success-message').style.display = 'none';
            }, 3000);
        } else {
            // If there is an issue with the form submission, show an alert
            return response.json().then(errorData => {
                alert(`Error: ${errorData.errors[0].message}`);
            });
        }
    })
    .catch(error => {
        // Catch any errors that occur during the form submission
        console.error("Error submitting the form:", error);
        alert("There was an error. Please try again.");
    });
});
