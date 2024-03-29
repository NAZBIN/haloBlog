## 1\. 前言

React Hooks 是 React 16.8 引入的新特性，允许我们在不使用 Class 的前提下使用 state 和其他特性。

React Hooks 要解决的问题是状态共享，是继 render-props 和 higher-order components 之后的第三种状态逻辑复用方案，避免了 JSX 嵌套地狱问题。

## 2\. 状态逻辑复用

一般来说，组件 = UI + 逻辑，长期以来我们都在考虑 UI 的复用，在逻辑这一层面却不容易很好的复用。

对用户而言，组件就像一个黑盒，应该拿来即用。但当组件的样式或者结构不满足需求的时候，我们只能去重新实现这个组件。

![](https://pic2.zhimg.com/80/v2-3257787efc9566f3981a9155b7b6d651_1440w.jpg)

在我们开发 React 应用的时候，经常会遇到类似下面这种场景，你可能会有两个疑问：

1.  Loading 是否可以复用？
2.  Loading 该怎么复用？

```
const Button = ({ isLoading }) => {
    return (
        <>
            { isLoading && <p>加载中...</p> }
            <button></button>
    )
}
const Table = ({ isLoading }) => {
    return (
        <>
            { isLoading && <p>加载中...</p> }
            <table></table>
    )
}
const List = ({ isLoading }) => {
    return (
        <>
            { isLoading && <p>加载中...</p> }
            <ul></ul>
    )
}

```

这几个例子都指向了同一个问题，那就是如何实现组件的逻辑复用？

### 2.1 Render Props

将函数作为 props 传给父组件，将父组件中的状态共享，然后作为参数传给函数，这就是  `render props`。

使用  `render prop`  的库有 React Router、Downshift 以及 Formik。\
以下面这个 Toggle 组件为例子，我们一般可以这样用：

```
function App() {
    return (
        <Toggle initial={false}>
            {({ on, toggle }) => (
                <>
                    <Button type="primary" onClick={toggle}> Open Modal </Button>
                    <Modal visible={on} onOk={toggle} onCancel={toggle}/>
                </>
            )}
        </Toggle>
    )
}

```

可以看到，控制 Modal 组件展示与否的状态被提升到了 Toggle 组件中，这个 Toggle 组件还可以拿来被多次复用到其他组件里面。

那么这个 Toggle 是怎么实现的呢？看到实现后你就会理解  `render props`  的原理。

```
class Toggle extends Component {
    constructor(props) {
        this.state = {
            on: props.initial
        }
    }
    toggle = () => {
        this.setState({
            on: !this.state.on
        })
    }
    render() {
        return this.props.children({
            on: this.state.on,
            toggle: this.toggle
        })
    }
}

```

关于  `render props`  的更多内容可以参考 React 中文网的相关章节：[Render Props](https://link.zhihu.com/?target=https%3A//zh-hans.reactjs.org/docs/render-props.html)

### 2.2 higher-order components

higher-order components 一般简称 HoC，中文翻译为高阶组件。从名字上就可以看出来，高阶组件肯定和高阶函数有什么千丝万缕的关系。

高阶组件的本质上就是一个高阶函数，它接收一个组件，返回一个新的组件。在这个新的组件中的状态共享，通过 props 传给原来的组件。

以刚刚那个 Toggle 组件为例子，高阶组件同样可以被多次复用，可以配合装饰器一起使用。

```
@Toggle(false)
class App extends Component {
    const { on, toggle } = this.props;
    return (
        <>
            <Button type="primary" onClick={toggle}> Open Modal </Button>
            <Modal visible={on} onOk={toggle} onCancel={toggle}/>
        </>
    )
}

```

高阶组件的实现和  `render props`  也不太一样，主要是一个高阶函数。

```
const Toggle = initial => WrappedComponent => {
    return class extends Component {
        constructor(props) {
            this.state = {
                on: props.initial
            }
        }
        toggle = () => {
            this.setState({
                on: !this.state.on
            })
        }
        render() {
            const newProps = {
                ...this.props,
                on: this.state.on,
                toggle: this.toggle
            }
            return <WrappedComponent ...newProps />
        }
    }
}

```

### 2.3 Render Props 和高阶组件的弊端

不管是 render props 还是高阶组件，他们要做的都是实现状态逻辑的复用，可这俩是完美的解决方案吗？

考虑一下，如果我们依赖了多个需要复用的状态逻辑的时候，该怎么写呢？以 render props 为例：

```
function MyForm() {
    return (
        <Fetcher>
            {data => (
                <Actions>
                    {actions => (
                        <Translations>
                            {translations => (
                                <Style>
                                    {styles => (
                                        // ...
                                    )}
                                </Style>
                            )}
                        </Translations>
                    )}
                </Actions>
            )}
        </Fetcher>
    )
}

```

看看这个代码，你有没有一种似曾相识的感觉？这一天，我们终于想起被"回调地狱"支配的恐惧。

不得不再次祭出这张图了。

![](https://pic1.zhimg.com/80/v2-4016193fe11ae6d91e66cd75f4474b74_1440w.jpg)\
同样地，高阶组件也会有这个问题，但由于装饰器的简洁性，没有 render props 看起来那么可怕。

除此之外，他们俩还有另一个问题，那就是组件嵌套过深之后，会给调试带来很大的麻烦。\
这个是 render props 中组件嵌套在 React 开发者工具中的表现。

![](https://pic4.zhimg.com/80/v2-a6a79244beea87a97fded89e7e1d92cf_1440w.jpg)

对于高阶组件来说，如果你没有对组件手动设置  `name/displayName`，就会遇到更严重的问题，那就是一个个匿名组件嵌套。好歹上面 render props 的嵌套我们还能知道组件名，是不？

![](https://pic2.zhimg.com/80/v2-c13d0f4033a822619cded427d8668b95_1440w.jpg)

社区里面也已经有很多解决 render props 嵌套的方案，其中 Epitath 提供了一种以 generator 的方法来解决嵌套问题，利用 generator 实现了伪同步代码。

```
const App = epitath(function*() {
  const { count } = yield <Counter />
  const { on } = yield <Toggle />

  return (
    <MyComponent counter={count} toggle={on} />
  )
})

<App />

```

更多细节可以参考黄子毅的这篇文章：

[精读《Epitath 源码 - renderProps 新用法》​segmentfault.com/a/1190000016682454![](https://pic4.zhimg.com/v2-3a02a50899ff741645675d8dc332ec9f_ipico.jpg)](https://link.zhihu.com/?target=https%3A//segmentfault.com/a/1190000016682454)

### 2.4 React Hooks

React Hooks 则可以完美解决上面的嵌套问题，它拥有下面这几个特性。

1.  多个状态不会产生嵌套，写法还是平铺的
2.  允许函数组件使用 state 和部分生命周期
3.  更容易将组件的 UI 与状态分离

```
function useWindowWidth(){
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = ()=>{
            setWidth(window.innerWidth);
        }
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [width]);

    return width;
}

```

上面是一个结合了 useState 和 useEffect 两个 hook 方法的例子，主要是在 resize 事件触发时获取到当前的  `window.innerWidth`。这个 useWindowWidth 方法可以拿来在多个地方使用。

常用的 Hook 方法如下：

![](https://pic4.zhimg.com/80/v2-c774e2aa322140cd48aef7438ab6b183_1440w.jpg)

## 3\. useState & useRef

useState 是 React Hooks 中很基本的一个 API，它的用法主要有这几种：

1.  useState 接收一个初始值，返回一个数组，数组里面分别是当前值和修改这个值的方法（类似 state 和 setState）。
2.  useState 接收一个函数，返回一个数组。
3.  setCount 可以接收新值，也可以接收一个返回新值的函数。

```
const [ count1, setCount1 ] = useState(0);
const [ count2, setCount2 ] = useState(() => 0);
setCount1(1); // 修改 state

```

### 3.1 和 class state 的区别

虽然函数组件也有了 state，但是 function state 和 class state 还是有一些差异：

1.  function state 的粒度更细，class state 过于无脑。
2.  function state 保存的是快照，class state 保存的是最新值。
3.  引用类型的情况下，class state 不需要传入新的引用，而 function state 必须保证是个新的引用。

### 3.2 快照（闭包） vs 最新值（引用）

在开始前，先抛出这么一个问题。在 1s 内频繁点击 10 次按钮，下面代码的执行表现是什么？

```
class App extends Component {
    state = {
        count: 0
    }
    increment = () => {
        setTimeout(() => {
            this.setState({
                count: this.state.count + 1
            })
        }, 1000)
    }
    render() {
        return <h1 onClick={this.increment}>{this.state.count}</h1>
    }
}

```

如果是这段代码呢？它又会是什么表现？

```
function App() {
    const [ count, setCount ] = useState(0)
    const increment = () => {
        setTimeout(() => {
            setCount(count + 1)
        }, 1000)
    }
    return <h1 onClick={increment}>{count}</h1>
}

```

如果你能成功答对，那么恭喜你，你已经掌握了 useState 的用法。\
在第一个例子中，连续点击十次，页面上的数字会从 0 增长到 10。而第二个例子中，连续点击十次，页面上的数字只会从 0 增长到 1。

这个是为什么呢？其实这主要是引用和闭包的区别。

class 组件里面可以通过 this.state 引用到 count，所以每次 setTimeout 的时候都能通过引用拿到上一次的最新 count，所以点击多少次最后就加了多少。

在 function component 里面每次更新都是重新执行当前函数，也就是说 setTimeout 里面读取到的 count 是通过闭包获取的，而这个 count 实际上只是初始值，并不是上次执行完成后的最新值，所以最后只加了 1 次。

### 3.3 快照和引用的转换

如果我想让函数组件也是从 0 加到 10，那么该怎么来解决呢？聪明的你一定会想到，如果模仿类组件里面的  `this.state`，我们用一个引用来保存 count 不就好了吗？

没错，这样是可以解决，只是这个引用该怎么写呢？我在 state 里面设置一个对象好不好？就像下面这样：

```
const [state, setState] = useState({ count: 0 })

```

答案是不行，因为即使 state 是个对象，但每次更新的时候，要传一个新的引用进去，这样的引用依然是没有意义。

```
setState({
    count: state.count + 1
})

```

### 3.4 useRef

想要解决这个问题，那就涉及到另一个新的 Hook 方法 ------ useRef。

useRef 是一个对象，它拥有一个 current 属性，并且不管函数组件执行多少次，而 useRef 返回的对象永远都是原来那一个。

```
function App() {
    const [ count, setCount ] = useState(0)
    const ref = useRef(0)
    const increment = () => {
        setTimeout(() => {
            setCount((ref.current += 1))
        }, 1000)
    }
    return <h1 onClick={increment}>{count}</h1>
}

```

useRef 有下面这几个特点：

1.  `useRef`  是一个只能用于函数组件的方法。
2.  `useRef`  是除字符串  `ref`、函数  `ref`、`createRef`  之外的第四种获取  `ref`  的方法。
3.  `useRef`  在渲染周期内永远不会变，因此可以用来引用某些数据。
4.  修改  `ref.current`  不会引发组件重新渲染。

useRef vs createRef：

1.  两者都是获取 ref 的方式，都有一个 current 属性。
2.  useRef 只能用于函数组件，createRef 可以用在类组件中。
3.  useRef 在每次重新渲染后都保持不变，而 createRef 每次都会发生变化。

### 3.5 写需求遇到的坑

![](https://pic1.zhimg.com/80/v2-c8b0b77129a9b53c444b3ded98de2c64_1440w.jpg)

之前在写需求的时候遇到过这样的一个坑。`bankId`  和  `ref`  都是从接口获取到的，这里很自然就想到在  `useCallback`  里面指定依赖。

![](https://pic3.zhimg.com/80/v2-12447e950fa33181f41caad2af03350a_1440w.jpg)

但是呢，这个  `handlerReappear`  方法需要在第一次进入页面的时候，向 JS Bridge 注册的事件，这就导致了一个问题，不管后来  `handlerReappear`  如何变化，`registerHandler`  里面依赖的  `callback`  都是第一次的，这也是闭包导致的问题。

当然，你可能会说，我在  `useEffect`  里面也指定了依赖不好吗？但要注意这是个注册事件，意味着每次我都要清除上一次的事件，需要调用到 JS Bridge，在性能上肯定不是个好办法。

最终，我选择使用  `useRef`  来保存  `bankId`  和  `ref`，这样就可以通过引用来获取到最新的值。

![](https://pic3.zhimg.com/80/v2-18789cc5a717d94744a3993977f4cd9a_1440w.jpg)

### 3.6 Vue3 Composition API

![](https://pic1.zhimg.com/80/v2-5a1636ebd9480b75d886afa6f1fc9a20_1440w.jpg)

在 vue3 里面提供了新的 Composition API，之前知乎有个问题是  [React Hooks 是否可以改为用类似 Vue 3 Composition API 的方式实现？](https://www.zhihu.com/question/378861485)

然后我写了一篇文章，利用  `Object.defineProperty`  简单实现了 Composition API，可以参考：[用 React Hooks 简单实现 Vue3 Composition API](https://zhuanlan.zhihu.com/p/122516099)

当然这个实现还有很多问题，也比较简单，可以参考工业聚写的完整实现：[react-use-setup](https://link.zhihu.com/?target=https%3A//github.com/Lucifier129/react-use-setup)

## 4\. useEffect

`useEffect`  是一个  `Effect Hook`，常用于一些副作用的操作，在一定程度上可以充当  `componentDidMount`、`componentDidUpdate`、`componentWillUnmount`  这三个生命周期。\
`useEffect`  是非常重要的一个方法，可以说是 React Hooks 的灵魂，它用法主要有这么几种：

1.  `useEffect`  接收两个参数，分别是要执行的回调函数、依赖数组。
2.  如果依赖数组为空数组，那么回调函数会在第一次渲染结束后（`componentDidMount`）执行，返回的函数会在组件卸载时（`componentWillUnmount`）执行。
3.  如果不传依赖数组，那么回调函数会在每一次渲染结束后（`componentDidMount`  和  `componentDidUpdate`）执行。
4.  如果依赖数组不为空数组，那么回调函数会在依赖值每次更新渲染结束后（`componentDidUpdate`）执行，这个依赖值一般是  `state`  或者  `props`。

```
function App() {
    useEffect(() => {
        // 第一次渲染结束执行
        const handleScroll = () => {}
        window.addEventListener("scoll", handleScroll);
        return () => {
            // 组件卸载之前执行
            window.removeEventListener("scoll", handleScroll);
        }
    }, []);

    useEffect(() => {
        console.log("每次渲染结束都会执行")
    })

    useEffect(() => {
        console.log("只有在 count 变化后才会执行")
    }, [count])
}

```

useEffect 比较重要，它主要有这几个作用：

1.  代替部分生命周期，如  `componentDidMount`、`componentDidUpdate`、`componentWillUnmount`。
2.  更加  `reactive`，类似 mobx 的  `reaction`  和 vue 的  `watch`。
3.  从命令式变成声明式，不需要再关注应该在哪一步做某些操作，只需要关注依赖数据。
4.  通过  `useEffect`  和  `useState`  可以编写一系列自定义的 Hook。

### 4.1 useEffect vs useLayoutEffect

`useLayoutEffect`  也是一个 Hook 方法，从名字上看和  `useEffect`  差不多，他俩用法也比较像。

在 90%的场景下我们都会用 useEffect，然而在某些场景下却不得不用  `useLayoutEffect`。\
`useEffect`  和  `useLayoutEffect`  的区别是：

1.  `useEffect`  不会 block 浏览器渲染，而  `useLayoutEffect`  会。
2.  `useEffect`  会在浏览器渲染结束后执行，`useLayoutEffect`  则是在 DOM 更新完成后，浏览器绘制之前执行。

这两句话该怎么来理解呢？我们以一个移动的方块为例子：

```
const moveTo = (dom, delay, options) => {
    dom.style.transform = `translate(${options.x}px)`
    dom.style.transition = `left ${delay}ms`
}
const Animate = () => {
    const ref = useRef();
    useEffect(() => {
        moveTo(ref.current, 500, { x: 600 })
    }, [])
    return (
        <div className="animate">
            <div ref={ref}>方块</div>
        </div>
    )
}

```

![](https://pic4.zhimg.com/v2-9ce7e78fc357dd81ab4b494c652a68a7_b.jpg)

在  `useEffect`  里面会让这个方块往后移动 600px 距离，可以看到这个方块在移动过程中会闪一下。

但如果换成了  `useLayoutEffect`  呢？会发现方块不会再闪动，而是直接出现在了 600px 的位置。

```
const Animate = () => {
    const ref = useRef();
    useLayoutEffect(() => {
        moveTo(ref.current, 500, { x: 600 })
    }, [])
    return (
        <div className="animate">
            <div ref={ref}>方块</div>
        </div>
    )
}

```

![](https://pic2.zhimg.com/v2-93cc761f3f289e48c21f05d18fb57931_b.jpg)

原因是  `useEffect`  是在浏览器绘制之后执行的，所以方块一开始就在最左边，于是我们看到了方块移动的动画。

然而  `useLayoutEffect`  是在绘制之前执行的，会阻塞页面的绘制，所以页面会在  `useLayoutEffect`  里面的代码执行结束后才去继续绘制，于是方块就直接出现在了右边。

![](https://pic1.zhimg.com/80/v2-3d868f86ae76c1abc420965983e44304_1440w.jpg)

那么这里的代码是怎么实现的呢？以 preact 为例，useEffect 在  `options.commit`  阶段执行，而 useLayoutEffect 在  `options.diffed`  阶段执行。

然而在实现 useEffect 的时候使用了  `requestAnimationFrame`，`requestAnimationFrame`  可以控制 useEffect 里面的函数在浏览器重绘结束，下次绘制之前执行。

## 5\. useMemo

useMemo 的用法类似 useEffect，常常用于缓存一些复杂计算的结果。useMemo 接收一个函数和依赖数组，当数组中依赖项变化的时候，这个函数就会执行，返回新的值。

```
const sum = useMemo(() => {
    // 一系列计算
}, [count])

```

举个例子会更加清楚 useMemo 的使用场景，我们就以之前我写的一个 DatePicker 组件的计算为例：

```
const render = useMemo(
    () => {
      const dateTable: Moment[] = [];
      const firstDayOfMonth = (defaultValue || moment()).clone(); // clone
      firstDayOfMonth.date(1); // 当月第一天
      const day = firstDayOfMonth.day(); // 这天是周几
      // 求出卡片展示的第一天（直接用算出本月第一天是周几进行计算）
      const lastMonthDiffDay = (day + 6) % 7;
      const lastMonth1 = firstDayOfMonth.clone();
      lastMonth1.add(0 - lastMonthDiffDay - 1, 'days'); // 求出当前卡片展示的第一天（因为周日展示在第一天，所以要多算一天）
      for (let i = 0; i < DATE.DATE_COL_COUNT * DATE.DATE_ROW_COUNT; i++) {
        current = lastMonth1.clone().add(i, 'days');
        dateTable.push(current);
      }
      return dateTable;
    },
    [defaultValue]
  );

```

DatePicker 组件每次打开或者切换月份的时候，都需要大量的计算来算出当前需要展示哪些日期。

然后再将计算后的结果渲染到单元格里面，这里可以使用 useMemo 来缓存，只有当传入的日期变化时才去计算。

## 6\. useCallback

和 useMemo 类似，只不过 useCallback 一般是用来缓存函数，两者甚至可以转换。

### 6.1 匿名函数导致不必要的渲染

在我们编写 React 组件的时候，经常会用到事件处理函数，很多人都会简单粗暴的传一个箭头函数。

```
class App extends Component {
    render() {
        return <h1 onClick={() => {}}></h1>
    }
}

```

这种箭头函数有个问题，那就是在每一次组件重新渲染的时候都会生成一个重复的匿名箭头函数，导致传给组件的参数发生了变化，会导致 PureComponent 失效。

在函数组件里面，同样会有这个传递新的匿名函数的问题。从下面这个例子来看，每次点击 div，就会引起 Counter 组件重新渲染。

这次更新明显和 Input 组件无关，但每次重新渲染之后，都会创建新的 onChange 方法。这样相当于传给 Input 的 onChange 参数变化，即使 Input 内部做过 shadowEqual 也没有意义了，都会跟着重新渲染。

原本只想更新 count 值的，可 Input 组件 却做了不必要的渲染。，

```
function App() {
    const [ count, setCount ] = useState(0)
    const [ inputValue, setInputValue ] = useState('')

    const onChange = (e) => {
        setInputValue(e.target.value);
    }
    const increment = () => {
        setCount(count + 1)
    }
    return (
        <>
            <Input value={inputValue} onChange={onChange} />
            <div onClick={increment}>{count}</div>
        </>
    )
}

```

这就是体现 useCallback 价值的地方了，我们可以用 useCallback 指定依赖项。在无关更新之后，通过 useCallback 取的还是上一次缓存起来的函数。

因此，useCallback 常常配合  `React.memo`  来一起使用，用于进行性能优化。

```
function App() {
    const [ count, setCount ] = useState(0)
    const [ inputValue, setInputValue ] = useState('')

    const onChange = useCallback((e) => {
        setInputValue(e.target.value);
    }, [])
    const increment = useCallback(() => {
        setCount(count + 1)
    }, [count])
    return (
        <>
            <Input value={inputValue} onChange={onChange} />
            <div onClick={increment}>{count}</div>
        </>
    )
}

```

## 7\. useReducer && useContext

### 7.1 useReducer

useReducer 和 useState 的用法很相似，甚至在 preact 中，两者实现都是一样的。

useReducer 接收一个 reducer 函数和初始 state，返回了 state 和 dispatch 函数，常常用于管理一些复杂的状态，适合 action 比较多的场景。

```
function Counter() {
    const [count, dispatch] = useReducer((state, action) => {
        switch(action.type) {
            case "increment":
                return state + 1;
            case "decrement":
                return state - 1;
            default:
                return state;
        }
    }, 0)
    return (
        <div>
            <h1>{count}</h1>
            <button onClick={() => dispatch({ type: "increment"})}>
                increment
            </button>
            <button onClick={() => dispatch({ type: "decrement"})}>
                decrement
            </button>
        </div>
    )
}

```

### 7.2 useContext

在上一节讲解 React16 新特性的时候，我们讲过新版 Context API 的用法。

新版 Context 常常有一个提供数据的生产者（Provider），和一个消费数据的消费者（Consumer），我们需要通过 Consumer 来以  `render props`  的形式获取到数据。

如果从祖先组件传来了多个 Provider，那最终就又陷入了  `render props`  嵌套地狱。

```
<Context1.Consumer>
    {context1 => (
        <Context2.Consumer>
            {context2 => (
                 <Context3.Consumer>
                    {context3 => (
                        <div></div>
                    )}
                </Context3.Consumer>
            )}
        </Context2.Consumer>
    )}
</Context1.Consumer>

```

useContext 允许我们以扁平化的形式获取到 Context 数据。即使有多个祖先组件使用多个 Context.Provider 传值，我们也可以扁平化获取到每一个 Context 数据。

```
const Context = createContext(null);

function App() {
    return (
        <Context.Provider value={{ title: "hello, world" }}
            <Child />
        </Context.Provider>
    )
}
function Child() {
    const context = useContext(Context);
    return <h1>{ context.title }</h1>
}

```

### 7.3 实现一个简单的 Redux

通过 useReducer 和 useContext，我们完全可以实现一个小型的 Redux。\
_reducer.js_

```
export const reducer = (state, action) => {
        switch(action.type) {
            case "increment":
                return state + 1;
            case "decrement":
                return state - 1;
            default:
                return state;
        }
    }
export const defaultState = 0;

```

_Context.js_

```
export const Context = createContext(null);

```

_App.js_

```
function App() {
    const [state, dispatch] = useReducer(reducer, defaultState)

    return (
        <Context.Provider value={{state, dispatch}}>
            <ChildOne />
            <ChildTwo />
        </Context.Provider>
    )
}
function ChildOne() {
    const { state, dispatch } = useContext(Context);
    return (
        <div>
            <h1>{state}</h1>
            <button onClick={() => dispatch({ type: "increment"})}>
                increment
            </button>
            <button onClick={() => dispatch({ type: "decrement"})}>
                decrement
            </button>
        </div>
    )
}

```

## 8\. Custom Hooks

对于 react 来说，在函数组件中使用 state 固然有一些价值，但最有价值的还是可以编写通用 custom hooks 的能力。

想像一下，一个单纯不依赖 UI 的业务逻辑 hook，我们开箱即用。不仅可以在不同的项目中复用，甚至还可以跨平台使用，react、react native、react vr 等等。

编写自定义 hook 也需要以 use 开头，这样保证可以配合  *eslint*-plugin-_react_-*hooks*  插件使用。

> 注意：_eslint_-plugin-_react_-_hooks 会帮你自动声明依赖，可能会造成一些严重的问题。_\
> 在 custom hooks 中也可以调用其他 hook，当前的 hook 也可以被其他 hook 或者组件调用。\
> 以官网上这个获取好友状态的自定义 Hook 为例：

```
import { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}

```

这个自定义 Hook 里面对好友的状态进行了监听，每次状态更新的时候都会去更新 isOnline，当组件卸载的时候会清除掉这个监听。

这就是 React Hooks 最有用的地方，它允许我们编写自定义 Hook，然后这个自定义 Hook 可以复用给多个组件，并且不会和 UI 耦合到一起。

## 9\. React Hooks 原理

由于 preact hooks 的代码和原有的逻辑耦合度很小，这里为了更加浅显易懂，我选用了 preact hooks 的源码来解读。

### 9.1 Hooks 执行流程

在 React 中，组件返回的 JSX 元素也会被转换为虚拟 DOM，就是下方的 vnode，每个 vnode 上面挂载了一个  `_component`  属性，这个属性指向了组件实例。

而在组件实例上面又挂载了一个  `_hooks`  属性，这个  `_hooks`  属性里面保存了我们执行一个组件的时候，里面所有 Hook 方法相关的信息。

![](https://pic3.zhimg.com/80/v2-376f2ac07aef4f66b5ee2048be302e92_1440w.jpg)

首先，我们有一个全局的  `currentIndex`  变量，当组件第一次渲染或者更新的时候，它会在每次进入一个函数组件的时候都重置为 0，每次遇到一个 Hook 方法就会增加 1，同时将这个 Hook 方法的信息放到  `_list`  里面。

当我们下次进来或者进入下一个组件的时候， `currentIndex`  又会被置为 0。

> 组件渲染 => currentIndex 重置 0 => 遇到 Hooks 方法，放进 \_list => currentIndex++ => 渲染结束\
> \
> 组件更新 => currentIndex 重置 0 => 遇到 Hooks 方法，获取 \_list[currentIndex]=> currentIndex++ => 重复上面步骤 => 更新结束

这个时候就会从刚才的  `_list`  里面根据  `currentIndex`  来取出对应项，所以我们每次进来执行  `useState`，它依然能拿到上一次更新后的值，因为这里是缓存了起来。

preact hooks 这里实现相当巧妙，在周会上大家讨论是否会内存泄的比较激烈。

![](https://pic1.zhimg.com/80/v2-acba362a00bc84f1f73f50d911a60658_1440w.jpg)

通过上面的分析，你就不难发现，为什么 hooks 方法不能放在条件语句里面了。

因为每次进入这个函数的时候，都是要和 currentIndex 一一匹配的，如果更新前后少了一个 Hook 方法，那么就完全对不上了，导致出现大问题。

### 9.2 useState 和 useReducer

这样你再来看下面 useState 和 useReducer 的源码就会更容易理解一些。

```
function useState(initialState) {
    return useReducer(invokeOrReturn, initialState);
}

export function useReducer(reducer, initialState, init) {
    const hookState = getHookState(currentIndex++);
    if (!hookState._component) {
        hookState._component = currentComponent;
        hookState._value = [
            !init ? invokeOrReturn(undefined, initialState) : init(initialState),

            action => {
                const nextValue = reducer(hookState._value[0], action);
                if (hookState._value[0] !== nextValue) {
                    hookState._value[0] = nextValue;
                    hookState._component.setState({});
                }
            }
        ];
    }

    return hookState._value;
}

```

很明显，`getHookState`  是根据 currentIndex 来从  `_list`  里面取和当前 Hook 相关的一些信息。

如果是初始化状态（即没有  `hookState._component`）这个属性的时候，就会去初始化 useState 的两个返回值，否则就会直接返回上一次缓存的结果。

### 9.3 useEffect

useEffect 和 useState 差不多，区别就在 useEffect 接收的函数会放到一个  `_pendingEffects`  里面，而非  `_list`  里面。

```
export function useEffect(callback, args) {
    const state = getHookState(currentIndex++);
    // 如果依赖项发生了变化，那就更新 callback 和 args
    if (argsChanged(state._args, args)) {
        state._value = callback;
        state._args = args;

        currentComponent.__hooks._pendingEffects.push(state);
    }
}

```

在 diff 结束之后会从  `_pendingEffects`  里面取出来函数一个个执行。

`afterPaint`  里面使用了  `requestAnimateFrame`  这个方法，所以传给 useEffect 里面的方法是在浏览器绘制结束之后才会执行的。

```
options.diffed = vnode => {
    if (oldAfterDiff) oldAfterDiff(vnode);

    const c = vnode._component;
    if (!c) return;

    const hooks = c.__hooks;
    if (hooks) {
        if (hooks._pendingEffects.length) {
            afterPaint(afterPaintEffects.push(c));
        }
    }
};

```

### 9.4 总结

最后，这里对 React Hooks 的整个运行流程来进行一下总结和梳理。

1.  每个组件实例上挂载一个 \_hooks 属性，保证了组件之间不会影响。
2.  每当遇到一个 hooks 方法，就将其 push 到  `currentComponent._hooks._list`  中，且 currentIndex 加一。
3.  每次渲染进入一个组件的时候，都会从将 currentIndex 重置为 0 。遇到 hooks 方法时，currentIndex 重复第二步。这样可以把 currentIndex 和  `currentComponent._hooks._list`  中的对应项匹配起来，直接取上次缓存的值。
4.  函数组件每次重新执行后，useState 中还能保持上一次的值，就是来自于步骤 3 中的缓存。
5.  由于依赖了 currentComponent 实例，所以 hooks 不能用于普通函数中。

## 10\. React Hooks 实践

得益于 react hooks 将业务逻辑从 ui 中抽离出来，目前社区里面关于 react hooks 的实践，大都是从功能点出发。

从最简单的 api 封装，例如 useDebounce、useThrottle、useImmerState 等等，再到业务层面功能封装，比较出名的库有 react-use、umijs/hooks 等等。
