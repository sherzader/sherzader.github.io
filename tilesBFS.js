(function() {
    const directions = [
        {
            key: "left",
            xDir: -1, // left
            yDir: 0,
            transform: "rotateY(180deg)",
            transformOrigin: "center left",
        },
        {
            key: "up",
            xDir: 0, // up
            yDir: -1,
            transform: "rotateX(-180deg)",
            transformOrigin: "top center",
        },
        {
            key: "right",
            xDir: 1, // right
            yDir: 0,
            transform: "rotateY(-180deg)",
            transformOrigin: "center right",
        },
        {
            key: "down",
            xDir: 0, // down
            yDir: 1,
            transform: "rotateX(180deg)",
            transformOrigin: "bottom center",
        },
    ];

    const rhombusWidth = 50;
    const rhombusHeight = 50;
    const windowWidth = window.outerHeight * window.devicePixelRatio;
    const windowHeight = window.innerHeight * window.devicePixelRatio;
    const numRhombusRows = Math.ceil(windowHeight / rhombusHeight);
    const numRhombusCols = Math.ceil(windowWidth / rhombusWidth);
    const rectMatrix = [];

    const addRhombusElements = () => {
        const main = document.createElement("div");
        main.classList.add("background-rhombi");
        // let xOffset = -rhombusWidth;
        // let xPos = xOffset;
        for (let y = 0; y < numRhombusRows; y++) {
            rectMatrix.push([]);
            for (let x = 0; x < numRhombusCols; x++) {
                let rhombus = document.createElement("div");
                rhombus.classList.add("rect");
                rhombus.dataset.x = x;
                rhombus.dataset.y = y;
                rhombus.setAttribute(
                    "style",
                    `top:${rhombusHeight * y};left:${rhombusWidth *
                        x};width:${rhombusWidth};height:${rhombusHeight};`
                );
                main.appendChild(rhombus);
                rectMatrix[y].push(rhombus);
            }
        }

        document.body.appendChild(main);
    };
    // "The load event is fired when a resource and its
    // dependent resources have finished loading."
    // - MDN, https://developer.mozilla.org/en-US/docs/Web/Events/load
    window.addEventListener("load", async e => {
        await animateRhombi();
        document.querySelector(".background-rhombi").style.position =
            "relative";
        // now you can interact with page
    });

    /**
     * Shuffles array in place. ES6 version
     * @param {Array} a items An array containing the items.
     */
    const shuffle = a => {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };
    const animateRhombi = () => {
        return new Promise(async (resolve, reject) => {
            const { x, y } = getCenterRhombus();
            let queue = [[x, y]];
            while (queue.length) {
                const [currX, currY] = queue.pop();
                const rhombus = rectMatrix[currY][currX];
                if (rhombus.dataset.hasVisited) {
                    continue;
                }
                const directionToGo = chooseDirection(currX, currY);
                moveInDirection(directionToGo, currX, currY);
                await takeABreath();

                // queue neighbors
                for (dir of directions) {
                    const { xDir, yDir } = dir;
                    const newX = currX + xDir;
                    const newY = currY + yDir;
                    if (isValidMove(newX, newY)) {
                        queue.unshift([newX, newY]);
                    }
                }
                rhombus.dataset.hasVisited = true;
                // rhombus.style.visibility = "hidden";
                queue = shuffle(queue);
            }
            resolve();
        });
    };
    const chooseDirection = (x, y) => {
        for (dir of directions) {
            const { xDir, yDir } = dir;
            const newX = x + xDir;
            const newY = y + yDir;
            if (
                isValidMove(newX, newY) &&
                !rectMatrix[newY][newX].dataset.hasVisited
            ) {
                return dir;
            }
        }
        return directions[0];
    };
    /**
     * takeABreak is necessary to see the css transforms happening.
     * Another way is to wrap transformRhombus in a similar Promise.
     * But that way looks like the squares are doing "the wave" (https://youtu.be/H0K2dvB-7WY?t=12),
     * and not all moving at once, which is the effect I want.
     */
    const takeABreath = async () => {
        await new Promise((resolve, reject) => {
            window.setTimeout(resolve, 10);
        });
    };

    const getCenterRhombus = () => {
        const x = Math.floor(window.innerWidth / 2 / rhombusWidth);
        const y = Math.floor(window.innerHeight / 2 / rhombusWidth);
        return { x, y };
    };

    const moveInDirection = (direction, x, y) => {
        const { transform, transformOrigin } = direction;
        const rhombus = rectMatrix[y][x];
        transformRhombus(rhombus, transform, transformOrigin);
    };

    const transformRhombus = (rhombus, transform, transformOrigin) => {
        const promise = new Promise((resolve, reject) => {
            rhombus.style.zIndex = "1";
            rhombus.style.transform = transform;
            rhombus.style.transformOrigin = transformOrigin;
            window.setTimeout(resolve, 1000);
        });
        promise.then(() => (rhombus.style.visibility = "hidden"));
        return promise;
    };

    const isValidMove = (newX, newY) => {
        return (
            newX >= 0 &&
            newX <= numRhombusCols - 1 &&
            newY >= 0 &&
            newY <= numRhombusRows - 1
        );
    };

    addRhombusElements();
})();
