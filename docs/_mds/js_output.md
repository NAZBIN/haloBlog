### JS 输出： 代码片段强化对 JS 基础的掌握。

```javascript
const shape = {
  radius: 10,
  diameter() {
    return this.radius * 2;
  },
  perimeter: () => 2 * Math.PI * this.radius,
};

console.log(shape.diameter()); //20
console.log(shape.perimeter()); //NAN
```

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1);
}

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1);
}
//output: 333 012
//explain: In the second loop, During each iteration, i will have a new value, and each value is scoped inside the loop.
```
