const form = document.getElementById("survey");
const dobField = document.getElementById("dob");
const ageField = document.getElementById("age");
// Function to update age on server
function updateAge(age) {
  const id = document.getElementById("record-id").value; // Get the ID of the record being updated
  const data = { age: age };
  fetch(`/res/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("There was a problem updating the age:", error);
    });
}
// Function to calculate age based on date of birth
function calculateAge() {
  const dob = dobField.value.split("-");
  const birthdate = new Date(dob[0], dob[1] - 1, dob[2]); // Month is zero-indexed
  const today = new Date();
  const age = today.getFullYear() - birthdate.getFullYear();
  // Check if the user is at least 20 years old
  if (age < 20) {
    dobField.focus();
    dobField.insertAdjacentHTML(
      "afterend",
      '<div class="alert alert-danger">You must be at least 20 years old to submit this form.</div>'
    );
  } else {
    // Set the age input field value to the calculated age
    ageField.value = age;
    // Set the value of the age field in the form data object
    formData.age = age;
    //update the age on the server
    updateAge(age);
  }
}
// Event listener to calculate age when dob field changes
dobField.addEventListener("change", calculateAge);
// Event listener to calculate age in real time as the user types
dobField.addEventListener("input", calculateAge);
// Function to validate the form
function validateForm(event) {
  event.preventDefault(); // Prevent form submission until validation is complete
}
form.addEventListener("submit", validateForm);

//Dark mode
if (localStorage.getItem("mode") === "dark") {
  enableDarkMode();
}

// Switch between dark ad light mode
function toggleMode() {
  if (localStorage.getItem("mode") !== "dark") {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
}
// Enable dark mode
function enableDarkMode() {
  document.body.classList.add("dark-mode");
  localStorage.setItem("mode", "dark");
}
// Disable dark mode
function disableDarkMode() {
  document.body.classList.remove("dark-mode");
  localStorage.setItem("mode", "light");
}

///Phone and Id Validation for Duplicates

// Function to check if phone number already exists in database
function phoneExists(phone) {
  // Code to check database for phone number
  return false;
}
// Function to check if ID number already exists in database
function idnumberExists(idnumber) {
  // Code to check database for ID number
  return false;
}
// Event listener to validate phone and ID number before form submission
document.getElementById("survey").addEventListener("submit", function (event) {
  // Prevent the form from submitting
  event.preventDefault();

  // Get the values of the phone and ID number input fields
  var phone = document.getElementById("phone").value;
  var idnumber = document.getElementById("id-number").value;

  // Check if the phone or ID number already exists in the database
  if (phoneExists(phone)) {
    document.getElementById("phone-error").innerHTML =
      "Phone number already exists";
  } else {
    document.getElementById("phone-error").innerHTML = "";
  }
  if (idnumberExists(idnumber)) {
    document.getElementById("idnumber-error").innerHTML =
      "ID number already exists";
  } else {
    document.getElementById("idnumber-error").innerHTML = "";
  }
  //If the phone or ID number already exists, do not submit the form
  if (phoneExists(phone) || idnumberExists(idnumber)) {
    return false;
  }
  // If the phone and ID number do not already exist, submit the form
  document.getElementById("survey").submit();
});


