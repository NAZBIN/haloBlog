typescript 代码规范

良好的代码具有很好的可读性,后续维护起来也会令人愉悦,也能降低重构的概率。本文会结合 Typescript,谈谈如何 clean 代码：

- > 基础规范

- > 函数式

> ps：Paste the code, deepen understanding. looking forward to your likes and comments😄

## 基础规范

### （1）常量

常量必须命名, 在做逻辑判断的时候，也不允许直接对比没有命名的常量。

- 错误的书写

```
  switch(num){
       case 1:
         ...
       case 3:
         ...
       case 7:
         ...
  }

  if(x === 0){
       ...
  }

```

上述的例子中，根本不知道 1 3 7 对应的是什么意思，这种写法就基本上没有可读性。

- 正确的写法

```
    enum DayEnum {
        oneDay = 1,
        threeDay = 3,
        oneWeek = 7,
    }
    let num  = 1;
    switch(num){
        case DayEnum.oneDay:
        ...
        case DayEnum.threeDay:
        ...
        case DayEnum.oneWeek:
        ...
    }

   const RightCode = 0;
   if(x === RightCode)

```

从上述正确的写法可以看出来，常量有了命名，在 switch 或者 if 等逻辑判断的时候，我们可以从变量名得知常量的具体含义，增加了可读性。

### （2）枚举

除了常量枚举外，在 Typescript 的编译阶段，枚举会生成一个 maping 对象，**_如果不是字符串枚举，甚至会生成一个双向的 mapping_**。因此在我们的业务代码中，有了枚举，就不需要一个与枚举值相关的数组。

- 错误的写法

```
enum FruitEnum {
       tomato = 1,
       banana =  2,
       apple = 3
}

const FruitList = [
  {
     key:1,
     value: 'tomato'
  },{
     key:2,
     value: 'banana'
  },{
     key:3,
     value: 'apple'
  }
]

```

这里错误的原因是冗余，我们要得到一个 FruitList，并不需要 new 一个，而是可以直接根据 FruitEnum 的枚举来生成一个数组，原理就是我们之前所说的 Typescript 的枚举，除了常量枚举外，在编译的时候是会生成一个 map 对象的。

- 正确的写法

```
enum FruitEnum {
    tomato = 1,
    banana =  2,
    apple = 3
}
const FruitList = Object.entries(FruitEnum)

```

上述就是正确的写法，这种写法不仅仅是不冗余，此外，如果修改了枚举的类型，我们只要直接修改枚举，这样衍生的数组也会改变。

除此之外，字符串枚举值和字符串是有本质区别的，在定义类型的时候请千万注意，要不然会让你写的代码很冗余。

### （3）ts-ignore & any

Typescript 中应该严格禁止使用 ts-ignore，ts-ignore 是一个比 any 更加影响 Typescript 代码质量的因素。对于 any，在绝大部分场景下你可能都不需要使用 any。需要使用 any 的场景，可以 case by case 的分析。

- 错误使用 ts-ignore 的场景

```
 //@ts-ignore
 import Plugin from 'someModule' //如果someModule的声明不存在
 Plugin.test("hello world")

复制代码

```

上述就是最经典的使用 ts-ignore 的场景，如上的方式使用了 ts-ignore.那么 Typescript 会认为 Plugin 的类型是 any。正确的方法通过 declare module 的方法自定义需要使用到的类型.

any 会完全失去类型判断，本身其实是比较危险的，且使用 any 就相当于放弃了类型检测，也就基本上放弃了 typescript。举例来说：

```
let fish:any = {
       type:'animal',
       swim:()=> {

       }
}
fish.run()

```

上述的例子中我们调用了一个不存在的方法 ，因为使用了 any，因此跳过了静态类型检测，因此是不安全的。运行时会出错，如果无法立刻确定某个值的类型，我们可以 用 unknown 来代替使用 any。

```
let fish:unknown = {
      type:'animal',
      swim:()=> {

      }
}
fish.run() //会报错

```

unkonwn 是任何类型的子类型，因此跟 any 一样，任意类型都可以赋值给 unkonwn。与 any 不同的是，unkonwn 的变量必须明确自己的类型，类型收缩或者类型断言后，unkonwn 的变量才可以正常使用其上定义的方法和变量。

简单来说，**_unkonwn 需要在使用前，强制判断其类型_**。

### （4）限制函数参数的个数

在定义函数的时候，应该减少函数参数的个数，推荐不能超过 3 个。

- 错误的用法

```
function getList(searchName:string,pageNum:number,pageSize:number,key1:string,key2:string){
   ...
}

```

不推荐函数的参数超过 3 个，当超过 3 个的时候，应该使用对象来聚合。

- 正确的用法

```
interface ISearchParams{
   searchName:string;
   pageNum:number;
   pageSize:number;
   key1:string;
   key2:string;
}

function getList(params:ISearchParams){

}

```

同样的引申到 React 项目中，useState 也是同理

```
const [searchKey,setSearchKey] = useState('');
const [current,setCurrent] = useState(1)
const [pageSize,setPageSize] = useState(10)  //错误的写法

const [searchParams,setSearchParams] = useState({
   searchKey: '',
   current:1,
   pageSize:10
})  //正确的写法

```

### （5）禁止使用!.非空断言

非空断言本身是不安全的，主观的判断存在误差，从防御性编程的角度，是不推荐使用非空断言的。

- 错误的用法

```
let x:string|undefined = undefined
x!.toString()

```

因为使用了非空断言，因此编译的时候不会报错，但是运行的时候会报错.

比较推荐使用的是 optional chaining。以?.的形式。

### （8）使用 typescript 的内置函数

typescript 的很多内置函数都可以复用一些定义。这里不会一一介绍，常见的有 Partial、Pick、Omit、Record、extends、infer 等等，如果需要在已有的类型上，衍生出新的类型，那么使用内置函数是简单和方便的。 此外还可以使用 联合类型、交叉类型和类型合并。

- 联合类型

```
//基本类型
let x:number|string
x= 1;
x = "1"

```

```
//多字面量类型
let type:'primary'|'danger'|'warning'|'error' =  'primary'

```

值得注意的是字面量的赋值。

```
let type:'primary'|'danger'|'warning'|'error' =  'primary'

let test = 'error'
type = test  //报错

let test = 'error' as const
type =  test //正确

```

- 交叉类型

```
interface ISpider{
   type:string
   swim:()=>void
}
interface IMan{
   name:string;
   age:number;
}
type ISpiderMan = ISpider & IMan
let bob:ISpiderMan  = {type:"11",swim:()=>{},name:"123",age:10}

```

### （9）封装条件语句以及 ts 的类型守卫

- 错误的写法

```
if (fsm.state === 'fetching' && isEmpty(listNode)) {
 // ...
}

```

- 正确的写法

```
function shouldShowSpinner(fsm, listNode) {
     return fsm.state === 'fetching' && isEmpty(listNode);
}

   if (shouldShowSpinner(fsmInstance, listNodeInstance)) {
     // ...
   }

```

在正确的写法中我们封装了条件判断的逻辑成一个独立函数。这种写法比较可读，我们从函数名就能知道做了一个什么判断。

此外封装条件语句也可以跟 ts 的自定义类型守卫挂钩。来看一个最简单的封装条件语句的自定义类型守卫。

```
function IsString (input: any): input is string {
    return typeof input === 'string';
}
function foo (input: string | number) {
     if (IsString(input)) {
        input.toString() //被判断为string
     } else {

     }
}

```

在项目中合理地使用自定义守卫，可以帮助我们减少很多不必要的类型断言，同时改善代码的可读性。

### （10）不要使用非变量

不管是变量名还是函数名，不要使用非命名，在业务中我就遇到过这个问题，后端定义了一个非命名形式的变量 isNotRefresh：

```
let isNotRefresh = false  //是否不刷新，否表示刷新

```

isNotRefresh 表示不刷新，这样定义的变量会导致跟这个变量相关的很多逻辑都是相反的。正确的形式应该是定义变量是 isRefresh 表示是否刷新。

```
let isRefresh = false  //是否刷新，是表示刷新

```
