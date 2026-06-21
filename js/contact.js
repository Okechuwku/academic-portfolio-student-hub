document
.getElementById("contactForm")
.addEventListener("submit",function(e){

e.preventDefault();

let name =
document.getElementById("name").value;

let email =
document.getElementById("email").value;

let phone =
document.getElementById("phone").value;

let message =
document.getElementById("message").value;

if(
name==="" ||
email==="" ||
phone==="" ||
message===""
){
alert("All fields are required");
return;
}

let emailPattern =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!emailPattern.test(email)){
alert("Invalid Email");
return;
}

let phonePattern =
/^[0-9]+$/;

if(!phonePattern.test(phone)){
alert("Phone must contain digits only");
return;
}

alert("Form Submitted Successfully");

});