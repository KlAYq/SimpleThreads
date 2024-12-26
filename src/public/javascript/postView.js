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
    window.location.href = `/post/${postId}`;
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

const commentInput = document.querySelector("#comment-input");
const charCount = document.querySelector("#char-count");
const charWarning = document.querySelector("#char-warning");
const sendButton = document.querySelector("#send-comment");
const commentSection = document.querySelector("#post-comments");

function updateCharCount() {
  const count = commentInput.value.length;
  charCount.textContent = `${count}/255`;
  if (count > 254) {
    if (!charCount.classList.contains("text-danger")) {
      charCount.classList.add("text-danger", "shake");
      setTimeout(() => charCount.classList.remove("shake"), 300); // Remove shake class after animation
    }
  } else {
    charCount.classList.remove("text-danger");
  }
}

function adjustHeight() {
  commentInput.style.height = 'auto';
  commentInput.style.height = (commentInput.scrollHeight) + 'px';
}

commentInput.addEventListener('input', () => {
  updateCharCount();
  adjustHeight();
});

sendButton.addEventListener("click", async function(event) {
  const commentText = commentInput.value.trim();

  if (commentText && commentText.length <= 255) {
    const postId = this.dataset.postId;
    const response = await fetch(`/post/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: commentText })
    });


    const data = await response.json();

    if (data.success) {
      const newComment = document.createElement("div");
      newComment.classList.add("commentSection", "p-3", "mb-2");

      newComment.innerHTML = `
                    <div class="comment-header d-flex align-items-center mb-1">
                        <a href="/${data.commentData.username}" class="me-2">
                            <img src="${data.commentData.avatar}" alt="Avatar" class="comment-avatar rounded-circle" style="width: 40px; height: 40px;">
                        </a>
                        <div class="comment-info">
                            <a href="/${data.commentData.username}" class="username text-dark">
                                <span class="comment-username fw-bold">${data.commentData.fullname} (${data.commentData.username})</span>
                            </a>
                            <span class="comment-timestamp text-muted small"> ${data.commentData.timestamp}</span>
                        </div>
                    </div>
                    <div class="comment-text">
                        ${data.commentData.text}
                    </div>
                `;
      commentSection.insertBefore(newComment, commentSection.firstChild);

      commentInput.value = "";
      updateCharCount();
      adjustHeight();
    } else {
      alert("Failed to post comment");
    }
  }
});

commentInput.addEventListener("keypress", function(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendButton.click();
  }
});

// Initial call to set up the textarea
adjustHeight();

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
