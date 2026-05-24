class MaxHeap {
    constructor() {
        this.heap = [];
    }

    // Add patient to the heap
    insert(patient) {
        this.heap.push(patient);
        this.bubbleUp();
    }

    bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index].priorityScore <= this.heap[parentIndex].priorityScore) break;
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            index = parentIndex;
        }
    }

    // Get the most critical patient (Doctor calls this)
    extractMax() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();
        const max = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown();
        return max;
    }

    bubbleDown() {
        let index = 0;
        const length = this.heap.length;
        while (true) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let swap = null;

            if (left < length) {
                if (this.heap[left].priorityScore > this.heap[index].priorityScore) {
                    swap = left;
                }
            }
            if (right < length) {
                if (
                    (swap === null && this.heap[right].priorityScore > this.heap[index].priorityScore) ||
                    (swap !== null && this.heap[right].priorityScore > this.heap[left].priorityScore)
                ) {
                    swap = right;
                }
            }

            if (swap === null) break;
            [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
            index = swap;
        }
    }

    // View the queue without removing
    getQueue() {
        return this.heap;
    }
}

module.exports = new MaxHeap(); // Export as a Singleton (single instance)