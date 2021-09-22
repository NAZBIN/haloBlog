const arr = [];
//原型链判断数组
// console.log(arr.__proto__ === Array.prototype);

console.log(Array.prototype.isPrototypeOf(arr));

function myInstanceOf(left, right) {
  let proto = Object.getPrototypeOf(left);
  let prototype = right.prototype;

  while (true) {
    if (!proto) return false;
    if (proto === prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
}
