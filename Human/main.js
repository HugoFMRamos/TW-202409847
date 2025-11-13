let isLightTheme = true;
let counter = 0;
let slideIndex = 1;

document.addEventListener("DOMContentLoaded", () => {
    showSlides(slideIndex);
});

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slideIndex - 1].style.display = "block";
}

function changeTheme() {
  const body = document.body;
  body.classList.toggle("dark-theme");
  isLightTheme = !isLightTheme;
}


function count() {
    counter++;
    document.getElementById("countingBtn").innerHTML = counter;
}

function showText() {
    document.getElementById("text3").innerHTML = "OoOoOoO, secret text!";
}

function hideText() {
    document.getElementById("text3").innerHTML = "";
}
