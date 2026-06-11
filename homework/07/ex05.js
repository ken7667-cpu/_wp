function fetchData(id, callback) {
  const fakeData = { id: id, status: "success" };
  callback(null, fakeData);
}

fetchData(101, (err, data) => {
  if (err) {
    console.log("發生錯誤：" + err);
  } else {
    console.log("成功取得資料：", data);
  }
});
