## 函数式

推荐函数式编程，主观的认为链式调用优于回调，函数式的方式又优于链式调用。近年来，函数式编程日益流行，Ramdajs、RxJS、cycleJS、lodashJS 等多种开源库都使用了函数式的特性。本文主要介绍一下如何使用 lodash.js 来简化代码。

### （1）声明式和命令式

个人认为函数声明式的调用比命令式更加简洁，举例来说：

```javascript
//命令式
let names: string[] = [];
for (let i = 0; i < persons.length; i++) {
  names.push(person[i].name);
}

//声明式
let names = persons.map((item) => item.name);
```

从上述例子我们可以看出来，明显函数调用声明式的方法更加简洁。此外对于没有副作用的函数，比如上述的 map 函数，完全可以不考虑函数内部是如何实现的，专注于编写业务代码。优化代码时，目光只需要集中在这些稳定坚固的函数内部即可。

### （2）lodash.js

推荐使用 lodash.js，lodash.js 是一个一致性、模块化、高性能的 JavaScript 实用工具库，

内部封装了很多字符串、数组、对象等常见数据类型的处理函数。

According to the [State of Javascript 2020 Survey](https://2019.stateofjs.com/other-tools/) results, lodash is at the top 2:

![](https://xiaomi.f.mioffice.cn/space/api/box/stream/download/asynccode/?code=ZDdiOTYwZjMxNWVjYThmYmNlYzAyNjZkMzFlNDg3NjFfMkE0SWhXQVhPZFA4TjBVZUJodEppWExZSGszSVNzeVVfVG9rZW46Ym94azRFQ0dGMzUzSWYwck1OaXJjR2RaYkNkXzE2Mjk3MjI1Njk6MTYyOTcyNjE2OV9WNA)

看一个例子：

```javascript
let persons = [
  { username: "bob", age: 30, tags: ["work", "boring"] },
  { username: "jim", age: 25, tags: ["home", "fun"] },
  { username: "jane", age: 30, tags: ["vacation", "fun"] },
];
```

我们需要从这个数组中找出 tags 包含 fun 的对象。如果用命令式：

```javascript
let NAME = "fun";
let person;
for (let i = 0; i < persons.length; i++) {
  let isFind = false;
  let arr = persons[i].tags;
  for (let j = 0; j < arr.length; j++) {
    if (arr[i] === NAME) {
      isFind = true;
      break;
    }
  }
  if (isFind) {
    person = person[i];
    break;
  }
}
```

我们用函数式的写法可以简化:

```javascript
let person = _.filter(persons, (person) => person.tags.includes("fun"));

复制代码;
```

很明显减少了代码量且更加容易理解含义。

以上是个开胃菜，下面我们探索 lodash 提供的一些最有用的方法

> This part is easier to understand in English 😄

1.  **isEqual:**

The isEqual method performs a deep comparison between two values.

Syntax:

```javascript
_.isEqual(value, other)
Take a look at the below code:
const obj1 = {
  name: 'Ram',
  age: 20,
  location: {
    city: 'NY',
    state: 'NY'
  }
};

const obj2 = {
  name: 'Ram',
  age: 20,
  location: {
    city: 'NY',
    state: 'NY'
  }
};
console.log(_.isEqual(obj1, obj2)); // true

```

<iframe height="300" style="width: 100%;" scrolling="no" title="lodash isEqual Demo" src="https://codepen.io/myogeshchavan97/embed/WNbmboE?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/myogeshchavan97/pen/WNbmboE">
  lodash isEqual Demo</a> by Yogesh (<a href="https://codepen.io/myogeshchavan97">@myogeshchavan97</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>
<!-- Demo: <https://codepen.io/myogeshchavan97/pen/WNbmboE?editors=0012> -->

**Real Life Application:**

If you are showing user profile data pre-filled when the user logs in to the system and if you are making a web service API call to save the changed user details when the user clicks on the save button, you can easily check if the user has changed something or not before making API call using lodash's isEqual method.

**Performance:**

isEqual is much faster than other alternatives when comparing two deeply nested objects. The other ways of comparing two objects are manually comparing each property or using the JSON.stringify method.

2\. **isEmpty:**

The isEmpty method checks if value is an empty object, collection, map, or set.

Syntax:

```javascript
_.isEmpty(value)
Take a look at the below code:
const obj1 = { name: 'David' };
console.log(_.isEmpty(obj1)); // false

const obj2 = {};
console.log(_.isEmpty(obj2)); // true

const array1 = [];
console.log( _.isEmpty(array1)); // true

const array2 = [2, 3];
console.log(_.isEmpty(array2)); // false

const nullValue = null;
console.log(_.isEmpty(nullValue)); // true

const undefinedValue = undefined;
console.log(_.isEmpty(undefinedValue)); // true

```

<iframe height="300" style="width: 100%;" scrolling="no" title="lodash isEmpty Demo" src="https://codepen.io/myogeshchavan97/embed/PowLwWG?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/myogeshchavan97/pen/PowLwWG">
  lodash isEmpty Demo</a> by Yogesh (<a href="https://codepen.io/myogeshchavan97">@myogeshchavan97</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>
<!-- Demo: [https://codepen.io/myogeshchavan97/pen/PowLwWG?editors=001](https://codepen.io/myogeshchavan97/pen/PowLwWG?editors=0012)2 -->

As you can see the isEmpty method quickly allows testing for an empty value. Instead of using Object.keys(obj1).length === 0 to check for an empty object, isEmpty makes it easy to perform the check.

3\. **get:**

The get method gets the value at the path of an object. If the resolved value is undefined, the defaultValue is returned in its place.

Syntax:

```javascript
_.get(object, path, [defaultValue])
Take a look at the below code:
const user = {
      "gender": "male",
      "name": {
        "title": "mr",
        "first": "brad",
        "last": "gibson"
      },
      "location": {
        "street": "9278 new road",
        "city": "kilcoole",
        "state": "waterford",
        "postcode": "93027",
        "coordinates": {
          "latitude": "20.9267",
          "longitude": "-7.9310"
        },
        "timezone": {
          "offset": "-3:30",
          "description": "Newfoundland"
        }
      }
};

console.log(_.get(user, 'location.timezone', {})); // {'offset':'-3:30','description':'Newfoundland'}
console.log(_.get(user, 'name.middlename', '')); // ''

```

<iframe height="300" style="width: 100%;" scrolling="no" title="lodash get Demo" src="https://codepen.io/myogeshchavan97/embed/jOEJEXp?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/myogeshchavan97/pen/jOEJEXp">
  lodash get Demo</a> by Yogesh (<a href="https://codepen.io/myogeshchavan97">@myogeshchavan97</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>
<!-- Demo: <https://codepen.io/myogeshchavan97/pen/jOEJEXp?editors=0012> -->

The great thing about lodash's get method is that, if the location property does not exist in the user object, directly accessing it as user.location.timezone will throw an error but If lodash's get method is used, it will not throw an error but will return the default value.

```javascript
const user = {
  gender: "male",
  name: {
    title: "mr",
    first: "brad",
    last: "gibson",
  },
};
// This will work and will return the default value specified
console.log("timezone:", _.get(user, "user.location.timezone", "")); //
console.log("timezone:", user.location.timezone); //error
```

4\. **sortBy:**

The sortBy method creates an array of elements, sorted in ascending order by the results of running each element in a collection through each iteratee.

Syntax:

```javascript
_.sortBy(collection, [(iteratees = [_.identity])]);
```

Take a look at the below code:

```javascript
const users = [
  { user: "fred", age: 48 },
  { user: "barney", age: 36 },
  { user: "fred", age: 40 },
  { user: "barney", age: 34 },
];

//sort users by age
console.log(
  _.sortBy(users, [
    function (user) {
      return user.age;
    },
  ])
); // output: [{'user':'barney','age':34},{'user':'barney','age':36},{'user':'fred','age':40},{'user':'fred','age':48}]
```

<iframe height="300" style="width: 100%;" scrolling="no" title="lodash sortBy Demo" src="https://codepen.io/myogeshchavan97/embed/wvBOKYM?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/myogeshchavan97/pen/wvBOKYM">
  lodash sortBy Demo</a> by Yogesh (<a href="https://codepen.io/myogeshchavan97">@myogeshchavan97</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>
<!-- Demo: <https://codepen.io/myogeshchavan97/pen/wvBOKYM?editors=0012> -->

5\. **orderBy:**

The orderBy method is similar to sortBy but it allows us to specify the descending or ascending sort order. For descending sort, we specify **desc** and for ascending we specify **asc**.

Syntax:

```javascript
_.orderBy(collection, [(iteratees = [_.identity])], [orders]);
```

Take a look at the below code:

```javascript
const users = [
  { user: "fred", age: 48 },
  { user: "barney", age: 36 },
  { user: "fred", age: 40 },
  { user: "barney", age: 34 },
];

// sort by user in descending order
console.log(_.orderBy(users, ["user"], ["desc"]));

// sort by user in ascending order and age by descending order
console.log(_.orderBy(users, ["user", "age"], ["asc", "desc"]));
```

<iframe height="300" style="width: 100%;" scrolling="no" title="lodash orderBy Demo" src="https://codepen.io/myogeshchavan97/embed/oNgVYwZ?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/myogeshchavan97/pen/oNgVYwZ">
  lodash orderBy Demo</a> by Yogesh (<a href="https://codepen.io/myogeshchavan97">@myogeshchavan97</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>
<!-- Demo: <https://codepen.io/myogeshchavan97/pen/oNgVYwZ?editors=0012> -->

6\. **union:**

The union method returns the unique values from all the arrays passed.

Syntax:

\_.union([arrays])

Example:

```javascript
console.log(_.union([1], [1, 2, 3], [-1, 0, 4], [2, 2, 3])); // [1, 2, 3, -1, 0, 4]
```

<iframe height="300" style="width: 100%;" scrolling="no" title="lodash union Demo" src="https://codepen.io/myogeshchavan97/embed/PowLbaB?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/myogeshchavan97/pen/PowLbaB">
  lodash union Demo</a> by Yogesh (<a href="https://codepen.io/myogeshchavan97">@myogeshchavan97</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>
<!-- Demo: <https://codepen.io/myogeshchavan97/pen/PowLbaB?editors=0012> -->

7\. **cloneDeep:**

The cloneDeep method returns a clone/copy of an object recursively. This is very useful if you don't want to change the original object but create a copy of the object to add extra properties to it.

Syntax:

```javascript
_.cloneDeep(value);
```

Example:

```javascript
const obj = {
  name: {
    title: "Ms",
    first: "Hannah",
    last: "Ennis",
  },
  location: {
    city: "Flatrock",
    state: "British Columbia",
    country: "Canada",
    postcode: "P1X 7D3",
    coordinates: {
      latitude: "-62.3907",
      longitude: "37.8088",
    },
    timezone: {
      offset: "+5:30",
      description: "Bombay, Calcutta, Madras, New Delhi",
    },
  },
};
const clone = _.cloneDeep(obj);
console.log(obj.name === clone.name); // false
console.log(clone === obj); // false
```

<iframe height="300" style="width: 100%;" scrolling="no" title="lodash cloneDeep Demo" src="https://codepen.io/myogeshchavan97/embed/vYyqjxg?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/myogeshchavan97/pen/vYyqjxg">
  lodash cloneDeep Demo</a> by Yogesh (<a href="https://codepen.io/myogeshchavan97">@myogeshchavan97</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>
<!-- Demo: <https://codepen.io/myogeshchavan97/pen/vYyqjxg?editors=0012> -->

As you can see from the above comparison of clone.name and obj.name, \_.cloneDeep creates totally different object which is a copy/clone

8\. **debounce:**

The debounce method allows us to call a function after some milliseconds have passed.

Syntax:

```javascript
_.debounce(func, [(wait = 0)], [(options = {})]);
```

**Note: the debounce method returns a function that we invoke to make subsequent calls.**

This is a very useful method that allows us to minimize the number of API calls to the server.

Let's build a search functionality where a user types some information as input, and we will make an API call to the server to get the result based on the input.

**Demo without using debouncing:**

<iframe height="300" style="width: 100%;" scrolling="no" title="with debounce Demo" src="https://codepen.io/myogeshchavan97/embed/YzPgExJ?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/myogeshchavan97/pen/YzPgExJ">
  with debounce Demo</a> by Yogesh (<a href="https://codepen.io/myogeshchavan97">@myogeshchavan97</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

In the above without debouncing example, you can see that on every keystroke, we are making an API call. So we are unnecessarily increasing the server API calls. If the server is taking more time to return the data, you might see the previous result even when you are expecting new results based on your input value.

To fix this we can use debouncing where we only make an API request after 300 milliseconds once a user has stopped typing which is more beneficial. It will save from unnecessary requests and will also save from previous API call result being displayed for a short time.

**Demo using debouncing:**

<https://codepen.io/myogeshchavan97/pen/YzPgExJ?editors=0010>

In the above code, the debounce method returns a function which we're storing in debFunction variable

```javascript
const debFunction = _.debounce(onSearchText, 1000);
```

Then for every key change event, we're calling the function stored in debFunction variable after 300 milliseconds once the user has stopped typing. Calling debFunction, internally, calls the onSearchText function where we're actually making an API call.
