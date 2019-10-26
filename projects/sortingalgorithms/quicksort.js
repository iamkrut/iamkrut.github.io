let values = [];
let w = 10;

let states = [];

let sort_algo = 0;

function setup() {
  canvas_width = windowWidth - (windowWidth/4)
  canvas_height = windowHeight - (windowHeight/4)

  // creating canvas
  canvas = createCanvas(canvas_width, canvas_height);
  canvas.position(windowWidth/2 - canvas_width/2, canvas.position().y);

  // creating operation buttons
  button_generate = createButton('Generate array');
  button_sort = createButton('Sort!!!');
  sel = createSelect();
  sel.option('Bubble Sort', 0);
  sel.option('Selection Sort', 1);
  sel.option('Insertion Sort', 2);
  sel.option('Merge Sort', 3);
  sel.option('Quick Sort', 4);
  sel.option('Heap Sort', 5);
  sel.changed(select_sort_algo);

  // creating operation button panel - setting parent of buttons to button panel - repositioning it
  button_pannel_operation = createDiv();
  button_pannel_operation.style('display', 'inline-block');
  sel.parent(button_pannel_operation);
  button_generate.parent(button_pannel_operation);
  button_sort.parent(button_pannel_operation);
  button_pannel_operation.position(windowWidth/2 - button_pannel_operation.size().width/2, canvas.position().y + canvas_height + button_pannel_operation.size().height);

  // button handlers
  button_generate.mousePressed(function() { generate_array(canvas_height); });
  button_sort.mousePressed(function() { get_sort(sort_algo)(values, 0, values.length - 1); });

  // generating array
  values = generate_array(canvas_height);
}

function draw() {
  background(0);

  for (let i = 0; i < values.length; i++) {
    noStroke();
    if (states[i] == 0) {
      fill('#E0777D');
    } else if (states[i] == 1) {
      fill('#D6FFB7');
    } else {
      fill(220);
    }
    rect(i * w, height - values[i], w-1, values[i]);
  }
}

function generate_array(canvas_height){
  values = new Array(floor(width / w));
  for (let i = 0; i < values.length; i++) {
    values[i] = random(canvas_height);
    states[i] = -1;
  }
  return values;
}

function get_sort(sort_algo){
  switch(sort_algo){
    case 0: // bubble sort
      return bubble_sort;
    case 1: // selection sort
      return selection_sort;
    case 2: // bubble sort
      return null;
    case 3: // merge sort
      return merge_sort;
    case 4: // quick sort
      return quickSort;
    case 5: // heap sort
      return heap_sort;
  }
}

function select_sort_algo(){
  console.log(sel.value());
  sort_algo = int(sel.value());
}

async function swap(arr, a, b) {
  await sleep(50);
  let temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// bubble sort
async function bubble_sort(arr, start, end){
  let i = 0;
  let j = 0;
  while(true){
    if (i < arr.length) {
      for (let j = 0; j < end - i; j++) {
        let a = arr[j];
        let b = arr[j + 1];
        if (a > b) {
          states[j] = 0;
          for(k=j+1; k < end - i + 1; k++){
            states[k] = 1;
          }
          await swap(arr, j, j + 1);
          for(k=j; k < end - i + 1; k++){
            states[k] = -1;
          }
        }
      }
    } else {
      break;
    }
    i++;
  }
}

// selection sort
async function selection_sort(arr, start, end){
  console.log("Here");
  for (let i = 0; i < end; i++) {
      let min = i;
      for (let j = i + 1; j <= end; j++) {
          if (arr[min] > arr[j]) {
              min = j;
          }
      }
      if (min !== i) {
        states[min] = 1;
        states[i] = 0;
        await swap(arr, min, i);
        states[min] = -1;
        states[i] = -1;
      }
  }
}

// merge sort

async function merge(arr, start, mid, end) 
{ 
    start2 = mid + 1; 
  
    // If the direct merge is already sorted 
    if (arr[mid] <= arr[start2]) { 
      return; 
    } 
  
    // Two pointers to maintain start 
    // of both arrays to merge 
    while (start <= mid && start2 <= end) { 
        
        // If element 1 is in right place 
        if (arr[start] <= arr[start2]) { 
            start++; 
        } 
        else { 
          
            value = arr[start2]; 
            index = start2; 
  
            // Shift all the elements between element 1 
            // element 2, right by 1. 
            while (index != start) { 
              await sleep(50);
                arr[index] = arr[index - 1]; 
                index--; 
            } 
            arr[start] = value; 
  
            // Update all the pointers 
            start++; 
            mid++; 
            start2++; 
        } 
    } 
} 
  
/* l is for left index and r is right index of the  
   sub-array of arr to be sorted */
async function merge_sort(arr, l, r) 
{ 
  print("Here", l, " ", r);
    print(l);
    print(r);
    if (l < r) { 
      
        // Same as (l + r) / 2, but avoids overflow 
        // for large l and r 
        m = int(l + (r - l) / 2); 
  
        // Sort first and second halves 
        await Promise.all([
          merge_sort(arr, l, m),
          merge_sort(arr, m + 1, r), 
          merge(arr, l, m, r)
        ]);
    } 
} 

// quick sort
async function partition(arr, start, end) {
  for (let i = start; i < end; i++) {
    states[i] = 1;
  }

  let pivotValue = arr[end];
  let pivotIndex = start;
  states[pivotIndex] = 0;
  for (let i = start; i < end; i++) {
    if (arr[i] < pivotValue) {
      await swap(arr, i, pivotIndex);
      states[pivotIndex] = -1;
      pivotIndex++;
      states[pivotIndex] = 0;
    }
  }
  await swap(arr, pivotIndex, end);

  for (let i = start; i < end; i++) {
    if (i != pivotIndex) {
      states[i] = -1;
    }
  }

  return pivotIndex;
}

async function quickSort(arr, start, end) {
  if (start >= end) {
    return;
  }
  let index = await partition(arr, start, end);
  states[index] = -1;

  await Promise.all([
    quickSort(arr, start, index - 1),
    quickSort(arr, index + 1, end)
  ]);
}

// heap sort
async function heap_sort(arr, start, end) {
  array_length = end + 1;
  for (var i = Math.floor(array_length / 2); i >= 0; i -= 1) {
    await Promise.all([
      heap_root(arr, i)
    ]);
  }
  for (i = arr.length - 1; i > 0; i--) {
    states[max] = 1;
    states[i] = 0;
    await swap(arr, 0, i);
    states[max] = -1;
    states[i] = -1;
    array_length--;
    await Promise.all([
      heap_root(arr, 0)
    ]);
  }
}

async function heap_root(arr, i) {
  var left = 2 * i + 1;
  var right = 2 * i + 2;
  var max = i;
  if (left < array_length && arr[left] > arr[max]) {
      max = left;
  }
  if (right < array_length && arr[right] > arr[max])     {
      max = right;
  }
  if (max != i) {
    states[max] = 1;
    states[i] = 0;
    await swap(arr, i, max);
    states[max] = -1;
    states[i] = -1;
    await Promise.all([
      heap_root(arr, max)
    ]);
  }
}