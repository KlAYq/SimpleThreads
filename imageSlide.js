document.querySelectorAll('.post-images').forEach(postImages => {
    let isDragging = false; 
    let startX;
    let scrollLeft;
    let activeImage;
    let cursorDown = { x: 0, y: 0 }; // Track cursor position on mouse down
    let mouseUpPosition = { x: 0, y: 0 }; // Track position on mouse up

    // b and close button references
    const fullscreenBg = document.getElementById('fullscreen-bg');
    const fullscreenImage = document.getElementById('fullscreen-image');
    const closeBtn = document.getElementById('close-btn');

    // Function to open the image in fullscreen
    const openImage = (src) => {
        fullscreenImage.src = src;
        fullscreenBg.style.display = 'flex';  // Show the black bg
    };

    // Close button to close enlarged  image
    closeBtn.addEventListener('click', () => {
        fullscreenBg.style.display = 'none';  // Hide the black bg
    });

    // Closing image when clicking outside the image
    fullscreenBg.addEventListener('click', (e) => {
        if (e.target === fullscreenBg) {
            fullscreenBg.style.display = 'none';  // Hide the black bg
        }
    });

    // Determine if the image has overflow (for sliding content)
    const isOverflowing = postImages.scrollWidth > postImages.clientWidth;

    if (!isOverflowing) {
        postImages.style.cursor = 'pointer';
        postImages.addEventListener('pointerdown', (e) => {
            if (e.target.classList.contains('post-image')) {
                activeImage = e.target;
                activeImage.style.transform = 'scale(0.95)';  // Shrink the image slightly on drag
            }
        }); 
        postImages.addEventListener('pointerup', (e) => {
            if (activeImage) {
                activeImage.style.transform = 'scale(1)';  // Reset image size
                activeImage = null;
            }
        });
        // Click to open the image
        postImages.addEventListener('click', (e) => {
            if (e.target.classList.contains('post-image')) {
                openImage(e.target.src);
            }
        });
    } else {
        // On mousedown event: Store the initial cursor position
        postImages.addEventListener('pointerdown', (e) => {
            isDragging = true;
            cursorDown = { x: e.pageX, y: e.pageY };  
            startX = e.pageX - postImages.offsetLeft;
            scrollLeft = postImages.scrollLeft;
            postImages.style.cursor = 'grabbing';

            if (e.target.classList.contains('post-image')) {
                activeImage = e.target;
                activeImage.style.transform = 'scale(0.95)';  // Shrink the image slightly on drag
            }
        }); 

        // On mousemove event: Handle dragging
        postImages.addEventListener('pointermove', (e) => {
             e.preventDefault();
            if (!isDragging) {
                console.log("pointer move but not dragging so return!");
                return;  // Only allow dragging if isDragging is true
            }

            const x = e.pageX - postImages.offsetLeft;
            const walk = x - startX;
            postImages.scrollLeft = scrollLeft - walk;
        });

        // on mouseup event: Check if mouse position is the same as cursorDown (confirm it is a click)
        postImages.addEventListener('pointerup', (e) => {
            mouseUpPosition = { x: e.pageX, y: e.pageY };  // Store the position on mouse up

            if (cursorDown.x === mouseUpPosition.x && cursorDown.y === mouseUpPosition.y) {
                if (e.target.classList.contains('post-image')) {
                    openImage(e.target.src);
                }
            }
            isDragging = false;
            postImages.style.cursor = 'grab';
            if (activeImage) {
                activeImage.style.transform = 'scale(1)';  // Reset image size
                activeImage = null;
            }
        });

        // On mouseleave event: Reset dragging state if the mouse leaves the area
        postImages.addEventListener('pointerleave', () => {
            console.log("pointer leave!");
            if (isDragging) {
                isDragging = false;  
                postImages.style.cursor = 'grab';
                if (activeImage) {
                    activeImage.style.transform = 'scale(1)';  // Reset image size
                    activeImage = null;
                }
            }
        });

        // Handle touch events for mobile
        postImages.addEventListener('touchstart', (e) => {
            isDragging = true;
            touchStartX = e.touches[0].pageX - postImages.offsetLeft;
            scrollLeft = postImages.scrollLeft;
        });

        postImages.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const x = e.touches[0].pageX - postImages.offsetLeft;
            const walk = x - touchStartX;
            postImages.scrollLeft = scrollLeft - walk;
            e.preventDefault(); // Prevent page scrolling while dragging
        });

        postImages.addEventListener('touchend', () => {
            isDragging = false;
            if (activeImage) {
                activeImage.style.transform = 'scale(1)';
                activeImage = null;
            }
        });
    }
});
