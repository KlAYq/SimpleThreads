document.querySelectorAll(".sidebar-button").forEach(button => {
    var icon = button.querySelector("i")
    button.onmousedown = () => {
        button.style.transform = "scale(0.9)"
        icon.className = icon.className.replace(/\bbi-([\w+]+)\b/, (match, p1) => `bi-${p1}-fill`)
    }
    button.onmouseup = () => {
        button.style.transform = "scale(1)"
        icon.className = icon.className.replace(/\bbi-([\w+]+)-fill\b/, (match, p1) => `bi-${p1}`)
    }
})

document.querySelectorAll("#mobile-navbar div").forEach(button => {
    var icon = button.querySelector("i")
    button.onmousedown = () => {
        button.style.transform = "scale(0.9)"
        icon.className = icon.className.replace(/\bbi-([\w+]+)\b/, (match, p1) => `bi-${p1}-fill`)
    }
    button.onmouseup = () => {
        button.style.transform = "scale(1)"
        icon.className = icon.className.replace(/\bbi-([\w+]+)-fill\b/, (match, p1) => `bi-${p1}`)
    }
})
