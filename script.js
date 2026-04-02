document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Classic Bit Flip Animation --- */
    const coin = document.querySelector('.classic-bit-coin');
    setInterval(() => {
        if(coin) coin.classList.toggle('flip');
    }, 2000);

    /* --- 3D Bloch Sphere Component (Three.js) --- */
    function makeTextSprite(message, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 64;
        context.font = "Bold 36px 'Outfit', sans-serif";
        context.fillStyle = color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(message, canvas.width/2, canvas.height/2);
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }); // depthTest false to ensure it renders above lines
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.6, 0.3, 1);
        return sprite;
    }

    function createBlochSphere(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(2.5, 1.5, 2.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Core Sphere
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00f0ff, transparent: true, opacity: 0.1, wireframe: true 
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Axes (X, Y, Z)
        const axesHelper = new THREE.AxesHelper(1.2);
        scene.add(axesHelper);

        // Fare ile Etkileşim Desteği
        let controls;
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.1;
            controls.enableZoom = false; // Sayfayı kaydırırken takılmasın
            if (options.autoRotate) {
                controls.autoRotate = true;
                controls.autoRotateSpeed = 2.0;
            }
        }

        // State Vector
        const dir = new THREE.Vector3(0, 1, 0); // Start at |0>
        const origin = new THREE.Vector3(0, 0, 0);
        const arrow = new THREE.ArrowHelper(dir, origin, 1, 0xd946ef, 0.2, 0.1);
        scene.add(arrow);

        // Referans Noktaları (Etiketler)
        const label0 = makeTextSprite("|0⟩", "#00ffff");
        label0.position.set(0, 1.05, 0); // Tam kutba oturtuldu
        scene.add(label0);

        const label1 = makeTextSprite("|1⟩", "#00ffff");
        label1.position.set(0, -1.05, 0);
        scene.add(label1);

        const labelX = makeTextSprite("X", "#ffffff");
        labelX.position.set(1.1, 0, 0);
        spriteMatX = labelX.material; 
        spriteMatX.opacity = 0.5;
        scene.add(labelX);

        const labelZ = makeTextSprite("Z", "#ffffff");
        labelZ.position.set(0, 0, 1.1);
        spriteMatZ = labelZ.material;
        spriteMatZ.opacity = 0.5;
        scene.add(labelZ);

        const context = {
            scene, camera, renderer, arrow, controls,
            theta: options.theta || 0,
            phi: options.phi || 0,
            autoRotate: options.autoRotate || false,
            noise: false,
            updateVector: function(t, p) {
                this.theta = t; this.phi = p;
                // Three.js Y is UP
                const x = Math.sin(t) * Math.cos(p);
                const y = Math.cos(t);
                const z = Math.sin(t) * Math.sin(p);
                this.arrow.setDirection(new THREE.Vector3(x, y, z).normalize());
                this.arrow.setLength(1);
            }
        };

        // Render Loop
        const animate = function () {
            requestAnimationFrame(animate);

            if (context.controls) context.controls.update();

            if (context.noise) {
                // Introducte Decoherence Jitter
                const jT = context.theta + (Math.random() - 0.5) * 0.4;
                const jP = context.phi + (Math.random() - 0.5) * 0.4;
                const x = Math.sin(jT) * Math.cos(jP);
                const y = Math.cos(jT);
                const z = Math.sin(jT) * Math.sin(jP);
                context.arrow.setDirection(new THREE.Vector3(x, y, z).normalize());
                // Shrinking vector represents mixed state (loss of purity)
                context.arrow.setLength(0.7 + Math.random() * 0.3);
            } else if (context.autoRotate && !context.controls) {
                context.phi += 0.02;
                context.updateVector(context.theta, context.phi);
            } else {
                context.updateVector(context.theta, context.phi);
            }

            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        return context;
    }

    // Initialize Spheres
    const sphere1 = createBlochSphere('bloch-sphere-1', { theta: Math.PI / 2, autoRotate: true });
    const sphere2 = createBlochSphere('bloch-sphere-2', { theta: Math.PI / 2, phi: 0 });
    const sphere3 = createBlochSphere('bloch-sphere-3', { theta: Math.PI / 4, phi: Math.PI / 4 });
    const sphereLab = createBlochSphere('bloch-sphere-lab', { theta: 0, phi: 0 });

    /* --- 2. Quantum Algorithm Logic (Maze Generation & Rendering) --- */
    const grid = document.getElementById('search-grid');
    let cells = [];
    const MAZE_W = 25; // Odd number
    const MAZE_H = 25;
    let mazeData = [];
    let startPoint = {x: 1, y: 0};
    let endPoint = {x: 23, y: 24};

    function generateMaze() {
        mazeData = Array(MAZE_H).fill(0).map(() => Array(MAZE_W).fill(1)); // 1 = wall
        function carve(y, x) {
            mazeData[y][x] = 0; // 0 = path
            let dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]].sort(() => Math.random() - 0.5);
            for (let [dy, dx] of dirs) {
                let ny = y + dy * 2, nx = x + dx * 2;
                if (ny > 0 && ny < MAZE_H - 1 && nx > 0 && nx < MAZE_W - 1 && mazeData[ny][nx] === 1) {
                    mazeData[y + dy][x + dx] = 0;
                    carve(ny, nx);
                }
            }
        }
        carve(1, 1);
        mazeData[startPoint.y][startPoint.x] = 0;
        mazeData[endPoint.y][endPoint.x] = 0;
    }

    function renderMaze() {
        if (!grid) return;
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${MAZE_W}, 1fr)`;
        cells = [];
        for (let y = 0; y < MAZE_H; y++) {
            let row = [];
            for (let x = 0; x < MAZE_W; x++) {
                const el = document.createElement('div');
                el.className = 'grid-cell ' + (mazeData[y][x] === 1 ? 'wall' : 'path');
                if (x === startPoint.x && y === startPoint.y) el.classList.add('start');
                if (x === endPoint.x && y === endPoint.y) el.classList.add('end');
                grid.appendChild(el);
                row.push(el);
            }
            cells.push(row);
        }
    }

    if(grid) {
        generateMaze();
        renderMaze();
    }

    let searchIntervalId;
    let waveInterval;
    let isSearching = false;

    function resetMaze(regen = false) {
        clearInterval(searchIntervalId);
        clearTimeout(waveInterval); // clear the collapse timeout
        grid.classList.remove('quantum-collapse');
        
        if (regen) {
            generateMaze();
            renderMaze();
        } else {
            cells.forEach((row, y) => row.forEach((c, x) => {
                c.className = 'grid-cell ' + (mazeData[y][x] === 1 ? 'wall' : 'path');
                c.style.animationDelay = '0s';
                if (x === startPoint.x && y === startPoint.y) c.classList.add('start');
                if (x === endPoint.x && y === endPoint.y) c.classList.add('end');
            }));
        }
        isSearching = false;
    }

    document.getElementById('btn-reset-search')?.addEventListener('click', () => {
        if(!isSearching) resetMaze(true); 
    });

    // Debt First Search for Classical
    function runClassicalDFS() {
        if(isSearching) return;
        resetMaze(false);
        isSearching = true;

        let visited = Array(MAZE_H).fill(0).map(() => Array(MAZE_W).fill(false));
        let pathOrder = []; 
        let correctPath = null;
        
        function dfs(y, x, currentPath) {
            if (y < 0 || y >= MAZE_H || x < 0 || x >= MAZE_W || mazeData[y][x] === 1 || visited[y][x]) return false;
            visited[y][x] = true;
            let newPath = [...currentPath, {y, x}];
            pathOrder.push({y, x, type: 'visit'});
            
            if (x === endPoint.x && y === endPoint.y) {
                correctPath = newPath;
                return true;
            }
            
            // Bias moving down/right for nicer visual flow
            let dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]]; 
            for (let [dy, dx] of dirs) {
                if(dfs(y + dy, x + dx, newPath)) return true;
                if(!correctPath) pathOrder.push({y, x, type: 'backtrack'}); 
            }
            return false;
        }

        dfs(startPoint.y, startPoint.x, []);

        let step = 0;
        searchIntervalId = setInterval(() => {
            if (!isSearching) { clearInterval(searchIntervalId); return; }
            if (step >= pathOrder.length) {
                clearInterval(searchIntervalId);
                if (correctPath) {
                    correctPath.forEach(pt => cells[pt.y][pt.x].classList.add('found'));
                }
                isSearching = false;
                return;
            }
            
            let p = pathOrder[step];
            cells[p.y][p.x].classList.remove('visited');
            cells[p.y][p.x].classList.add('active');
            
            if(step > 0) {
               let prev = pathOrder[step-1];
               if(prev.y !== p.y || prev.x !== p.x) {
                   cells[prev.y][prev.x].classList.replace('active', 'visited');
               }
            }
            step++;
        }, 15);
    }

    // Superposition Wave Expansion & Collapse
    function runQuantumBFS() {
        if(isSearching) return;
        resetMaze(false);
        isSearching = true;

        let visited = Array(MAZE_H).fill(0).map(() => Array(MAZE_W).fill(false));
        let queue = [[startPoint.y, startPoint.x]];
        visited[startPoint.y][startPoint.x] = true;
        let parent = new Map();
        let distance = new Map();
        distance.set(startPoint.y + ',' + startPoint.x, 0);
        
        let pathCells = [];

        // Synchronously run BFS to calculate wave distances instantly
        while(queue.length > 0) {
            let [y, x] = queue.shift();
            let d = distance.get(y + ',' + x);
            pathCells.push({y, x, d});

            let dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            for (let [dy, dx] of dirs) {
                let ny = y + dy, nx = x + dx;
                if (ny >= 0 && ny < MAZE_H && nx >= 0 && nx < MAZE_W && mazeData[ny][nx] === 0 && !visited[ny][nx]) {
                    visited[ny][nx] = true;
                    parent.set(ny + ',' + nx, {y, x});
                    distance.set(ny + ',' + nx, d + 1);
                    queue.push([ny, nx]);
                }
            }
        }

        // Unleash the visual superposition wave across the whole level
        let maxDelay = 0;
        pathCells.forEach(cell => {
            let delay = cell.d * 20; // 20ms delay per cell distance simulates liquid flow
            if(delay > maxDelay) maxDelay = delay;
            
            cells[cell.y][cell.x].style.animationDelay = delay + 'ms';
            cells[cell.y][cell.x].classList.add('superposition');
        });

        // Wavefunction collapse when the wave hits the end + tiny grace period
        let collapseTimer = setTimeout(() => {
            if(!isSearching) return;
            
            // "Superposition Collapse" Flash effect!
            grid.classList.add('quantum-collapse');
            
            setTimeout(() => {
                if(!isSearching) return;
                grid.classList.remove('quantum-collapse');
                
                // Clear the superposition classes
                cells.forEach(row => row.forEach(c => {
                    c.classList.remove('superposition');
                    c.style.animationDelay = '0s';
                }));
                
                // Draw the found route
                let curr = {y: endPoint.y, x: endPoint.x};
                while(curr) {
                    cells[curr.y][curr.x].classList.add('found');
                    let nextStr = parent.get(curr.y + ',' + curr.x);
                    curr = nextStr; 
                }
                isSearching = false;
            }, 300); // wait for 0.3s flash animation to cover
        }, maxDelay + 600); 

        // Store timeout ID to allow clearing on reset
        waveInterval = collapseTimer; 
    }

    document.getElementById('btn-classic-search')?.addEventListener('click', runClassicalDFS);
    document.getElementById('btn-quantum-search')?.addEventListener('click', runQuantumBFS);


    /* --- 3. Math Role (Vector Controls) --- */
    const sliderTheta = document.getElementById('slider-theta');
    const sliderPhi = document.getElementById('slider-phi');
    let gateAnimationInt = null;
    
    function applyGate(gate) {
        clearInterval(gateAnimationInt);
        let currentT = parseFloat(sliderTheta.value);
        let currentP = parseFloat(sliderPhi.value);
        let targetT = currentT;
        let targetP = currentP;
        
        switch(gate) {
            case 'X': // NOT Gate: Flips Theta across Equator
                targetT = 180 - currentT; 
                break;
            case 'H': // Hadamard: Moves to Equator / Superposition
                targetT = 90; targetP = 0; 
                break;
            case 'Z': // Phase Gate: Rotates Phi by 180 degrees
                targetP = (currentP + 180) % 360; 
                break;
        }
        
        let frames = 30; // 30 frames for half second approx
        let stepT = (targetT - currentT) / frames;
        let stepP = (targetP - currentP) / frames;
        let frameCount = 0;
        
        gateAnimationInt = setInterval(() => {
            frameCount++;
            sliderTheta.value = currentT + stepT * frameCount;
            sliderPhi.value = currentP + stepP * frameCount;
            updateMath();
            
            if (frameCount >= frames) {
                clearInterval(gateAnimationInt);
                sliderTheta.value = targetT;
                sliderPhi.value = targetP;
                updateMath();
            }
        }, 16);
    }
    
    document.getElementById('btn-gate-x')?.addEventListener('click', () => applyGate('X'));
    document.getElementById('btn-gate-h')?.addEventListener('click', () => applyGate('H'));
    document.getElementById('btn-gate-z')?.addEventListener('click', () => applyGate('Z'));

    function updateMath() {
        if(!sphere2 || !sliderTheta || !sliderPhi) return;

        const tDeg = parseFloat(sliderTheta.value);
        const pDeg = parseFloat(sliderPhi.value);

        document.getElementById('val-theta').innerText = tDeg;
        document.getElementById('val-phi').innerText = pDeg;

        const tRad = tDeg * Math.PI / 180;
        const pRad = pDeg * Math.PI / 180;
        
        sphere2.updateVector(tRad, pRad);

        // Probability Math: P(0) = cos^2(theta/2), P(1) = sin^2(theta/2)
        const pZero = Math.pow(Math.cos(tRad / 2), 2) * 100;
        const pOne = Math.pow(Math.sin(tRad / 2), 2) * 100;

        document.getElementById('prob-zero').style.width = pZero + '%';
        document.getElementById('text-zero').innerText = pZero.toFixed(1) + '%';
        
        document.getElementById('prob-one').style.width = pOne + '%';
        document.getElementById('text-one').innerText = pOne.toFixed(1) + '%';
    }

    sliderTheta?.addEventListener('input', updateMath);
    sliderPhi?.addEventListener('input', updateMath);
    // Initial call
    updateMath();

    /* --- 4. Simulation vs Hardware (Noise) --- */
    const btnNoise = document.getElementById('btn-noise-toggle');
    const noiseStatus = document.getElementById('noise-status');

    btnNoise?.addEventListener('click', () => {
        if(!sphere3) return;
        sphere3.noise = !sphere3.noise;

        if (sphere3.noise) {
            btnNoise.classList.replace('btn-warning', 'btn-danger');
            btnNoise.innerHTML = '<i class="fas fa-radiation"></i> Gürültüyü Kapat';
            noiseStatus.innerHTML = 'Donanım Durumu: <span class="status-error">Decoherence (Veri Kaybı ve Hata)</span>';
        } else {
            btnNoise.classList.replace('btn-danger', 'btn-warning');
            btnNoise.innerHTML = '<i class="fas fa-bolt"></i> Gürültüyü Aç';
            noiseStatus.innerHTML = 'Donanım Durumu: <span class="status-ideal">İdeal Ortam (Simülasyon Kusursuzluğu)</span>';
        }
    });

    // --- 6. Interactive Lab Logic ---
    function toggleBtn(id) {
        const btn = document.getElementById(id);
        if(!btn) return 0;
        let val = btn.innerText === '0' ? 1 : 0;
        btn.innerText = val;
        if(val === 1) { btn.classList.replace('btn-secondary', 'btn-primary'); }
        else { btn.classList.replace('btn-primary', 'btn-secondary'); }
        return val;
    }
    
    document.getElementById('not-in')?.addEventListener('click', () => {
        let v = toggleBtn('not-in');
        const bulb = document.getElementById('not-out');
        if(v === 0) { bulb.className = 'bulb bright'; }
        else { bulb.className = 'bulb dark'; }
    });
    // Init NOT gate defaults
    setTimeout(() => { 
        let notOut = document.getElementById('not-out');
        if(notOut) notOut.className = 'bulb bright'; 
    }, 100);

    const and1 = document.getElementById('and-in-1'), and2 = document.getElementById('and-in-2'), andOut = document.getElementById('and-out');
    function updateAnd() { if(and1 && and2 && andOut) andOut.className = (and1.innerText==='1' && and2.innerText==='1') ? 'bulb bright' : 'bulb dark'; }
    and1?.addEventListener('click', () => { toggleBtn('and-in-1'); updateAnd(); });
    and2?.addEventListener('click', () => { toggleBtn('and-in-2'); updateAnd(); });

    const or1 = document.getElementById('or-in-1'), or2 = document.getElementById('or-in-2'), orOut = document.getElementById('or-out');
    function updateOr() { if(or1 && or2 && orOut) orOut.className = (or1.innerText==='1' || or2.innerText==='1') ? 'bulb bright' : 'bulb dark'; }
    or1?.addEventListener('click', () => { toggleBtn('or-in-1'); updateOr(); });
    or2?.addEventListener('click', () => { toggleBtn('or-in-2'); updateOr(); });

    // Quantum Operator Logic (Lab)
    let qVec = {x: 0, y: 0, z: 1}; // Starts at North Pole |0>
    const arrow2D = document.getElementById('vector-arrow');
    const resultText = document.getElementById('lab-result-text');
    const matrixTitle = document.getElementById('matrix-title');
    const matrixVal = document.getElementById('matrix-val');
    let labControlBit = 0;
    let labMeasuring = false;

    // Toggle Control Bit
    document.getElementById('lab-control-btn')?.addEventListener('click', (e) => {
        labControlBit = labControlBit === 0 ? 1 : 0;
        e.target.innerText = `Kntrl: ${labControlBit}`;
        if(labControlBit) { e.target.classList.replace('btn-secondary', 'btn-primary'); }
        else { e.target.classList.replace('btn-primary', 'btn-secondary'); }
    });

    const matrices = {
        'X': { title: "Pauli-X (NOT)", val: "[ 0 &nbsp; 1 ]<br>[ 1 &nbsp; 0 ]" },
        'Y': { title: "Pauli-Y", val: "[ 0 -i ]<br>[ i &nbsp; 0 ]" },
        'Z': { title: "Pauli-Z", val: "[ 1 &nbsp; 0 ]<br>[ 0 -1 ]" },
        'H': { title: "Hadamard", val: "[ 1/√2 &nbsp; 1/√2 ]<br>[ 1/√2 -1/√2 ]" },
        'CNOT': { title: "CNOT (Control-NOT)", val: "[ 1 0 0 0 ]<br>[ 0 1 0 0 ]<br>[ 0 0 0 1 ]<br>[ 0 0 1 0 ]" }
    };

    function applyLabGate(gate) {
        if(labMeasuring || !sphereLab) return;
        
        matrixTitle.innerHTML = matrices[gate].title;
        matrixVal.innerHTML = matrices[gate].val;

        let targetVec = { x: qVec.x, y: qVec.y, z: qVec.z };
        let msg = "";

        if(gate === 'CNOT') {
            if(labControlBit === 0) {
                msg = "Kontrol biti 0: Hedef Qubit hiçbir şey yapmadı.";
            } else {
                gate = 'X'; // Apply X to target because control is 1
                msg = "Kontrol 1: CNOT hedefe X Kapısı (Takla) uygular!";
                matrixTitle.innerHTML += " (Kontrollü)";
            }
        }

        if(gate === 'X') {
            targetVec.y *= -1; 
            targetVec.z *= -1;
            if(!msg) msg = "X Kapısı: Vektör X ekseni etrafında 180° döndü.";
        } else if(gate === 'Y') {
            targetVec.x *= -1; 
            targetVec.z *= -1;
            if(!msg) msg = "Y Kapısı: Vektör Y ekseni etrafında 180° döndü.";
        } else if(gate === 'Z') {
            targetVec.x *= -1; 
            targetVec.y *= -1;
            if(!msg) msg = "Z Kapısı: Faz değiştirildi (Z ekseninde 180°).";
        } else if(gate === 'H') {
            let tempX = targetVec.x;
            targetVec.x = targetVec.z;
            targetVec.z = tempX;
            targetVec.y *= -1;
            if(!msg) msg = "H Kapısı: Vektör Süperpozisyona (%50 olasılık) yatırıldı.";
        }
        
        resultText.innerHTML = msg;
        
        // Spherical Geodesic Interpolation
        let frames = 30; // Smooth 30 frames
        let frame = 0;
        let startX = qVec.x, startY = qVec.y, startZ = qVec.z;

        let intID = setInterval(() => {
            frame++;
            let t = frame / frames;
            // Linear interpolate and re-normalize to stay exactly on the sphere surface!
            let ix = startX * (1 - t) + targetVec.x * t;
            let iy = startY * (1 - t) + targetVec.y * t;
            let iz = startZ * (1 - t) + targetVec.z * t;
            let mag = Math.sqrt(ix*ix + iy*iy + iz*iz) || 0.001; 
            ix/=mag; iy/=mag; iz/=mag;

            let cTheta = Math.acos(iz);
            let cPhi = Math.atan2(iy, ix);
            
            sphereLab.updateVector(cTheta, cPhi);
            
            let sign2D = (ix < -0.05) ? -1 : 1; 
            if(arrow2D) arrow2D.style.transform = `rotate(${cTheta * sign2D * 180/Math.PI}deg)`;
            
            if(frame >= frames) {
                clearInterval(intID);
                qVec = targetVec;
            }
        }, 16);
    }

    document.getElementById('lab-btn-x')?.addEventListener('click', () => applyLabGate('X'));
    document.getElementById('lab-btn-y')?.addEventListener('click', () => applyLabGate('Y'));
    document.getElementById('lab-btn-z')?.addEventListener('click', () => applyLabGate('Z'));
    document.getElementById('lab-btn-h')?.addEventListener('click', () => applyLabGate('H'));
    document.getElementById('lab-btn-cnot')?.addEventListener('click', () => applyLabGate('CNOT'));

    document.getElementById('lab-btn-measure')?.addEventListener('click', () => {
        if(labMeasuring || !sphereLab) return;
        labMeasuring = true;
        resultText.innerHTML = "Ölçüm yapılıyor... Dalga fonksiyonu çöküyor!";
        
        // Probability of |0> is simply z-axis projection
        let pZero = (1 + qVec.z) / 2;
        
        let spinFrames = 50;
        let f = 0;
        
        // Visual roulette scramble over sphere surface!
        let spinInt = setInterval(() => {
            f++;
            let randT = Math.acos((Math.random() * 2) - 1);
            let randP = Math.random() * Math.PI * 2;
            sphereLab.updateVector(randT, randP);
            
            if(arrow2D) arrow2D.style.transform = `rotate(${randT * 180/Math.PI}deg)`;
            
            if(f >= spinFrames) {
                clearInterval(spinInt);
                // The dramatic Collapse
                let isZero = Math.random() < pZero;
                qVec = isZero ? {x:0, y:0, z:1} : {x:0, y:0, z:-1};
                
                let fT = isZero ? 0 : Math.PI;
                sphereLab.updateVector(fT, 0);
                if(arrow2D) arrow2D.style.transform = `rotate(${fT * 180/Math.PI}deg)`;
                
                resultText.innerHTML = `Ölçüm Sonucu: <strong>|${isZero ? '0' : '1'}⟩</strong> (İhtimal %100 kesinleşti)`;
                labMeasuring = false;
            }
        }, 30);
    });

    // --- 7. Dirac Math Blackboard ---
    const blackboard = document.getElementById('blackboard');
    let mathTimeout = null;

    const mathSteps = {
        'H0': [
            "İşlem: H Operatörünün |0⟩ vektörüne etkisi",
            "         [ 1  1 ]   [ 1 ]\n=   1/√2 [      ] * [   ]\n         [ 1 -1 ]   [ 0 ]",
            "         [ (1*1) + (1*0)  ]\n=   1/√2 [                ]\n         [ (1*1) + (-1*0) ]",
            "         [ 1 ]\n=   1/√2 [   ]\n         [ 1 ]",
            "=>  |+⟩  (Süperpozisyon Durumu)"
        ],
        'H1': [
            "İşlem: H Operatörünün |1⟩ vektörüne etkisi",
            "         [ 1  1 ]   [ 0 ]\n=   1/√2 [      ] * [   ]\n         [ 1 -1 ]   [ 1 ]",
            "         [ (1*0) + (1*1)  ]\n=   1/√2 [                ]\n         [ (1*0) + (-1*1) ]",
            "         [  1 ]\n=   1/√2 [    ]\n         [ -1 ]",
            "=>  |-⟩  (Negatif Fazlı Süperpozisyon)"
        ],
        'X0': [
            "İşlem: Pauli-X (NOT) Operatörünün |0⟩ vektörüne etkisi",
            "  [ 0  1 ]   [ 1 ]\n= [      ] * [   ]\n  [ 1  0 ]   [ 0 ]",
            "  [ (0*1) + (1*0) ]\n= [               ]\n  [ (1*1) + (0*0) ]",
            "  [ 0 ]\n= [   ]\n  [ 1 ]",
            "=>  |1⟩  (Klasik 1 Durumu)"
        ],
        'X1': [
            "İşlem: Pauli-X (NOT) Operatörünün |1⟩ vektörüne etkisi",
            "  [ 0  1 ]   [ 0 ]\n= [      ] * [   ]\n  [ 1  0 ]   [ 1 ]",
            "  [ (0*0) + (1*1) ]\n= [               ]\n  [ (1*0) + (0*1) ]",
            "  [ 1 ]\n= [   ]\n  [ 0 ]",
            "=>  |0⟩  (Klasik 0 Durumu)"
        ],
        'Hp': [
            "İşlem: H Operatörünün |+⟩ (Süperpozisyon) vektörüne etkisi",
            "         [ 1  1 ]        [ 1 ]\n=   1/√2 [      ] * 1/√2 [   ]\n         [ 1 -1 ]        [ 1 ]",
            "         [ 1  1 ]   [ 1 ]\n=   1/2  [      ] * [   ]\n         [ 1 -1 ]   [ 1 ]",
            "         [ (1*1) + (1*1)  ]\n=   1/2  [                ]\n         [ (1*1) + (-1*1) ]",
            "         [ 2 ]     [ 1 ]\n=   1/2  [   ]  =  [   ]\n         [ 0 ]     [ 0 ]",
            "=>  |0⟩  (Süperpozisyondan geri çıkış!)"
        ],
        'Y0': [
            "İşlem: Pauli-Y Operatörünün |0⟩ vektörüne etkisi",
            "  [ 0 -i ]   [ 1 ]\n= [      ] * [   ]\n  [ i  0 ]   [ 0 ]",
            "  [ (0*1) + (-i*0) ]\n= [                ]\n  [ (i*1)  + (0*0) ]",
            "  [ 0 ]\n= [   ]\n  [ i ]",
            "=>  i|1⟩  (İmajiner Fazlı 1 Durumu)"
        ],
        'Zp': [
            "İşlem: Pauli-Z Operatörünün |+⟩ (Süperpozisyon) vektörüne etkisi",
            "  [ 1  0 ]        [ 1 ]\n= [      ] * 1/√2 [   ]\n  [ 0 -1 ]        [ 1 ]",
            "         [ (1*1) + (0*1) ]\n=   1/√2 [               ]\n         [ (0*1) + (-1*1)]",
            "         [  1 ]\n=   1/√2 [    ]\n         [ -1 ]",
            "=>  |-⟩  (Z ekseninde 180° Faz Çevirimi)"
        ],
        'C10': [
            "İşlem: CNOT (Kontrollü-NOT) Kapısının |10⟩ durumuna etkisi",
            "  [ 1 0 0 0 ]   [ 0 ] |00⟩\n  [ 0 1 0 0 ]   [ 0 ] |01⟩\n= [         ] * [   ]\n  [ 0 0 0 1 ]   [ 1 ] |10⟩\n  [ 0 0 1 0 ]   [ 0 ] |11⟩",
            "  [ (1*0) + (0*0) + (0*1) + (0*0) ]\n  [ (0*0) + (1*0) + (0*1) + (0*0) ]\n= [                               ]\n  [ (0*0) + (0*0) + (0*1) + (1*0) ]\n  [ (0*0) + (0*0) + (1*1) + (0*0) ]",
            "  [ 0 ]\n  [ 0 ]\n= [   ]\n  [ 0 ]\n  [ 1 ]",
            "=>  |11⟩  (Kontrol Kubiti '1' olduğu için Hedef Kubit takla attı!)"
        ]
    };

    window.playMath = function(eq) {
        if(!blackboard) return;
        blackboard.innerHTML = '';
        clearTimeout(mathTimeout);
        blackboard.style.justifyContent = 'flex-start';
        
        let steps = mathSteps[eq];
        if(!steps) return;

        let index = 0;
        
        function nextStep() {
            if(index >= steps.length) return;
            
            let div = document.createElement('div');
            div.className = 'mb-4';
            div.style.whiteSpace = 'pre';
            div.style.padding = '10px';
            div.innerText = steps[index];
            
            // Fix Color Issue: Clean fade-in without background coloring
            div.style.opacity = '0';
            div.animate([
                { opacity: 0, transform: 'translateY(10px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], { duration: 600, fill: 'forwards', easing: 'ease-out' });
            
            if(index === steps.length - 1) {
                div.style.color = 'var(--accent)';
                div.style.fontWeight = 'bold';
            }
            
            blackboard.appendChild(div);
            blackboard.scrollTop = blackboard.scrollHeight;
            
            index++;
            mathTimeout = setTimeout(nextStep, 1500); // Wait 1.5 seconds per step
        }
        
        // Start first step immediately
        nextStep();
    };

    // --- 8. Cartesian vs Tensor Space Visualizer (Three.js WebGL) ---
    let bitCount = 1;
    const classicSpace = document.getElementById('classic-space-container');
    const bitDisplay = document.getElementById('bit-count');
    const bitVolDisplay = document.getElementById('bit-count-vol');

    window.addBit = function() {
        if(bitCount >= 16) return;
        bitCount++;
        bitDisplay.innerText = bitCount;
        bitVolDisplay.innerText = bitCount;
        let box = document.createElement('div');
        box.className = 'classic-box';
        box.innerText = bitCount;
        classicSpace.appendChild(box);
    }
    window.resetBit = function() {
        bitCount = 1;
        bitDisplay.innerText = bitCount;
        bitVolDisplay.innerText = bitCount;
        classicSpace.innerHTML = '<div class="classic-box">1</div>';
    }

    let qubitCount = 1;
    const qubitDisplay = document.getElementById('qubit-count');
    const stateDisplay = document.getElementById('qubit-state-count');
    const MAX_QUBITS = 6; // up to 64 nodes (Hardware accelerated WebGL handles it perfectly!)
    
    const hyperCanvas = document.getElementById('hypercube-canvas');
    let hvScene, hvCamera, hvRenderer, hvGroup;
    let hvSphere;

    if (hyperCanvas) {
        hvScene = new THREE.Scene();
        hvCamera = new THREE.PerspectiveCamera(45, hyperCanvas.clientWidth / hyperCanvas.clientHeight, 0.1, 1000);
        hvCamera.position.z = 20;

        hvRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        hvRenderer.setSize(hyperCanvas.clientWidth, hyperCanvas.clientHeight);
        hyperCanvas.appendChild(hvRenderer.domElement);

        hvGroup = new THREE.Group();
        hvScene.add(hvGroup);

        // Bloch Sphere Container for aesthetics
        const sphereGeo = new THREE.SphereGeometry(6, 24, 24);
        const sphereMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });
        hvSphere = new THREE.Mesh(sphereGeo, sphereMat);
        hvScene.add(hvSphere);

        // Hiperküp için Referans Noktaları (Ölçeği Büyütülmüş)
        const hl0 = makeTextSprite("|0⟩", "#00ffff");
        hl0.position.set(0, 6.2, 0); hl0.scale.set(2.5, 1.25, 1);
        hvScene.add(hl0);

        const hl1 = makeTextSprite("|1⟩", "#00ffff");
        hl1.position.set(0, -6.2, 0); hl1.scale.set(2.5, 1.25, 1);
        hvScene.add(hl1);

        const hlX = makeTextSprite("X", "#ffffff");
        hlX.position.set(6.2, 0, 0); hlX.scale.set(2.5, 1.25, 1);
        hlX.material.opacity = 0.5;
        hvScene.add(hlX);

        const hlZ = makeTextSprite("Z", "#ffffff");
        hlZ.position.set(0, 0, 6.2); hlZ.scale.set(2.5, 1.25, 1);
        hlZ.material.opacity = 0.5;
        hvScene.add(hlZ);

        // Fare ile Etkileşim Desteği: OrbitControls
        let hvControls;
        if (typeof THREE.OrbitControls !== 'undefined') {
            hvControls = new THREE.OrbitControls(hvCamera, hvRenderer.domElement);
            hvControls.enableDamping = true;
            hvControls.dampingFactor = 0.05;
            hvControls.enableZoom = false; // Mouse tekerleği kilitlenmesin
            hvControls.autoRotate = true; // Kendi kendine sinsice dönsün
            hvControls.autoRotateSpeed = 1.0;
        }

        window.addEventListener('resize', () => {
            if(hyperCanvas && hyperCanvas.clientWidth > 0) {
                hvCamera.aspect = hyperCanvas.clientWidth / hyperCanvas.clientHeight;
                hvCamera.updateProjectionMatrix();
                hvRenderer.setSize(hyperCanvas.clientWidth, hyperCanvas.clientHeight);
            }
        });

        function animateHV() {
            requestAnimationFrame(animateHV);
            
            if (hvControls) {
                hvControls.update();
            } else if (hvGroup) {
                // Eğer internet kesik olur Orbit inmezse klasik takla
                hvGroup.rotation.y += 0.005;
            }

            if(hvGroup) {
                hvGroup.rotation.x += 0.002;
            }
            if(hvSphere) {
                hvSphere.rotation.z += 0.002;
            }
            hvRenderer.render(hvScene, hvCamera);
        }
        animateHV();
    }

    // High dimensional geometric projection vectors
    const h3DBases = [
        new THREE.Vector3(2.5, 0, 0),         // Dim 0
        new THREE.Vector3(0, 2.5, 0),         // Dim 1
        new THREE.Vector3(0, 0, 2.5),         // Dim 2
        new THREE.Vector3(1.5, 1.5, -1.5),    // Dim 3 (Tesseract projection)
        new THREE.Vector3(-1.5, 1.5, 1.5),    // Dim 4
        new THREE.Vector3(1, -1.5, 1.5)       // Dim 5
    ];

    const hvNodeMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const hvNodeGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const hvLineMat = new THREE.LineBasicMaterial({ color: 0xe91e63, transparent: true, opacity: 0.6 });

    window.renderHypercube = function() {
        if(!hvGroup) return;
        
        while(hvGroup.children.length > 0){ 
            hvGroup.remove(hvGroup.children[0]); 
        }

        let states = 1 << qubitCount; 
        if(qubitDisplay) qubitDisplay.innerText = qubitCount;
        if(stateDisplay) stateDisplay.innerText = states;

        let pts = [];
        let scale = qubitCount >= 3 ? Math.max(0.4, 1.0 - (qubitCount - 2)*0.15) : 1.0;

        // Create Nodes
        for(let i=0; i<states; i++) {
            let vec = new THREE.Vector3(0,0,0);
            for(let d=0; d<qubitCount; d++) {
                let bit = (i & (1 << d)) ? 1 : -1;
                vec.addScaledVector(h3DBases[d], bit);
            }
            vec.multiplyScalar(scale);
            pts.push(vec);

            let mesh = new THREE.Mesh(hvNodeGeo, hvNodeMat.clone());
            mesh.position.copy(vec);
            hvGroup.add(mesh);
        }

        // Draw Links
        for(let i=0; i<states; i++) {
            for(let d=0; d<qubitCount; d++) {
                if((i & (1 << d)) === 0) { 
                    let target = i | (1 << d);
                    let geometry = new THREE.BufferGeometry().setFromPoints([pts[i], pts[target]]);
                    let line = new THREE.Line(geometry, hvLineMat.clone());
                    hvGroup.add(line);
                }
            }
        }
    }

    if(hvGroup) window.renderHypercube();

    window.addQubit = function() {
        if(qubitCount >= MAX_QUBITS) return;
        qubitCount++;
        window.renderHypercube();
    }
    
    window.resetQubit = function() {
        qubitCount = 1;
        window.renderHypercube();
    }

    let isHVAnimating = false;
    window.animateTensorOperator = function() {
        if(!hvGroup || isHVAnimating) return;
        isHVAnimating = true;
        
        let frames = 60;
        let f = 0;
        let originalScale = hvGroup.scale.x;
        
        // Flash simulation to brilliant Cyan/White to signify quantum gate
        hvGroup.children.forEach(c => {
            if(c.type === "Mesh") c.material.color.setHex(0x00ffff);
            if(c.type === "Line") { c.material.color.setHex(0xffffff); c.material.opacity = 1.0; }
        });

        let intX = setInterval(() => {
            f++;
            // Violent spin applied to entire hypercube group
            hvGroup.rotation.y += 0.2; 
            hvGroup.rotation.x += 0.15;

            // Heartbeat scale effect
            if (f < 15) {
                hvGroup.scale.setScalar(originalScale + (f/15)*0.5);
            } else if (f > 45) {
                let desc = (60 - f) / 15;
                hvGroup.scale.setScalar(originalScale + desc*0.5);
            }

            if(f >= frames) {
                clearInterval(intX);
                hvGroup.scale.setScalar(originalScale);
                hvGroup.children.forEach(c => {
                    if(c.type === "Mesh") c.material.color.setHex(0xff00ff);
                    if(c.type === "Line") { c.material.color.setHex(0xe91e63); c.material.opacity = 0.6; }
                });
                isHVAnimating = false;
            }
        }, 16);
    }

    // --- 9. Python IDE Logic ---
    const pythonEditor = document.getElementById('python-editor');
    const pyThetaSpan = document.getElementById('py-math-theta');
    const pyTheta2Span = document.getElementById('py-math-theta2');
    const pyPhiSpan = document.getElementById('py-math-phi');
    const pyErrorBox = document.getElementById('py-error-box');

    // Create the dedicated Sphere
    const spherePython = createBlochSphere('bloch-sphere-python', { theta: 1.57, phi: 0.78 });

    let pyAnimInterval = null;
    const pySliderTheta = document.getElementById('py-slider-theta');
    const pySliderPhi = document.getElementById('py-slider-phi');
    const pyValThetaText = document.getElementById('py-val-theta');
    const pyValPhiText = document.getElementById('py-val-phi');

    function syncSlidersToCode() {
        if(!pythonEditor || !pySliderTheta || !pySliderPhi) return;
        let tVal = parseFloat(pySliderTheta.value).toFixed(2);
        let pVal = parseFloat(pySliderPhi.value).toFixed(2);
        
        if(pyValThetaText) pyValThetaText.innerText = tVal;
        if(pyValPhiText) pyValPhiText.innerText = pVal;

        let code = pythonEditor.value;
        code = code.replace(/theta\s*[-=:]\s*[0-9.]+/, `theta = ${tVal}`);
        code = code.replace(/phi\s*[-=:]\s*[0-9.]+/, `phi = ${pVal}`);
        pythonEditor.value = code;

        // Anında güncelle (Animasyonsuz, akışkan slider hissi)
        window.runPythonCode(false);
    }

    pySliderTheta?.addEventListener('input', syncSlidersToCode);
    pySliderPhi?.addEventListener('input', syncSlidersToCode);

    // Koda manuel müdahale edildiğinde canlı senkronizasyon:
    pythonEditor?.addEventListener('input', () => { window.runPythonCode(false); });

    window.runPythonCode = function(animate = true) {
        if(!pythonEditor || !spherePython) return;
        const code = pythonEditor.value;
        try {
            const thetaMatch = code.match(/theta\s*[-=:]\s*([0-9.]+)/);
            const phiMatch = code.match(/phi\s*[-=:]\s*([0-9.]+)/);

            if(thetaMatch && phiMatch) {
                const thetaVal = parseFloat(thetaMatch[1]);
                const phiVal = parseFloat(phiMatch[1]);

                pyThetaSpan.innerText = thetaVal.toFixed(2);
                pyTheta2Span.innerText = thetaVal.toFixed(2);
                pyPhiSpan.innerText = phiVal.toFixed(2);

                if(pySliderTheta) pySliderTheta.value = thetaVal;
                if(pySliderPhi) pySliderPhi.value = phiVal;
                if(pyValThetaText) pyValThetaText.innerText = thetaVal.toFixed(2);
                if(pyValPhiText) pyValPhiText.innerText = phiVal.toFixed(2);

                clearInterval(pyAnimInterval);

                if (!animate) {
                    spherePython.updateVector(thetaVal, phiVal);
                } else {
                    let startT = spherePython.theta;
                    let startP = spherePython.phi;
                    let frames = 45; 
                    let f = 0;
                    
                    pyAnimInterval = setInterval(() => {
                        f++;
                        let t = f / frames;
                        let eT = t * (2 - t); 
                        spherePython.updateVector(startT * (1-eT) + thetaVal * eT, startP * (1-eT) + phiVal * eT);
                        if(f >= frames) clearInterval(pyAnimInterval);
                    }, 16);
                }

                pyErrorBox.style.display = 'none';
                if(animate) {
                    pythonEditor.style.borderColor = 'var(--success)';
                    setTimeout(() => pythonEditor.style.borderColor = 'rgba(255,255,255,0.1)', 1000);
                }
            } else {
                throw new Error("Değer bulunamadı");
            }
        } catch(e) {
            pyErrorBox.style.display = 'block';
            pythonEditor.style.borderColor = 'var(--danger)';
        }
    }

    window.applyPythonHadamard = function() {
        if(!pythonEditor) return;
        let code = pythonEditor.value;
        const thetaMatch = code.match(/theta\s*[-=:]\s*([0-9.]+)/);
        const phiMatch = code.match(/phi\s*[-=:]\s*([0-9.]+)/);
        if(thetaMatch && phiMatch) {
            let t = parseFloat(thetaMatch[1]);
            let p = parseFloat(phiMatch[1]);
            
            // Hadamard Matris Dönüşümü (Fiziksel Bloch Vektörü Yansıtması X<->Z ve Y->-Y)
            let bx = Math.sin(t) * Math.cos(p);
            let by = Math.sin(t) * Math.sin(p);
            let bz = Math.cos(t);
            
            // Yeni eksenler (Hadamard Yansıtması)
            let bx_new = bz;
            let by_new = -by;
            let bz_new = bx;
            
            // Yeni açıları bulma
            let t_new = Math.acos(bz_new);
            let p_new = Math.atan2(by_new, bx_new);
            if (p_new < 0) p_new += 2 * Math.PI;
            
            // Hata toleransı düzeltmeleri
            if (isNaN(t_new)) t_new = 0;
            if (isNaN(p_new)) p_new = 0;

            code = code.replace(/theta\s*[-=:]\s*[0-9.]+/, `theta = ${t_new.toFixed(2)}`);
            code = code.replace(/phi\s*[-=:]\s*[0-9.]+/, `phi = ${p_new.toFixed(2)}`);
            pythonEditor.value = code;
            window.runPythonCode(true); // Çubukları da tetikle
        }
    }

});
