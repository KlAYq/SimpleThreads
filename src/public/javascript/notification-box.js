

function optionsOn(box){
  let boxId = box.dataset.id;
  document.querySelectorAll(".notification-actions").forEach((button) => {button.style.setProperty("display","none");});
  document.querySelectorAll(`.box-id-${boxId}`).forEach((button) => {button.style.setProperty("display","block");});
}

function optionsOff(box){
  let boxId = box.dataset.id;
  document.querySelectorAll(`.box-id-${boxId}`).forEach((button) => {button.style.setProperty("display","none");});
}


async function markNotificationAsSeen(btn){
  const id = btn.dataset.id;
  try {
    const res = await fetch(`notifications/seen/${id}`, {
      method: "POST",
    });
    if (res.status === 200){
      return location.reload();
    } else {
      const resText = await res.text();
      throw new Error(resText);
    }
  } catch (e){
    console.error(e);
  }
}

async function goToNotification(btn){
  const id = btn.dataset.id;
  const href = btn.dataset.href;

  try {
    const res = await fetch(`notifications/${id}`, {
      method: "POST"
    });

    if (res.status === 200){
      return location.replace(href);
    } else {
      const resText = await res.text();
      throw new Error(resText);
    }



  } catch (e){
    console.error(e);
  }
}

async function markAllNotificationsAsSeen(){
  try {
    const res = await fetch("notifications/seen/all", {
      method: "POST",
    });
    if (res.status === 200){
      return location.reload();
    } else {
      const resText = await res.text();
      throw new Error(resText);
    }
  } catch (e){
    console.error(e);
  }
}

async function removeNotification(btn){
  const id = btn.dataset.id;
  try {
    const res = await fetch(`notifications/${id}`, {
      method: "DELETE",
    });

    location.reload();

    if (res.status === 200){

    } else {
      const resText = await res.text();
      throw new Error(resText);
    }
  } catch (e){
    console.error(e);
  }
}


async function removeSeenNotifications(){
  try {
    const res = await fetch("notifications/remove/seen", {
      method: "DELETE",
    });

    location.reload();

    if (res.status === 200){

    } else {
      const resText = await res.text();
      throw new Error(resText);
    }
  } catch (e){
    console.error(e);
  }
}

async function removeAllNotifications(){
  try {
    const res = await fetch(`notifications/remove/all`, {
      method: "DELETE",
    });

    location.reload();

    if (res.status === 200){

    } else {
      const resText = await res.text();
      throw new Error(resText);
    }
  } catch (e){
    console.error(e);
  }
}




