// header scroll event
window.addEventListener('scroll', (event)=>{
    const height = window.scrollY;
    const header = document.querySelector("header");

    if (height > 400){
        header.classList.add("scrolled")
    } else {
        header.classList.remove("scrolled")
    }
})

// Utility Functions
// function handleActiveToggle(openMenu, menu) {
//     const closeMenu = menu.querySelector('.close-menu');

//     openMenu.addEventListener('click', () => {
//         // Hide any open preview before previewing the new one
//         hideAllPreview()

//         menu.classList.add('active')
//         document.body.classList.add('active')
//     });

//     closeMenu.addEventListener('click', () => {
//         menu.classList.remove('active')
//         document.body.classList.remove('active')
//     })

//     menu.addEventListener('click', (e) => {
//         if (!e.target.closest('[class*="content"]')) {
//             menu.classList.remove('active')
//             document.body.classList.remove('active')
//         }
//     })
// }


// function hideAllPreview() {
//     const openPreview = document.querySelector('[class*="active"]')

//     if (openPreview) {
//         openPreview.classList.remove('active');
//         document.body.classList.remove('active')
//     }
// }
