function UpdateBackgroundBasedOnScrollPosition() {
    var classes = document.getElementsByClassName("video-preview");
    for (var i = 0; i < classes.length; i++) {
        let delta = document.scrollingElement.scrollTop / 400;
        if (delta > 1)
            delta = 1;
        let opacity = 1 - delta;
        opacity *= 1;
        if (opacity < 0.1)
            opacity = 0.1;
        if (opacity > 1)
            opacity = 1;
        let element = classes[i];
        element.style.opacity = opacity.toString();
        element.style.filter = "blur( " + (delta * 30) + "px )";
    }
}


document.addEventListener("scroll", () => {
    const scrollIndicator = document.querySelector(".scroll-indicator");
    const scrollPosition = window.scrollY;
    const fadeStart = 50
    const fadeEnd = 250;
    let opacity = 1;

    if (scrollPosition <= fadeStart) {
        opacity = 1;
    } else if (scrollPosition >= fadeEnd) {
        opacity = 0;
    } else {
        opacity = 1 - (scrollPosition - fadeStart) / (fadeEnd - fadeStart);
    }

    scrollIndicator.style.opacity = opacity;
});

document.addEventListener("scroll", () => UpdateBackgroundBasedOnScrollPosition());