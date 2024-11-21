function selectCurrentTab(event){
  event.preventDefault();

  event.target.classList.add('active');
  event.target.classList.add('fw-bold');
  event.target.setAttribute('aria-current','page');

  let tab = null;

  if (event.target.id === 'allTab') {
    tab = document.getElementById("unreadTab");

  } else if (event.target.id === 'unreadTab') {
    tab = document.getElementById("allTab");
  }

  if (tab !== null) {
    tab.classList.remove('active');
    tab.classList.remove('fw-bold');
    tab.removeAttribute('aria-current');
  }
}

function showNotificationOptions(event){
  event.preventDefault();
  let d = document.createElement('div');
  d.classList.add('dropdown');
  d.classList.add('float-end');
  d.id = "notification-options";
  d.innerHTML = `<button class="btn btn-light dropdown" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
  ...
</button>
<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
  <a class="dropdown-item" href="#">Mark as Seen</a>
  <a class="dropdown-item" href="#">Remove</a>
</div>`;
  event.target.insertBefore(d, event.target.firstElementChild);
}

function hideNotificationOptions(event){
  event.preventDefault();
  document.getElementById("notification-options").remove();
}
