class PuzzleGame {
            constructor() {
                this.gridSize = 4;
                this.tiles = [];
                this.correctOrder = [];
                this.moves = 0;
                this.startTime = null;
                this.timerInterval = null;
                this.currentImage = 'https://picsum.photos/400/400?random=1';
                this.draggedTile = null;
                this.dropTarget = null;
                
                this.initializeGame();
                this.bindEvents();
            }

            initializeGame() {
                this.createPuzzle();
                this.shuffle();
                this.updateMoveCounter();
                this.startTimer();
            }

            createPuzzle() {
                const grid = document.getElementById('puzzleGrid');
                grid.innerHTML = '';
                grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
                
                this.tiles = [];
                this.correctOrder = [];
                
                for (let i = 0; i < this.gridSize * this.gridSize; i++) {
                    const tile = document.createElement('div');
                    tile.className = 'puzzle-tile';
                    tile.draggable = true;
                    tile.dataset.position = i;
                    tile.dataset.correctPosition = i;
                    
                    const row = Math.floor(i / this.gridSize);
                    const col = i % this.gridSize;
                    
                    tile.style.backgroundImage = `url(${this.currentImage})`;
                    tile.style.backgroundPosition = `-${col * (400 / this.gridSize)}px -${row * (400 / this.gridSize)}px`;
                    
                    const tileNumber = document.createElement('div');
                    tileNumber.className = 'tile-number';
                    tileNumber.textContent = i + 1;
                    //tile.appendChild(tileNumber);
                    
                    this.bindTileEvents(tile);
                    
                    grid.appendChild(tile);
                    this.tiles.push(tile);
                    this.correctOrder.push(i);
                }
            }

            bindTileEvents(tile) {
                tile.addEventListener('dragstart', (e) => {
                    this.draggedTile = tile;
                    tile.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });

                tile.addEventListener('dragend', (e) => {
                    tile.classList.remove('dragging');
                    this.clearDropTargets();
                    this.draggedTile = null;
                });

                tile.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    
                    if (tile !== this.draggedTile) {
                        tile.classList.add('drop-target');
                        this.dropTarget = tile;
                    }
                });

                tile.addEventListener('dragleave', (e) => {
                    tile.classList.remove('drop-target');
                });

                tile.addEventListener('drop', (e) => {
                    e.preventDefault();
                    
                    if (this.draggedTile && tile !== this.draggedTile) {
                        this.swapTiles(this.draggedTile, tile);
                        this.moves++;
                        this.updateMoveCounter();
                        
                        if (this.checkWin()) {
                            this.showWinMessage();
                        }
                    }
                    
                    this.clearDropTargets();
                });
            }

            swapTiles(tile1, tile2) {
                const temp = tile1.dataset.position;
                tile1.dataset.position = tile2.dataset.position;
                tile2.dataset.position = temp;
                
                const parent = tile1.parentNode;
                const tile1Index = Array.from(parent.children).indexOf(tile1);
                const tile2Index = Array.from(parent.children).indexOf(tile2);
                
                if (tile1Index < tile2Index) {
                    parent.insertBefore(tile2, tile1);
                    parent.insertBefore(tile1, parent.children[tile2Index]);
                } else {
                    parent.insertBefore(tile1, tile2);
                    parent.insertBefore(tile2, parent.children[tile1Index]);
                }
            }

            clearDropTargets() {
                this.tiles.forEach(tile => {
                    tile.classList.remove('drop-target');
                });
            }

            shuffle() {
                const grid = document.getElementById('puzzleGrid');
                const shuffledTiles = [...this.tiles];
                
                // Fisher-Yates shuffle
                for (let i = shuffledTiles.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffledTiles[i], shuffledTiles[j]] = [shuffledTiles[j], shuffledTiles[i]];
                }
                
                // Update positions and DOM order
                shuffledTiles.forEach((tile, index) => {
                    tile.dataset.position = index;
                    grid.appendChild(tile);
                });
                
                // Ensure puzzle is solvable
                if (!this.isSolvable(shuffledTiles)) {
                    this.shuffle();
                }
            }

            isSolvable(tiles) {
                let inversions = 0;
                const positions = tiles.map(tile => parseInt(tile.dataset.correctPosition));
                
                for (let i = 0; i < positions.length - 1; i++) {
                    for (let j = i + 1; j < positions.length; j++) {
                        if (positions[i] > positions[j]) {
                            inversions++;
                        }
                    }
                }
                
                return inversions % 2 === 0;
            }

            checkWin() {
                return this.tiles.every((tile, index) => {
                    return parseInt(tile.dataset.position) === parseInt(tile.dataset.correctPosition);
                });
            }

            showWinMessage() {
                const winMessage = document.getElementById('winMessage');
                const winStats = document.getElementById('winStats');
                const time = this.getElapsedTime();
                
                winStats.textContent = `Completed in ${this.moves} moves and ${time}`;
                winMessage.classList.add('show');
                
                this.stopTimer();
            }

            updateMoveCounter() {
                document.getElementById('moveCounter').textContent = this.moves;
            }

            startTimer() {
                this.startTime = Date.now();
                this.timerInterval = setInterval(() => {
                    document.getElementById('timeCounter').textContent = this.getElapsedTime();
                }, 1000);

                 // Set a timeout to stop the game after 5 minutes
                 /*
                setTimeout(() => {
                    this.stopTimer();
                    alert('Time is up! Game over.');
                    window.location.href = ""
                }, 100000); // 300,000 milliseconds = 5 minutes
                */
            }

            stopTimer() {
                if (this.timerInterval) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                }
            }

            getElapsedTime() {
                if (!this.startTime) return '00:00';
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                return `${minutes}:${seconds}`;
            }

            newGame() {
                this.moves = 0;
                this.stopTimer();
                this.createPuzzle();
                this.shuffle();
                this.updateMoveCounter();
                this.startTimer();
            }

            changeImage() {
                const randomId = Math.floor(Math.random() * 1000);
                this.currentImage = `https://picsum.photos/400/400?random=${randomId}`;
                document.getElementById('imagePreview').src = this.currentImage;
                this.updateTileBackgrounds();
            }

            updateTileBackgrounds() {
                this.tiles.forEach((tile, index) => {
                    const correctPosition = parseInt(tile.dataset.correctPosition);
                    const row = Math.floor(correctPosition / this.gridSize);
                    const col = correctPosition % this.gridSize;
                    
                    tile.style.backgroundImage = `url(${this.currentImage})`;
                    tile.style.backgroundPosition = `-${col * (400 / this.gridSize)}px -${row * (400 / this.gridSize)}px`;
                });
            }

            showHint() {
                const incorrectTiles = this.tiles.filter((tile, index) => {
                    return parseInt(tile.dataset.position) !== parseInt(tile.dataset.correctPosition);
                });
                
                if (incorrectTiles.length > 0) {
                    const randomTile = incorrectTiles[Math.floor(Math.random() * incorrectTiles.length)];
                    randomTile.style.border = '3px solid #ff6b6b';
                    setTimeout(() => {
                        randomTile.style.border = '1px solid rgba(102, 126, 234, 0.3)';
                    }, 2000);
                }
            }

            changeDifficulty(newSize) {
                this.gridSize = parseInt(newSize);
                this.newGame();
            }

            bindEvents() {
                document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
                document.getElementById('shuffleBtn').addEventListener('click', () => {
                    this.shuffle();
                    this.moves = 0;
                    this.updateMoveCounter();
                });
                document.getElementById('solveBtn').addEventListener('click', () => this.showHint());
                document.getElementById('changeImageBtn').addEventListener('click', () => this.changeImage());
                document.getElementById('difficultySelect').addEventListener('change', (e) => {
                    this.changeDifficulty(e.target.value);
                });
            }
        }

        function hideWinMessage() {
            document.getElementById('winMessage').classList.remove('show');
        }

        // Initialize game when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new PuzzleGame();
        });