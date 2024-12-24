document.querySelectorAll(".notification-box").forEach((box) => {
  box.onmouseleave = () => {
    document.querySelectorAll(".notification-actions").forEach((button) => {button.style.setProperty("display","none");})

  }
  box.onmouseenter = () => {
    document.querySelectorAll(".notification-actions").forEach((button) => {button.style.setProperty("display","block");})
  }
})


async function markNotificationAsSeen(){

}

async function removeNotification(id){
  try {
    const res = await fetch(`notifications/${id}`, {
      method: "DELETE",
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
