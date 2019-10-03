(function(){
    const nameEl = document.querySelector("h1.name");
    const name = "Hi, I'm Sheri Zada";
    let i = 0;
    setTimeout(() => {
        const intervalID = setInterval(() => {
            if (i > name.length - 1) {
                clearInterval(intervalID);
                return;
            }
            nameEl.innerHTML += name[i];

            i += 1;
        }, 200);
    }, 3000);
})()