document.addEventListener('DOMContentLoaded', () => {
    // Elements selection
    const canvas = document.getElementById('sortCanvas');
    const ctx = canvas.getContext('2d');
    const bubbleSortBtn = document.getElementById('bubbleSortBtn');
    const mergeSortBtn = document.getElementById('mergeSortBtn');
    const quickSortBtn = document.getElementById('quickSortBtn');
    const cocktailSortBtn = document.getElementById('cocktailSortBtn');
    const selectionSortBtn = document.getElementById('selectionSortBtn');
    const smoothSortBtn = document.getElementById('smoothSortBtn');
    const controlBtn = document.getElementById('controlBtn');
    const arraySizeInput = document.getElementById('arraySize');
    const arraySizeLabel = document.getElementById('arraySizeLabel');
    const speedInput = document.getElementById('speed');
    const speedLabel = document.getElementById('speedLabel');

    // default vars
    let array = [];
    let sortingAlgorithm = 'bubble';  // Algorithme de tri par défaut
    let arraySize = parseInt(arraySizeInput.value, 10);
    let speed = parseInt(speedInput.value, 10);
    let isSorting = false;
    let isPaused = false;
    let animationFrameId;

    // Gestion de la taille de la liste
    arraySizeInput.addEventListener('input', (e) => {
        arraySize = parseInt(e.target.value, 10);
        arraySizeLabel.textContent = arraySize;
        if (!isSorting) {
            generateArray();
            drawArray();
        }
    });

    // Gestion de la vitesse de l'animation
    speedInput.addEventListener('input', (e) => {
        speed = parseInt(e.target.value, 10);
        speedLabel.textContent = speed;
    });

    // Gestion des boutons de tri
    bubbleSortBtn.addEventListener('click', () => {
        sortingAlgorithm = 'bubble';
        resetSimulation();
    });

    mergeSortBtn.addEventListener('click', () => {
        sortingAlgorithm = 'merge';
        resetSimulation();
    });

    quickSortBtn.addEventListener('click', () => {
        sortingAlgorithm = 'quick';
        resetSimulation();
    });

    cocktailSortBtn.addEventListener('click', () => {
        sortingAlgorithm = 'cocktail';
        resetSimulation();
    });

    selectionSortBtn.addEventListener('click', () => {
        sortingAlgorithm = 'selection';
        resetSimulation();
    });

    smoothSortBtn.addEventListener('click', () => {
        sortingAlgorithm = 'smooth';
        resetSimulation();
    });

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Definition de la logique
    //////////////////////////////////////////////////////////////////////////////////////////////


    // Gestion du bouton de contrôle (Go/Stop)
    controlBtn.addEventListener('click', () => {
        if (!isSorting) {  // Démarrer la simulation
            isSorting = true;
            isPaused = false;
            controlBtn.textContent = 'Stop';
            arraySizeInput.disabled = true;
            startSorting();
        } else {  // Mettre en pause ou reprendre la simulation
            if (isPaused) {
                isPaused = false;
                controlBtn.textContent = 'Stop';
                requestAnimationFrame(animateSorting);
            } else {  // Redémarrer
                isPaused = true;
                controlBtn.textContent = 'Go';
                cancelAnimationFrame(animationFrameId);
            }
        }
    });


    // Générer  la liste aleatoire de base
    function generateArray() {
        array = Array.from({ length: arraySize }, () => Math.floor(Math.random() * canvas.height));
    }

    // Dessiner la liste dans canva
    function drawArray(highlightIndex = null) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = canvas.width / array.length;
        array.forEach((value, index) => {
            ctx.fillStyle = (index === highlightIndex) ? 'yellow' : '#007BFF';
            ctx.fillRect(index * barWidth, canvas.height - value, barWidth, value);
        });
    }


    function resetSimulation() {
        if (isSorting) {
            isSorting = false;
            cancelAnimationFrame(animationFrameId);
            controlBtn.textContent = 'Go';
            arraySizeInput.disabled = false;
        }
        generateArray();
        drawArray();
    }


    // Démarrer le tri en fonction de l'algorithme sélectionné
    async function startSorting() {
        if (sortingAlgorithm === 'bubble') {
            await bubbleSort();
        } else if (sortingAlgorithm === 'merge') {
            await mergeSortWrapper();
        } else if (sortingAlgorithm === 'quick') {
            await quickSortWrapper();
        } else if (sortingAlgorithm === 'cocktail') {
            await cocktailSortWrapper();
        } else if (sortingAlgorithm === 'selection') {
            await selectionSortWrapper();
        } else if (sortingAlgorithm === 'smooth') {
            await smoothSortWrapper();
        }
        isSorting = false;
        controlBtn.textContent = 'Go';
        arraySizeInput.disabled = false;
    }


    // Animation de tri (appelée en boucle par requestAnimationFrame)
    function animateSorting() {
        if (isPaused) return;
        if (sortingAlgorithm === 'bubble') {
            bubbleSortStep();
        } else if (sortingAlgorithm === 'merge') {
            mergeSortStep();
        } else if (sortingAlgorithm === 'quick') {
            quickSortStep();
        } else if (sortingAlgorithm === 'cocktail') {
            cocktailSortStep();
        } else if (sortingAlgorithm === 'selection') {
            selectionSortStep();
        } else if (sortingAlgorithm === 'smooth') {
            smoothSortStep();
        }
        animationFrameId = requestAnimationFrame(animateSorting);
    }

    /////////////////
    // Tri à bulle
    /////////////////
    async function bubbleSort() {
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array.length - i - 1; j++) {
                if (array[j] > array[j + 1]) {
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    drawArray(j + 1);
                    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
                    if (isPaused) {
                        await pauseCheck();
                    }
                }
            }
        }
    }

    let bubbleI = 0, bubbleJ = 0;
    function bubbleSortStep() {
        if (bubbleI < array.length) {
            if (bubbleJ < array.length - bubbleI - 1) {
                if (array[bubbleJ] > array[bubbleJ + 1]) {
                    [array[bubbleJ], array[bubbleJ + 1]] = [array[bubbleJ + 1], array[bubbleJ]];
                    drawArray(bubbleJ + 1);
                }
                bubbleJ++;
            } else {
                bubbleJ = 0;
                bubbleI++;
            }
        } else {
            resetSimulation();
        }
    }

    /////////////////
    // Tri fusion
    /////////////////
    async function mergeSortWrapper() {
        await mergeSort(array, 0, array.length - 1);
    }

    async function mergeSort(arr, l, r) {
        if (l >= r) return;
        const m = l + Math.floor((r - l) / 2);
        await mergeSort(arr, l, m);
        await mergeSort(arr, m + 1, r);
        await merge(arr, l, m, r);
    }

    async function merge(arr, l, m, r) {
        const n1 = m - l + 1;
        const n2 = r - m;
        const left = arr.slice(l, m + 1);
        const right = arr.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;

        while (i < n1 && j < n2) {
            if (isPaused) await pauseCheck();
            if (left[i] <= right[j]) {
                arr[k++] = left[i++];
            } else {
                arr[k++] = right[j++];
            }
            drawArray(k - 1);
            await new Promise(resolve => setTimeout(resolve, 1000 / speed));
        }
        while (i < n1) arr[k++] = left[i++];
        while (j < n2) arr[k++] = right[j++];
        drawArray();
        await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    }

    let mergeQueue = [];
    function mergeSortStep() {
        if (mergeQueue.length === 0) {
            mergeQueue.push([0, array.length - 1]);
        }

        if (mergeQueue.length > 0) {
            const [l, r] = mergeQueue.shift();
            if (l < r) {
                const m = l + Math.floor((r - l) / 2);
                mergeQueue.push([l, m]);
                mergeQueue.push([m + 1, r]);
                mergeStep(l, m, r);
            }
        } else {
            resetSimulation();
        }
    }

    async function mergeStep(l, m, r) {
        const n1 = m - l + 1;
        const n2 = r - m;
        const left = array.slice(l, m + 1);
        const right = array.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;

        while (i < n1 && j < n2) {
            if (left[i] <= right[j]) {
                array[k++] = left[i++];
            } else {
                array[k++] = right[j++];
            }
            drawArray(k - 1);
        }
        while (i < n1) array[k++] = left[i++];
        while (j < n2) array[k++] = right[j++];
        drawArray();
    }

    /////////////////
    // Tri rapide
    /////////////////
    async function quickSortWrapper() {
        await quickSort(array, 0, array.length - 1);
    }

    async function quickSort(arr, low, high) {
        if (low < high) {
            const pi = await partition(arr, low, high);
            await quickSort(arr, low, pi - 1);
            await quickSort(arr, pi + 1, high);
        }
    }

    async function partition(arr, low, high) {
        const pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                drawArray(j);
                await new Promise(resolve => setTimeout(resolve, 1000 / speed));
                if (isPaused) {
                    await pauseCheck();
                }
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        drawArray(i + 1);
        await new Promise(resolve => setTimeout(resolve, 1000 / speed));
        return i + 1;
    }

    let quickLow = 0, quickHigh = array.length - 1, quickStack = [];
    function quickSortStep() {
        if (quickStack.length === 0) {
            quickStack.push([quickLow, quickHigh]);
        }

        if (quickStack.length > 0) {
            const [low, high] = quickStack.pop();
            if (low < high) {
                const pi = partitionSync(array, low, high);
                quickStack.push([low, pi - 1]);
                quickStack.push([pi + 1, high]);
                drawArray(pi);
            }
        } else {
            resetSimulation();
        }
    }

    function partitionSync(arr, low, high) {
        const pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        return i + 1;
    }

    /////////////////
    // Tri cocktail
    /////////////////
    async function cocktailSortWrapper() {
        await cocktailSort(array);
    }

    async function cocktailSort(arr) {
        let swapped = true;
        let start = 0;
        let end = arr.length;

        while (swapped) {
            swapped = false;

            for (let i = start; i < end - 1; i++) {
                if (arr[i] > arr[i + 1]) {
                    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                    drawArray(i + 1);
                    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
                    if (isPaused) {
                        await pauseCheck();
                    }
                    swapped = true;
                }
            }

            if (!swapped) break;

            swapped = false;
            end--;

            for (let i = end - 1; i >= start; i--) {
                if (arr[i] > arr[i + 1]) {
                    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                    drawArray(i + 1);
                    await new Promise(resolve => setTimeout(resolve, 1000 / speed));
                    if (isPaused) {
                        await pauseCheck();
                    }
                    swapped = true;
                }
            }

            start++;
        }
    }

    /////////////////
    // Tri sélection
    /////////////////
    async function selectionSortWrapper() {
        await selectionSort(array);
    }

    async function selectionSort(arr) {
        for (let i = 0; i < arr.length - 1; i++) {
            let minIndex = i;

            for (let j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }

            if (minIndex !== i) {
                [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
                drawArray(minIndex);
                await new Promise(resolve => setTimeout(resolve, 1000 / speed));
                if (isPaused) {
                    await pauseCheck();
                }
            }
        }
    }

    /////////////////
    // SmoothSort
    /////////////////
    async function smoothSortWrapper() {
        await smoothSort(array);
    }

    async function smoothSort(arr) {
        const leonardoNumbers = [1, 1];
        while (leonardoNumbers[leonardoNumbers.length - 1] < arr.length) {
            leonardoNumbers.push(leonardoNumbers[leonardoNumbers.length - 2] + leonardoNumbers[leonardoNumbers.length - 1] + 1);
        }

        async function sift(arr, root, size) {
            while (size > 1) {
                let maxChild = root + size - 1;
                let left = maxChild - 1;
                let right = left - size + 2;

                if (arr[maxChild] < arr[left]) maxChild = left;
                if (right >= 0 && arr[maxChild] < arr[right]) maxChild = right;

                if (arr[root] >= arr[maxChild]) break;

                [arr[root], arr[maxChild]] = [arr[maxChild], arr[root]];
                root = maxChild;
                size = Math.log2(size + 1) | 0;
            }
        }

        async function makeHeap(arr) {
            let trees = [];
            for (let i = 0; i < arr.length; i++) {
                if (trees.length >= 2 && trees[trees.length - 2] === trees[trees.length - 1] + 1) {
                    trees[trees.length - 2] += 1;
                    trees.pop();
                    await sift(arr, i - trees[trees.length - 1], trees[trees.length - 1]);
                } else if (trees.length >= 1 && trees[trees.length - 1] === 1) {
                    trees[trees.length - 1] += 1;
                } else {
                    trees.push(1);
                }
                drawArray(i);
                await new Promise(resolve => setTimeout(resolve, 1000 / speed));
                if (isPaused) await pauseCheck();
            }
            return trees;
        }

        let trees = await makeHeap(arr);

        for (let i = arr.length - 1; i >= 0; i--) {
            if (trees[trees.length - 1] === 1) {
                trees.pop();
            } else {
                let size = trees.pop();
                let root = i - size + 1;
                trees.push(size - 1);
                trees.push(size - 2);
                await sift(arr, root, size);
            }
            drawArray(i);
            await new Promise(resolve => setTimeout(resolve, 1000 / speed));
            if (isPaused) await pauseCheck();
        }
    }

    async function pauseCheck() {
        return new Promise(resolve => {
            const checkPause = setInterval(() => {
                if (!isPaused) {
                    clearInterval(checkPause);
                    resolve();
                }
            }, 100);
        });
    }

    generateArray();
    drawArray();
});
