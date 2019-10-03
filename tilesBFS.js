(function() {
    const directions = [
        {
            key: "left",
            xDir: -1,
            yDir: 0,
            transform: "rotateY(180deg)",
            transformOrigin: "center left",
        },
        {
            key: "up",
            xDir: 0,
            yDir: -1,
            transform: "rotateX(-180deg)",
            transformOrigin: "top center",
        },
        {
            key: "right",
            xDir: 1,
            yDir: 0,
            transform: "rotateY(-180deg)",
            transformOrigin: "center right",
        },
        {
            key: "down",
            xDir: 0,
            yDir: 1,
            transform: "rotateX(180deg)",
            transformOrigin: "bottom center",
        },
    ];

    const rhombusWidth = 50;
    const rhombusHeight = 50;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const numRhombusRows = Math.ceil(windowHeight / rhombusHeight);
    const numRhombusCols = Math.ceil(windowWidth / rhombusWidth);

    const rectMatrix = [];
    const totalRhombi = numRhombusRows * numRhombusCols;
    let animatedRhombi = 0;

    const addRhombusElements = () => {
        const main = document.createElement("div");
        main.classList.add("tileContainer", "background-bfs-rhombi");

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
    window.addEventListener("load", e => {
        animateRhombi();
    });

    const finishAnimation = () => {
        document.querySelector(".background-bfs-rhombi").remove();
        resolveDefferred();
    };

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
            let queue = [[x, y, directions[0]]];
            while (queue.length) {
                const [currX, currY, directionToGo] = queue.pop();
                const rhombus = rectMatrix[currY][currX];
                if (rhombus.dataset.hasVisited) {
                    continue;
                }
                moveInDirection(directionToGo, currX, currY);
                await takeABreath();

                // queue neighbors
                for (dir of directions) {
                    const { xDir, yDir } = dir;
                    const newX = currX + xDir;
                    const newY = currY + yDir;
                    if (isValidMove(newX, newY)) {
                        queue.unshift([newX, newY, dir]);
                    }
                }
                rhombus.dataset.hasVisited = true;
                // uncomment following to increase entropy
                // queue = shuffle(queue);
            }
            resolve();
        });
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

    const transformRhombus = async (rhombus, transform, transformOrigin) => {
        await new Promise((resolve, reject) => {
            rhombus.style.zIndex = "1";
            rhombus.style.transform = transform;
            rhombus.style.transformOrigin = transformOrigin;
            window.setTimeout(resolve, 1000);
        });
        rhombus.style.opacity = "0"; // hide just transformed rhombus
        animatedRhombi++;
        if (animatedRhombi === totalRhombi) {
            finishAnimation();
        }
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
