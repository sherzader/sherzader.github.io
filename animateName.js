(function() {
    const nameEl = document.querySelector("h1.name");
    const name = nameEl.innerHTML;
    nameEl.innerHTML = "";

    let i = 0;
    setTimeout(async () => {
        await animateName;
    }, 5000);

    const animateName = new Promise((resolve, reject) => {
        const intervalID = setInterval(() => {
            if (i > name.length - 1) {
                clearInterval(intervalID);
                resolve();
                return;
            }
            nameEl.innerHTML += name[i];

            i += 1;
        }, 500);
    });
})();
