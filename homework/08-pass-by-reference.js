let listA = [1, 2];
let listB = [3, 4];

function process(a, b) {
  a.push(99);
  b = [100];
}

process(listA, listB);

console.log("listA:", listA);
console.log("listB:", listB);

/*
說明：
- listA 的內容是 [1, 2, 99]，因為 a.push(99) 直接修改了原陣列（傳址）。
- listB 的內容仍是 [3, 4]，因為 b = [100] 是重新賦值給區域變數 b，
  並沒有修改 listB 所指向的陣列。
*/
