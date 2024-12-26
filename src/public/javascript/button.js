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
        button.style.transform = "scale(0.9)"
    }

    mouseout = () => {
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
  if (event.target.innerText === 'Follow') {
    event.target.innerText = "Following";
    event.target.classList.remove('btn-dark');
    event.target.classList.add('btn-outline-dark');
    event.target.setAttribute('data-action', 'unfollow')
  } else {
    event.target.innerText = "Follow";
    event.target.classList.remove('btn-outline-danger');
    event.target.classList.add('btn-dark');
    event.target.setAttribute('data-action', 'follow')
  }
}

function hoverFollowButton(event){
  event.preventDefault();
  if (event.target.innerText === 'Following'){
    event.target.innerText = 'Unfollow';
    event.target.classList.remove('btn-outline-dark');
    event.target.classList.add('btn-outline-danger');
  }
}

function unHoverFollowButton(event){
  event.preventDefault();
  if (event.target.innerText === 'Unfollow'){
    event.target.innerText = 'Following';
    event.target.classList.add('btn-outline-dark');
    event.target.classList.remove('btn-outline-danger');
  }
}

document.querySelectorAll('#follow-button').forEach(button => {
  const id = button.dataset.id;
  const username = button.dataset.username;

  button.addEventListener('click', async (event) => {
    try {
      const action = button.dataset.action;
      const res = await fetch(`/${username}/${action}/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (res.status == 200) {
        changeFollowOption(event)
        return;
      }
      const resText = await res.text();
      throw new Error(resText);
    } catch (error) {
      console.error(error);
    }
  });
});

function updateIndicatorPosition() {
  const tabButtons = document.querySelectorAll('.nav-link');

  tabButtons.forEach(button => {
    const indicator = button.querySelector('#tab-select-indicator');
    if (indicator) indicator.style.display = 'none';
  });

  const activeTab = document.querySelector('.nav-link.active');

  const activeIndicator = activeTab.querySelector('#tab-select-indicator');
  if (activeIndicator) {
    activeIndicator.style.display = 'block';
  }
}

document.getElementById('nav-tab').addEventListener('shown.bs.tab', function (event) {
  updateIndicatorPosition();
});

window.addEventListener('load', updateIndicatorPosition);