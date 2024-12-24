// const postContentDiv = document.querySelector(".post");

function redirectToPost(username, postId) {
    const excludedClasses = ['avatar', 'post-image', 'post-images', 'username', 'post-actions', 'action', 'like'];
    console.log('redirect started');
    // Check if the target element or any of its parents have one of the excluded classes
    let target = event.target;
    while (target && target !== this) {
        if (excludedClasses.some(cls => target.classList.contains(cls))) {
            console.log("return");
            return;
        }
        target = target.parentElement;
    }
    console.log("none of the excluded classes are found");
    // If none of the excluded classes are found, redirect to the view post page
    window.location.href = `/${username}/post/${postId}`;
}

function displayBufferImage(event){
  let img_upload = document.getElementById("image-upload");
  const [file] = img_upload.files;
  if (file){
    let img_placeholder = document.getElementById("image-placeholder");
    if (img_placeholder != null){
      img_placeholder.src = URL.createObjectURL(file);
    }
  }
}

let upload_img_slot = document.getElementById("image-upload");
if (upload_img_slot != null)
  upload_img_slot.onchange = (event) => displayBufferImage(event);

// document.addEventListener("DOMContentLoaded", () => {

//     // const backButton = document.getElementById('backButton');

//     // Check if we are on a post page (assuming the URL contains 'post' or 'id' parameter)

//     // backButton.classList.remove('d-none'); // Show the back button

//     // Get post ID from URL
//     const urlParams = new URLSearchParams(window.location.search);
//     const postId = urlParams.get('id');

//     // Placeholder post data
//     const postData = {
//         'post-1': {
//             username: "Username",
//             timestamp: "5m ago",
//             description: "This is the post description.",
//             images: ["/res/temp.png", "/res/temp.png"],
//             likes: 1221244,
//             comments: [
//                 { user: "User1", text: "a", timestamp: "23 min ago"},
//                 { user: "User2", text: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", timestamp: "23 min ago" }
//             ]
//         },
//         'post-2': {
//             username: "Username",
//             timestamp: "5m ago",
//             description: "This is the post description.",
//             images: ["/res/temp.png", "/res/temp.png", "/res/temp.png", "/res/temp.png","/res/temp.png"],
//             likes: 1221244,
//             comments: [
//                 { user: "User1", text: "12", timestamp: "23 min ago" },
//                 { user: "User2", text: "123", timestamp: "23 min ago" },
//                 { user: "User3", text: "a", timestamp: "23 min ago" }
//             ]
//         }
//     };

//     // Retrieve post data based on postId
//     const post = postData[postId];
//     if (post) {
//         postContentDiv.querySelector(".username").textContent = post.username;
//         postContentDiv.querySelector(".timestamp").textContent = post.timestamp;
//         postContentDiv.querySelector(".post-description").textContent = post.description;
//         postContentDiv.querySelector(".like-count").textContent = post.likes;
//         postContentDiv.querySelector(".comment-count").textContent = post.comments.length;

//         const postImagesDiv = postContentDiv.querySelector(".post-images");
//         post.images.forEach(src => {
//             const img = document.createElement("img");
//             img.src = src;
//             img.classList.add("post-image");
//             img.draggable = false;
//             img.alt = "Post Image";
//             postImagesDiv.appendChild(img);
//         });

//         const commentsDiv = document.getElementById("post-comments");
//         commentsDiv.innerHTML = post.comments.map(comment => `
//             <div class="commentSection">
//                 <div class="comment-header">
//                     <img src="../res/avatar.png" alt="Avatar" class="comment-avatar">
//                     <div class="comment-info">
//                         <span class="comment-username">${comment.user}</span>
//                         <span class="comment-timestamp">${comment.timestamp}</span>
//                     </div>
//                 </div>
//                 <div class="comment-text">
//                     ${comment.text}
//                 </div>
//             </div>
//         `).join('');
//     }
//     console.log("post loaded");
// });
