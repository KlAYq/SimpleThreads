document.querySelectorAll(".sidebar-button").forEach(button => {
    var glow = button.querySelector(".sidebar-button-glow")
    button.onmouseover = () => {
        glow.style.opacity = "1"
        glow.style.transform = "scale(1)"
    }
    button.onmouseleave = () => {
        glow.style.opacity = "0"
        glow.style.transform = "scale(0.85)"
    }
    button.onmousedown = () => {
        button.style.transform = "scale(0.9)"
    }
    button.onmouseup = () => {
        button.style.transform = "scale(1)"
    }
})