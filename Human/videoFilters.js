let iframe = document.getElementById("iframe");
let btnBW = document.getElementById("btnBW");
let btnInvert = document.getElementById("btnInvert");
let btnClear = document.getElementById("btnClear");

btnBW.addEventListener('click', () => {
    iframe.style.filter = 'grayscale(100%)';
});

btnInvert.addEventListener('click', () => {
    iframe.style.filter = 'invert(100%)';
});

btnClear.addEventListener('click', () => {
    iframe.style.filter = 'none';
});