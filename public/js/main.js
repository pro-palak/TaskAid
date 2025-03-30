document.addEventListener('DOMContentLoaded', () => {
    const slideContent = [
        {
            character: 'assets/bart-simpson.png',
            bubbles: ['Study Math', 'Draw Graffiti', 'Eat Sundae'],
            bgColor: '#E9E5FF'
        },
        {
            character: 'assets/lisa-simpson.png',
            bubbles: ['Practice saxophone', 'Study for exam', 'Write essay'],
            bgColor: '#FFE5E5'
        },
        {
            character: 'assets/homer-simpson.png',
            bubbles: ['Buy donuts', 'Check schedule', 'Watch TV'],
            bgColor: '#E5FFE5'
        },
        {
            character: 'assets/marge-simpson.png',
            bubbles: ['Clean house', 'Garden work', 'Cook dinner'],
            bgColor: '#E5F6FF'
        }

    ];

    const bubbles = document.querySelectorAll('.bubble');
    const characterImg = document.querySelector('.character-img');
    const body = document.body;
    let currentSlide = 0;

    const dotsContainer = document.querySelector('.slideshow-dots');
    slideContent.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateSlide(currentSlide);
        });
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function updateSlide(index) {
        body.style.backgroundColor = slideContent[index].bgColor;

        characterImg.style.opacity = '0';
        setTimeout(() => {
            characterImg.src = slideContent[index].character;
            characterImg.style.opacity = '1';
        }, 300);

        bubbles.forEach((bubble, i) => {
            bubble.style.opacity = '0';
            setTimeout(() => {
                bubble.textContent = slideContent[index].bubbles[i];
                bubble.style.opacity = '1';
            }, 300);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideContent.length;
        updateSlide(currentSlide);
    }

    updateSlide(0);
    dots[0].classList.add('active');

    setInterval(nextSlide, 3000);
});