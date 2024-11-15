document.querySelectorAll(".sidebar-button").forEach(button => {
    var icon = button.querySelector("i")

    button.addEventListener('mousedown', () => {
        icon.className = icon.className.replace(/\bbi-([\w+\-]+)\b/, (match, p1) => `bi-${p1}-fill`)
        button.style.transform = "scale(0.9)"
        
    })  

    mouseout = () => {
        icon.className = icon.className.replace(/\bbi-([\w+\-]+)-fill\b/, (match, p1) => `bi-${p1}`)
        button.style.transform = "scale(1)"
    }

    button.addEventListener('mouseup', mouseout)
    button.addEventListener('mouseleave', mouseout)
})

document.querySelectorAll("#mobile-navbar div").forEach(button => {
    var icon = button.querySelector("i")
    button.onmousedown = () => {
        icon.className = icon.className.replace(/\bbi-([\w+\-]+)\b/, (match, p1) => `bi-${p1}-fill`)
        button.style.transform = "scale(0.9)"
    }
    
    mouseout = () => {
        icon.className = icon.className.replace(/\bbi-([\w+\-]+)-fill\b/, (match, p1) => `bi-${p1}`)
        button.style.transform = "scale(1)"
    }

    button.addEventListener('mouseup', mouseout)
    button.addEventListener('mouseleave', mouseout)
})
