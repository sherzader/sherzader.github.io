(function() {
    const rhombusWidth = 50;
    const rhombusHeight = 50;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const numRhombusRows = Math.ceil(windowHeight / rhombusHeight);
    const numRhombusCols = Math.ceil(windowWidth / rhombusWidth);
    const animatingRectMatrix = [];

    const addRhombusElements = () => {
        const main = document.createElement("div");
        const background = document.createElement("div");
        background.classList.add(
            "background",
            "tileContainer",
            "background-spiral-rhombi"
        );
        main.classList.add(
            "foreground",
            "tileContainer",
            "background-spiral-rhombi"
        );

        for (let y = 0; y < numRhombusRows; y++) {
            animatingRectMatrix.push([]);

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
                background.appendChild(rhombus.cloneNode());

                animatingRectMatrix[y].push(rhombus);
            }
        }
        const articleEl = document.querySelector("article");
        articleEl.appendChild(background);
        articleEl.appendChild(main);
        setTimeout(() => {
            main.style.filter = "none";
        }, 500);

        runSpiralingTiles();
    };
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
            transform: "rotateX(180deg)",
            transformOrigin: "top center",
        },
        {
            key: "right",
            xDir: 1,
            yDir: 0,
            transform: "rotateY(180deg)",
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

    const runSpiralingTiles = async () => {
        let { x, y } = getCenterRhombus();

        // initialize variables
        let direction = 0; // int representing one of four directions, left/up/right/down
        let cycle = 0; // num of spirals
        let moveOutwards = false; // increase cycle
        // les move!
        while (true) {
            try {
                const { newX, newY } = await moveInDirection(
                    direction,
                    cycle,
                    x,
                    y
                );
                x = newX;
                y = newY;
            } catch (e) {
                // shhh
                return;
            }
            // increment indices to keep track of where you are
            const { key } = directions[direction];
            moveOutwards = (key === "left" && cycle >= 1) || key === "right";
            if (moveOutwards) {
                cycle++;
            }
            direction = (direction + 1) % directions.length;
        }
    };
    const moveInDirection = async (direction, cycle, x, y, rhombus) => {
        let { xDir, yDir, transform, transformOrigin } = directions[direction];
        let newX = x;
        let newY = y;

        for (let i = 0; i <= cycle; i++) {
            newX += xDir;
            newY += yDir;
            if (!isValidMove(newX, newY)) {
                const betterDir = findValidMove(newX - xDir, newY - yDir);
                if (!betterDir) return;
                newX = betterDir.newX;
                newY = betterDir.newY;
                transform = betterDir.transform;
                transformOrigin = betterDir.transformOrigin;
            }

            rhombus = animatingRectMatrix[newY][newX];
            rhombus.dataset.hasVisited = true;

            await transformRhombus(rhombus, transform, transformOrigin);
        }

        return { newX, newY };
    };
    /**
     * Finds the first available spot to move to.
     * Needs to be smarter than "first available" in order to not run out of moves early.
     * @param {number} x
     * @param {number} y
     * @returns {object}
     */
    const findValidMove = (x, y) => {
        for (dir of directions) {
            const { xDir, yDir, transform, transformOrigin } = dir;
            if (isValidMove(x + xDir, y + yDir)) {
                return {
                    newX: x + xDir,
                    newY: y + yDir,
                    transform,
                    transformOrigin,
                };
            }
        }
    };
    const transformRhombus = async (rhombus, transform, transformOrigin) => {
        await new Promise((resolve, reject) => {
            rhombus.style.zIndex = "1";
            rhombus.style.transformOrigin = transformOrigin;
            rhombus.style.transform = transform;
            rhombus.style.visibility = "hidden";
            window.setTimeout(resolve, 500);
        });
    };
    const isValidMove = (newX, newY) => {
        return (
            newX >= 0 &&
            newX <= numRhombusCols - 1 &&
            newY >= 0 &&
            newY <= numRhombusRows - 1 &&
            !animatingRectMatrix[newY][newX].dataset.hasVisited
        );
    };
    const getCenterRhombus = () => {
        const x = Math.floor(window.innerWidth / 2 / rhombusWidth);
        const y = Math.floor(window.innerHeight / 2 / rhombusWidth);
        return { x, y };
    };
    addRhombusElements();
})();
