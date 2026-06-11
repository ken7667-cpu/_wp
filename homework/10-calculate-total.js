function calculateTotal(cart, discountFunc) {
  const sum = cart.reduce((acc, price) => acc + price, 0);
  return discountFunc(sum);
}

const result = calculateTotal([100, 200, 300], function (total) { return total - 50; });
console.log(result);
