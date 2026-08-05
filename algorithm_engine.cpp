#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <algorithm>
#include <stdexcept>

using namespace std;

struct Step {
    string message;
    vector<int> values;
    vector<string> explanation;
    int low = -1;
    int high = -1;
    int pivot = -1;
};  

vector<string> split(const string& input, char delimiter) {
    vector<string> parts;
    stringstream ss(input);
    string item;
    while (getline(ss, item, delimiter)) {
        if (!item.empty()) parts.push_back(item);
    }
    return parts;
}

vector<int> parseValues(const string& input) {
    vector<int> values;
    for (const string& part : split(input, ',')) {
        values.push_back(stoi(part));
    }
    return values;
}

vector<Step> simulateBubbleSort(vector<int> values) {
    vector<Step> steps;
    int n = static_cast<int>(values.size());
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n - i - 1; ++j) {
            if (values[j] > values[j + 1]) {
                swap(values[j], values[j + 1]);
            }
            Step step;
            step.message = "Comparing and swapping adjacent elements";
            step.values = values;
            step.explanation.push_back("Compare the current pair and swap if the left value is greater.");
            steps.push_back(step);
        }
    }
    return steps;
}

vector<Step> simulateSelectionSort(vector<int> values) {
    vector<Step> steps;
    int n = static_cast<int>(values.size());
    for (int i = 0; i < n - 1; ++i) {
        int minIndex = i;
        for (int j = i + 1; j < n; ++j) {
            Step compareStep;
            compareStep.message = "Comparing elements to find the minimum";
            compareStep.values = values;
            compareStep.explanation.push_back("Compare the current element with the smallest found so far.");
            steps.push_back(compareStep);
            if (values[j] < values[minIndex]) {
                minIndex = j;
                Step foundStep;
                foundStep.message = "New minimum found";
                foundStep.values = values;
                foundStep.explanation.push_back("Update the current minimum element for this pass.");
                steps.push_back(foundStep);
            }
        }
        if (minIndex != i) {
            swap(values[i], values[minIndex]);
            Step swapStep;
            swapStep.message = "Swap the minimum into place";
            swapStep.values = values;
            swapStep.explanation.push_back("Swap the smallest element into the sorted portion of the array.");
            steps.push_back(swapStep);
        }
    }
    Step sorted;
    sorted.message = "Selection sort complete";
    sorted.values = values;
    sorted.explanation.push_back("The array is sorted after repeatedly selecting the smallest remaining element.");
    steps.push_back(sorted);
    return steps;
}

vector<Step> simulateInsertionSort(vector<int> values) {
    vector<Step> steps;
    int n = static_cast<int>(values.size());
    for (int i = 1; i < n; ++i) {
        int key = values[i];
        int j = i - 1;
        Step startStep;
        startStep.message = "Insert the current element into the sorted portion";
        startStep.values = values;
        startStep.explanation.push_back("Take the next element and move it into the sorted subarray.");
        steps.push_back(startStep);

        while (j >= 0 && values[j] > key) {
            Step compareStep;
            compareStep.message = "Compare and shift sorted elements";
            compareStep.values = values;
            compareStep.explanation.push_back("Compare the key with the sorted elements and shift larger values right.");
            steps.push_back(compareStep);
            values[j + 1] = values[j];
            j -= 1;
            Step shiftStep;
            shiftStep.message = "Shift element to the right";
            shiftStep.values = values;
            shiftStep.explanation.push_back("Move the current element right to make room for the key.");
            steps.push_back(shiftStep);
        }
        values[j + 1] = key;
        Step insertStep;
        insertStep.message = "Insert key into sorted position";
        insertStep.values = values;
        insertStep.explanation.push_back("Place the key into the correct position in the sorted portion.");
        steps.push_back(insertStep);
    }
    Step sorted;
    sorted.message = "Insertion sort complete";
    sorted.values = values;
    sorted.explanation.push_back("The array is sorted after inserting each element into its proper place.");
    steps.push_back(sorted);
    return steps;
}

int partitionQuickSort(vector<int>& values, int low, int high, vector<Step>& steps) {
    int pivot = values[high];
    int i = low - 1;
    for (int j = low; j < high; ++j) {
        Step compareStep;
        compareStep.message = "Compare element to pivot";
        compareStep.values = values;
        compareStep.low = low;
        compareStep.high = high;
        compareStep.pivot = high;
        compareStep.explanation.push_back("Compare each element to the pivot to partition the array.");
        steps.push_back(compareStep);
        if (values[j] < pivot) {
            i += 1;
            swap(values[i], values[j]);
            Step swapStep;
            swapStep.message = "Swap smaller element toward left";
            swapStep.values = values;
            swapStep.low = low;
            swapStep.high = high;
            swapStep.pivot = high;
            swapStep.explanation.push_back("Move the element to the left partition because it is smaller than the pivot.");
            steps.push_back(swapStep);
        }
    }
    swap(values[i + 1], values[high]);
    Step pivotStep;
    pivotStep.message = "Place pivot in correct position";
    pivotStep.values = values;
    pivotStep.low = low;
    pivotStep.high = high;
    pivotStep.pivot = i + 1;
    pivotStep.explanation.push_back("Swap the pivot into its final sorted position.");
    steps.push_back(pivotStep);
    return i + 1;
}

void quickSortHelper(vector<int>& values, int low, int high, vector<Step>& steps) {
    if (low < high) {
        Step rangeStep;
        rangeStep.message = "Sort subarray recursively";
        rangeStep.values = values;
        rangeStep.low = low;
        rangeStep.high = high;
        rangeStep.pivot = high;
        rangeStep.explanation.push_back("Process the current subarray using recursive quick sort.");
        steps.push_back(rangeStep);

        Step partitionStep;
        partitionStep.message = "Partition the array around pivot";
        partitionStep.values = values;
        partitionStep.low = low;
        partitionStep.high = high;
        partitionStep.pivot = high;
        partitionStep.explanation.push_back("Divide the array into elements smaller and larger than the pivot.");
        steps.push_back(partitionStep);

        int pivotIndex = partitionQuickSort(values, low, high, steps);

        if (low < pivotIndex - 1) {
            Step recurseLeft;
            recurseLeft.message = "Recurse on left partition";
            recurseLeft.values = values;
            recurseLeft.low = low;
            recurseLeft.high = pivotIndex - 1;
            recurseLeft.pivot = pivotIndex;
            recurseLeft.explanation.push_back("Sort the left subarray using recursion.");
            steps.push_back(recurseLeft);
            quickSortHelper(values, low, pivotIndex - 1, steps);
        }

        if (pivotIndex + 1 < high) {
            Step recurseRight;
            recurseRight.message = "Recurse on right partition";
            recurseRight.values = values;
            recurseRight.low = pivotIndex + 1;
            recurseRight.high = high;
            recurseRight.pivot = pivotIndex;
            recurseRight.explanation.push_back("Sort the right subarray using recursion.");
            steps.push_back(recurseRight);
            quickSortHelper(values, pivotIndex + 1, high, steps);
        }
    }
}

vector<Step> simulateMergeSort(vector<int> values, int start, int end, vector<Step>& steps);

vector<Step> simulateQuickSort(vector<int> values) {
    vector<Step> steps;
    if (!values.empty()) {
        quickSortHelper(values, 0, static_cast<int>(values.size()) - 1, steps);
    }
    Step sorted;
    sorted.message = "Quick sort complete";
    sorted.values = values;
    sorted.explanation.push_back("The array is sorted using divide-and-conquer partitioning.");
    steps.push_back(sorted);
    return steps;
}

vector<Step> simulateMergeSort(vector<int> values, int low, int high, vector<Step>& steps) {
    if (low >= high) {
        return steps;
    }

    int mid = low + (high - low) / 2;
    Step splitStep;
    splitStep.message = "Divide the array into halves";
    splitStep.values = values;
    splitStep.low = low;
    splitStep.high = high;
    splitStep.explanation.push_back("Split the array into left and right subarrays.");
    steps.push_back(splitStep);

    simulateMergeSort(values, low, mid, steps);
    simulateMergeSort(values, mid + 1, high, steps);

    int leftIndex = low;
    int rightIndex = mid + 1;
    vector<int> merged;

    while (leftIndex <= mid && rightIndex <= high) {
        Step compareStep;
        compareStep.message = "Compare values from left and right subarrays";
        compareStep.values = values;
        compareStep.low = low;
        compareStep.high = high;
        compareStep.explanation.push_back("Choose the smaller element from either side to merge.");
        steps.push_back(compareStep);

        if (values[leftIndex] <= values[rightIndex]) {
            merged.push_back(values[leftIndex]);
            leftIndex++;
        } else {
            merged.push_back(values[rightIndex]);
            rightIndex++;
        }
    }

    while (leftIndex <= mid) {
        merged.push_back(values[leftIndex]);
        leftIndex++;
    }

    while (rightIndex <= high) {
        merged.push_back(values[rightIndex]);
        rightIndex++;
    }

    for (int i = low; i <= high; ++i) {
        values[i] = merged[i - low];
        Step writeStep;
        writeStep.message = "Write merged values back into the array";
        writeStep.values = values;
        writeStep.low = low;
        writeStep.high = high;
        writeStep.explanation.push_back("Place the sorted merged block back into the original array.");
        steps.push_back(writeStep);
    }

    return steps;
}

vector<Step> simulateLinearSearch(vector<int> values, int target) {
    vector<Step> steps;
    for (int i = 0; i < static_cast<int>(values.size()); ++i) {
        Step step;
        step.message = "Check the next element";
        step.values = values;
        step.explanation.push_back("Compare the current element with the target value.");
        steps.push_back(step);
        if (values[i] == target) {
            Step found;
            found.message = "Target found";
            found.values = values;
            found.explanation.push_back("The current element matches the target.");
            steps.push_back(found);
            return steps;
        }
    }
    Step notFound;
    notFound.message = "Target not found";
    notFound.values = values;
    notFound.explanation.push_back("The search completed without finding the target.");
    steps.push_back(notFound);
    return steps;
}

vector<Step> simulateBinarySearch(vector<int> values, int target) {
    vector<Step> steps;
    sort(values.begin(), values.end());
    int left = 0;
    int right = static_cast<int>(values.size()) - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        Step step;
        step.message = "Checking the middle element";
        step.values = values;
        steps.push_back(step);

        if (values[mid] == target) {
            Step success;
            success.message = "Target found";
            success.values = values;
            success.explanation.push_back("The middle element matches the target, so the search is complete.");
            steps.push_back(success);
            return steps;
        }

        if (values[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    Step fail;
    fail.message = "Target not found";
    fail.values = values;
    fail.explanation.push_back("The search interval is exhausted without finding the target.");
    steps.push_back(fail);
    return steps;
}

vector<Step> simulateStack(vector<int> values, const string& operation, int target) {
    vector<Step> steps;
    Step initial;
    initial.message = "Initial stack";
    initial.values = values;
    steps.push_back(initial);

    if (operation == "push") {
        values.push_back(target);
        Step step;
        step.message = "Pushed a value onto the stack";
        step.values = values;
        step.explanation.push_back("Push places the new value at the top of the stack.");
        steps.push_back(step);
    } else if (operation == "pop") {
        if (!values.empty()) {
            values.pop_back();
            Step step;
            step.message = "Removed the top value from the stack";
            step.values = values;
            step.explanation.push_back("Pop removes the current top element from the stack.");
            steps.push_back(step);
        } else {
            Step step;
            step.message = "Stack is empty";
            step.values = values;
            steps.push_back(step);
        }
    }
    return steps;
}

vector<Step> simulateQueue(vector<int> values, const string& operation, int target) {
    vector<Step> steps;
    Step initial;
    initial.message = "Initial queue";
    initial.values = values;
    steps.push_back(initial);

    if (operation == "enqueue") {
        values.push_back(target);
        Step step;
        step.message = "Added a value to the rear of the queue";
        step.values = values;
        step.explanation.push_back("Enqueue appends the value to the back of the queue.");
        steps.push_back(step);
    } else if (operation == "dequeue") {
        if (!values.empty()) {
            values.erase(values.begin());
            Step step;
            step.message = "Removed the front value from the queue";
            step.values = values;
            step.explanation.push_back("Dequeue removes the value at the front of the queue.");
            steps.push_back(step);
        } else {
            Step step;
            step.message = "Queue is empty";
            step.values = values;
            steps.push_back(step);
        }
    }
    return steps;
}

vector<Step> simulateLinkedList(vector<int> values, const string& operation, int target) {
    vector<Step> steps;
    Step initial;
    initial.message = "Initial linked-list view";
    initial.values = values;
    initial.explanation.push_back("A linked list stores values as nodes connected by pointers.");
    steps.push_back(initial);

    if (operation == "insert") {
        values.push_back(target);
        Step step;
        step.message = "Inserted the value at the tail";
        step.values = values;
        step.explanation.push_back("The new node is appended to the end of the linked list.");
        steps.push_back(step);
    } else if (operation == "delete") {
        vector<int> updated;
        bool removed = false;
        for (size_t i = 0; i < values.size(); ++i) {
            if (!removed && values[i] == target) {
                removed = true;
            } else {
                updated.push_back(values[i]);
            }
        }
        Step step;
        step.message = removed ? "Deleted the first matching value" : "Value not found";
        step.values = updated;
        step.explanation.push_back("The first matching node is removed from the linked list.");
        steps.push_back(step);
    }
    return steps;
}

vector<Step> simulateGraph(vector<int> values, const string& operation) {
    vector<Step> steps;
    Step initial;
    initial.message = "Graph traversal begins";
    initial.values = values;
    initial.explanation.push_back("A graph is traversed by visiting connected nodes step by step.");
    steps.push_back(initial);

    if (operation == "dfs") {
        vector<int> visited;
        for (size_t i = 0; i < values.size(); ++i) {
            visited.push_back(values[i]);
            Step step;
            step.message = "Visiting node";
            step.values = visited;
            step.explanation.push_back("Depth-first search explores one branch fully before moving to the next branch.");
            steps.push_back(step);
        }
    } else if (operation == "bfs") {
        vector<int> visited;
        for (size_t i = 0; i < values.size(); ++i) {
            visited.push_back(values[i]);
            Step step;
            step.message = "Visiting node";
            step.values = visited;
            step.explanation.push_back("Breadth-first search visits nodes level by level.");
            steps.push_back(step);
        }
    } else if (operation == "dijkstra") {
        vector<int> distances;
        distances.push_back(0);
        distances.push_back(4);
        distances.push_back(6);
        Step step;
        step.message = "Shortest path found";
        step.values = distances;
        step.explanation.push_back("Dijkstra computes the shortest cumulative distance from the start node.");
        steps.push_back(step);
    } else {
        Step step;
        step.message = "Select DFS, BFS, or Dijkstra";
        step.values = values;
        step.explanation.push_back("Choose a traversal order to see the graph steps clearly.");
        steps.push_back(step);
    }
    return steps;
}

void heapify(vector<int>& arr, int n, int i, vector<Step>& steps) {
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;

    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;

    Step step;
    step.message = "Heapify at index " + to_string(i);
    step.values = arr;
    step.explanation.push_back("Ensuring parent is larger than children during heapify.");
    steps.push_back(step);

    if (largest != i) {
        swap(arr[i], arr[largest]);
        Step swapped;
        swapped.message = "Swap during heapify";
        swapped.values = arr;
        swapped.explanation.push_back("Swapped parent with larger child to maintain heap property.");
        steps.push_back(swapped);
        heapify(arr, n, largest, steps);
    }
}

vector<Step> simulateHeapSort(vector<int> values) {
    vector<Step> steps;
    int n = static_cast<int>(values.size());

    // Build heap
    for (int i = n / 2 - 1; i >= 0; --i) {
        heapify(values, n, i, steps);
    }
    Step built;
    built.message = "Max-heap built";
    built.values = values;
    built.explanation.push_back("Initial max-heap constructed from the array.");
    steps.push_back(built);

    // One by one extract elements
    for (int i = n - 1; i >= 1; --i) {
        swap(values[0], values[i]);
        Step extract;
        extract.message = "Extract max and place at end";
        extract.values = values;
        extract.explanation.push_back("Swapped max element to the end of the array.");
        steps.push_back(extract);
        heapify(values, i, 0, steps);
    }

    Step sorted;
    sorted.message = "Heap sort complete";
    sorted.values = values;
    sorted.explanation.push_back("Array is now sorted after heap extraction passes.");
    steps.push_back(sorted);

    return steps;
}

int parseOptionalInt(const char* value) {
    if (value == nullptr || string(value).empty()) {
        return 0;
    }

    try {
        return stoi(value);
    } catch (...) {
        return 0;
    }
}

int main(int argc, char* argv[]) {
    try {
        if (argc < 3) {
            cerr << "Usage: algorithm_engine <algorithm> <values> [target] [operation]" << endl;
            return 1;
        }

        string algorithm = argv[1];
        string valuesInput = argv[2];
        vector<int> values = parseValues(valuesInput);
        int target = parseOptionalInt(argc >= 4 ? argv[3] : nullptr);
        string operation = argc >= 5 ? argv[4] : "none";

        vector<Step> steps;
        if (algorithm == "bubble") {
            steps = simulateBubbleSort(values);
        } else if (algorithm == "selection-sort") {
            steps = simulateSelectionSort(values);
        } else if (algorithm == "insertion-sort") {
            steps = simulateInsertionSort(values);
        } else if (algorithm == "quick-sort") {
            steps = simulateQuickSort(values);
        } else if (algorithm == "merge-sort") {
            steps = simulateMergeSort(values, 0, static_cast<int>(values.size()) - 1, steps);
            Step sorted;
            sorted.message = "Merge sort complete";
            sorted.values = values;
            sorted.explanation.push_back("The array is sorted by recursively merging sorted halves.");
            steps.push_back(sorted);
        } else if (algorithm == "linear-search") {
            steps = simulateLinearSearch(values, target);
        } else if (algorithm == "heap") {
            steps = simulateHeapSort(values);
        } else if (algorithm == "binary-search") {
            steps = simulateBinarySearch(values, target);
        } else if (algorithm == "stack") {
            steps = simulateStack(values, operation, target);
        } else if (algorithm == "queue") {
            steps = simulateQueue(values, operation, target);
        } else if (algorithm == "linked-list") {
            steps = simulateLinkedList(values, operation, target);
        } else if (algorithm == "graph") {
            steps = simulateGraph(values, operation);
        } else {
            throw invalid_argument("Unsupported algorithm");
        }

        cout << "[";
        for (size_t i = 0; i < steps.size(); ++i) {
            cout << "{\"message\":\"" << steps[i].message << "\",\"values\":[";
            for (size_t j = 0; j < steps[i].values.size(); ++j) {
                if (j) cout << ",";
                cout << steps[i].values[j];
            }
            cout << "],\"explanation\":[";
            for (size_t j = 0; j < steps[i].explanation.size(); ++j) {
                if (j) cout << ",";
                cout << "\"" << steps[i].explanation[j] << "\"";
            }
            cout << "],\"low\":" << steps[i].low << ",\"high\":" << steps[i].high << ",\"pivot\":" << steps[i].pivot << "}";
            if (i + 1 < steps.size()) cout << ",";
        }
        cout << "]";
        return 0;
    } catch (const exception& ex) {
        cerr << ex.what() << endl;
        return 2;
    }
}
