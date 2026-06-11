const arr = [
  "Very long content here",
  "Another Very long content here",
  "3rd Very long content here"
];

arr.forEach(item => {
  console.log(item.substring(0, 10) + "...");
});
