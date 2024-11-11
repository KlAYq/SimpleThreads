document.querySelectorAll(".sidebar-button").forEach(button => {
    button.onmousedown = () => {
        button.style.transform = "scale(0.9)"
    }
    button.onmouseup = () => {
        button.style.transform = "scale(1)"
    }
})