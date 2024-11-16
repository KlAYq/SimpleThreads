document.querySelectorAll(".sidebar-button").forEach(button => {
    var icon = button.querySelector("i")

    button.addEventListener('mousedown', () => {
        // icon.className = icon.className.replace(/\bbi-([\w+\-]+)\b/, (match, p1) => `bi-${p1}-fill`)
        button.style.transform = "scale(0.9)"
    })

    mouseout = () => {
        // icon.className = icon.className.replace(/\bbi-([\w+\-]+)-fill\b/, (match, p1) => `bi-${p1}`)
        button.style.transform = "scale(1)"
    }

    button.addEventListener('mouseup', mouseout)
    button.addEventListener('mouseleave', mouseout)
})

document.querySelectorAll("#mobile-navbar div").forEach(button => {
    var icon = button.querySelector("i")
    button.onmousedown = () => {
        // icon.className = icon.className.replace(/\bbi-([\w+\-]+)\b/, (match, p1) => `bi-${p1}-fill`)
        button.style.transform = "scale(0.9)"
    }

    mouseout = () => {
        // icon.className = icon.className.replace(/\bbi-([\w+\-]+)-fill\b/, (match, p1) => `bi-${p1}`)
        button.style.transform = "scale(1)"
    }

    button.addEventListener('mouseup', mouseout)
    button.addEventListener('mouseleave', mouseout)
})

async function followToggle(){
  let b = document.getElementById("follow-button");
  // console.log(b);
  if (b.innerText === "Follow"){
    b.innerText = "Unfollow";
    // console.log(b.innerText);
  }
  else {
    b.innerText = "Follow";
    // console.log(b.innerText);
  }

}


function changeFollowOption(event){
  event.preventDefault();

  if (event.target.innerText === 'Follow') {
    event.target.innerText = "Followed";
    event.target.classList.remove('btn-dark');
    event.target.classList.add('btn-outline-dark');
  } else {
    event.target.innerText = "Follow";
    event.target.classList.remove('btn-outline-danger');
    event.target.classList.add('btn-dark');
  }
}

function hoverFollowButton(event){
  event.preventDefault();
  if (event.target.innerText !== 'Follow'){
    event.target.innerText = 'Unfollow';
    event.target.classList.remove('btn-outline-dark');
    event.target.classList.add('btn-outline-danger');
  }
}

function unHoverFollowButton(event){
  event.preventDefault();
  if (event.target.innerText !== 'Follow'){
    event.target.innerText = 'Followed';
    event.target.classList.add('btn-outline-dark');
    event.target.classList.remove('btn-outline-danger');

  }
}
