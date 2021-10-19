## React 基础篇整理

- 虚拟DOM AND JSX
  - 降低UI上的操作难度
  - 前所未有的简洁和直观

- 用类似HTML标记的方式实现组件化
- 数据变UI变，不用关注实现细节
- 在UI和业务间建立绑定关系
- 解决的痛点：
  - 模版语言不够灵活
  - DOM API太繁琐
- 基本概念？
  - 组件、状态、JSX
- 开发思想？
  - 从State => View的函数式映射


###  JSX
- 语法糖 ：前所未有的简洁和直观
```javaScript
  React.createElement{
    "div",//类型
    null,//属性
    React.creteElement{//子组件
      "button",
      {
        onClick: function onClick(){
          return setCount(count + 1);
        }
      },
      React.createElement(CountLablel,{ Count: count })//子组件
    }
  }
```
### Hooks 
- 业务逻辑的复用
- 同一业务逻辑的高内聚
- 更容易理解和维护


### Hooks 示例

需求：点击按钮，获取用户列表并显示在页面上
分析：数据状态、Loading状态、请求出错的处理

```javaSCript

import React from "react";

export default function UserList() {
  // 使用三个 state 分别保存用户列表，loading 状态和错误状态
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // 定义获取用户的回调函数
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://reqres.in/api/users/");
      const json = await res.json();
      // 请求成功后将用户数据放入 state
      setUsers(json.data);
    } catch (err) {
      // 请求失败将错误状态放入 state
      setError(err);
    }
    setLoading(false);
  };

  return (
    <div className="user-list">
      <button onClick={fetchUsers} disabled={loading}>
        {loading ? "Loading..." : "Show Users"}
      </button>
      {error && 
        <div style={{ color: "red" }}>Failed: {String(error)}</div>
      }
      <br />
      <ul>
        {users.length > 0 &&
          users.map((user) => {
            return <li key={user.id}>{user.first_name}</li>;
          })
        })}
      </ul>
    </div>
  );
}
```

## useState
- 遵循的原则：state中永远不要保存可以通过计算的到的值

## useEffect
- 如果不指定依赖项，那么callback就会在每次函数组件执行完后执行；如果指定，那么只要依赖改变才会执行
- 空数组作为依赖项，只在首次执行时触发
- 没有依赖项，每次Render都会触发

注意：
1. React对比依赖为浅比较，不能将依赖设置为数组/对象。
2. hooks只能自函数组件的顶级作用域使用/只能在函数组件/其它hooks中使用
  

useEffect进行数据请求的例子
```js
function BlogView(id){
  const [blogContent,setBlogContent] = useState(null)
  
  useEffect(() => {
    const doAsync = async () => {
      setBlogContent(null)
      const res = await fetch(`/blog-content/${id}`) // 实际开发要加try catch
      setBlogContent(await res.data)
    }
    doAsync()
  }, [id])

  const isLoading = !blogContent //能通过计算获得的就不要设置成state
  return <div>{isLoading ? "loading..." : blogContent}</div>
}
```

## useCallBack

函数组件因状态的变化而重新渲染时，如果不是使用callback创建的函数也会每次跟随组件状态的改变而销毁重建，简言之就是-> 缓存优化效率。
接受这个回调函数作为属性的组件，也不会频繁地需要重新渲染。

## useMemo
与useCallBack不同在于useMemo缓存的是计算的结果，而useCallBack缓存的是函数。
使用useMemo避免重复计算。可以通过useMemo实现useCallBack。二者都是建立结果到数据依赖的关系。

## useRef
- 在组件的多次渲染之间共享数据值
- 看作是是在函数组件之外创建的一个共享空间
- 应用：比如计时器的开始和停止/保存某个Dom节点的引用w
- 使用useRef保存的数据一般与UI的渲染无关
示例
```js

function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    // current 属性指向了真实的 input 这个 DOM 节点，从而可以调用 focus 方法
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```

## useContext 定义全局状态
- 根组件可用
- 多个组件间共享数据状态
- 缺点：很难追踪数据状态的改变，组件复用性极差。
- context更多的是提供了一个强大的机制，定义全局响应式数据的能力。

##  自定义Hook
1. 把外部数据封装为一个可以绑定的数据源。
2. 抽取业务逻辑
3. 监听浏览器状态
4. 拆分复杂组件

以窗口大小的改变来展示不同组件为例。

自定义useWindowSize hook：
```javaScript
const getSize = () => {
  return window.innerWidth > 1080 ? 'large' : 'small'
}
const useWindowSize = () => {
  const [size, setSize] = useState(getSize())
  useEffect(() => {
    const handler = () => {
      setSize(getSize())
    }
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('resize', handler)
    }
  }, [])
}
```
在组件中使用
```javaScript
const Demo =  () => {
  const size = useWindowSize()  // 简洁
  if (size === 'small') {
    return <SmallComponent />
  } else {
    return <LargeComponent />
  }
}
```
- 封装通用逻辑: useAsync
  - 发异步请求获取数据展示在界面
    - 关注点：
    - 正确返回数据
    - loading态
    - 处理出错情况
```js

import { useState } from 'react';

const useAsync = (asyncFunction) => {
  // 设置三个异步逻辑相关的 state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // 定义一个 callback 用于执行异步逻辑
  const execute = useCallback(() => {
    // 请求开始时，设置 loading 为 true，清除已有数据和 error 状态
    setLoading(true);
    setData(null);
    setError(null);
    return asyncFunction()
      .then((response) => {
        // 请求成功时，将数据写进 state，设置 loading 为 false
        setData(response);
        setLoading(false);
      })
      .catch((error) => {
        // 请求失败时，设置 loading 为 false，并设置错误状态
        setError(error);
        setLoading(false);
      });
  }, [asyncFunction]);

  return { execute, loading, data, error };
};

//使用

import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Select, Table } from "antd";
import _ from "lodash";
import useAsync from "./useAsync";

const endpoint = "https://myserver.com/api/";
const useArticles = () => {
  // 使用上面创建的 useAsync 获取文章列表
  const { execute, data, loading, error } = useAsync(
    useCallback(async () => {
      const res = await fetch(`${endpoint}/posts`);
      return await res.json();
    }, []),
  );
  // 执行异步调用
  useEffect(() => execute(), [execute]);
  // 返回语义化的数据结构
  return {
    articles: data,
    articlesLoading: loading,
    articlesError: error,
  };
};
const useCategories = () => {
  // 使用上面创建的 useAsync 获取分类列表
  const { execute, data, loading, error } = useAsync(
    useCallback(async () => {
      const res = await fetch(`${endpoint}/categories`);
      return await res.json();
    }, []),
  );
  // 执行异步调用
  useEffect(() => execute(), [execute]);

  // 返回语义化的数据结构
  return {
    categories: data,
    categoriesLoading: loading,
    categoriesError: error,
  };
};
const useCombinedArticles = (articles, categories) => {
  // 将文章数据和分类数据组合到一起
  return useMemo(() => {
    // 如果没有文章或者分类数据则返回 null
    if (!articles || !categories) return null;
    return articles.map((article) => {
      return {
        ...article,
        category: categories.find(
          (c) => String(c.id) === String(article.categoryId),
        ),
      };
    });
  }, [articles, categories]);
};
const useFilteredArticles = (articles, selectedCategory) => {
  // 实现按照分类过滤
  return useMemo(() => {
    if (!articles) return null;
    if (!selectedCategory) return articles;
    return articles.filter((article) => {
      console.log("filter: ", article.categoryId, selectedCategory);
      return String(article?.category?.name) === String(selectedCategory);
    });
  }, [articles, selectedCategory]);
};

const columns = [
  { dataIndex: "title", title: "Title" },
  { dataIndex: ["category", "name"], title: "Category" },
];

export default function BlogList() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  // 获取文章列表
  const { articles, articlesError } = useArticles();
  // 获取分类列表
  const { categories, categoriesError } = useCategories();
  // 组合数据
  const combined = useCombinedArticles(articles, categories);
  // 实现过滤
  const result = useFilteredArticles(combined, selectedCategory);

  // 分类下拉框选项用于过滤
  const options = useMemo(() => {
    const arr = _.uniqBy(categories, (c) => c.name).map((c) => ({
      value: c.name,
      label: c.name,
    }));
    arr.unshift({ value: null, label: "All" });
    return arr;
  }, [categories]);

  // 如果出错，简单返回 Failed
  if (articlesError || categoriesError) return "Failed";

  // 如果没有结果，说明正在加载
  if (!result) return "Loading...";

  return (
    <div>
      <Select
        value={selectedCategory}
        onChange={(value) => setSelectedCategory(value)}
        options={options}
        style={{ width: "200px" }}
        placeholder="Select a category"
      />
      <Table dataSource={result} columns={columns} />
    </div>
  );
}

```



##  Redux
1. 跨组件状态共享
2. 同组件多个实例的状态共享
3. 三个基本概念：State、Reducer、Action
4. Redux中所有对于Store的修改都需要通过Reducer来完成
5. 核心机制：state + action => new state

### Redux 异步原理
- middleWare  中间件也可以理解成拦截器，Middleware 正是在 Action 真正到达 Reducer 之前提供的一个额外处理 Action 的机会。


## 应用篇目 最佳实践
｜ React 的开发其实就是复杂应用程序状态的管理和开发，所以要思考该怎么去用最优、最合理的方式，去管理你的应用程序的状态
- 保证状态最小化
  - 不把state当变量用，能通过state计算产生的就不要设置成state
- 唯一数据源，避免中间状态

##
- 在项目中可以把每一个Get请求都做成一个hook，数据请求和处理逻辑都放到hooks中，实现modal和view的隔离，这样不仅代码更加模块化，而且易于测试和维护。有了这样一个 Hook，React 的函数组件几乎不需要有任何业务的逻辑，而只是把数据映射到 JSX 并显示出来就可以了

```javaScript

import axios from "axios";

// 定义相关的 endpoint
const endPoints = {
  test: "https://60b2643d62ab150017ae21de.mockapi.io/",
  prod: "https://prod.myapi.io/",
  staging: "https://staging.myapi.io/"
};

// 创建 axios 的实例
const instance = axios.create({
  // 实际项目中根据当前环境设置 baseURL
  baseURL: endPoints.test,
  timeout: 30000,
  // 为所有请求设置通用的 header
  headers: { Authorization: "Bear mytoken" }
});

// 听过 axios 定义拦截器预处理所有请求
instance.interceptors.response.use(
  (res) => {
    // 可以假如请求成功的逻辑，比如 log
    return res;
  },
  (err) => {
    if (err.response.status === 403) {
      // 统一处理未授权请求，跳转到登录界面
      document.location = '/login';
    }
    return Promise.reject(err);
  }
);

export default instance;
```

```javaScript

import { useState, useEffect } from "react";
import apiClient from "./apiClient";

// 将获取文章的 API 封装成一个远程资源 Hook
const useArticle = (id) => {
  // 设置三个状态分别存储 data, error, loading
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    // 重新获取数据时重置三个状态
    if (!id) return;   //让hook在组件中无条件使用
    setLoading(true);
    setData(null);
    setError(null);
    apiClient
      .get(`/posts/${id}`)
      .then((res) => {
        // 请求成功时设置返回数据到状态
        setLoading(false);
        setData(res.data);
      })
      .catch((err) => {
        // 请求失败时设置错误状态
        setLoading(false);
        setError(err);
      });
  }, [id]); // 当 id 变化时重新获取数据

  // 将三个状态作为 Hook 的返回值
  return {
    loading,
    error,
    data
  };
};
```

- 表现层逻辑
```javaScript

import useArticle from "./useArticle";

const ArticleView = ({ id }) => {
  // 将 article 看成一个远程资源，有 data, loading, error 三个状态
  const { data, loading, error } = useArticle(id);
  if (error) return "Failed.";
  if (!data || loading) return "Loading...";
  return (
    <div className="exp-09-article-view">
      <h1>
        {id}. {data.title}
      </h1>
      <p>{data.content}</p>
    </div>
  );
};
import useArticle from "./useArticle";

const ArticleView = ({ id }) => {
  // 将 article 看成一个远程资源，有 data, loading, error 三个状态
  const { data, loading, error } = useArticle(id);
  if (error) return "Failed.";
  if (!data || loading) return "Loading...";
  return (
    <div className="exp-09-article-view">
      <h1>
        {id}. {data.title}
      </h1>
      <p>{data.content}</p>
    </div>
  );
};
```

- 函数组件设计模式 - 容器组件模式

```js

import { Modal } from "antd";
import useUser from "../09/useUser";

function UserInfoModal({ visible, userId, ...rest }) {
  // 当 visible 为 false 时，不渲染任何内容
  if (!visible) return null;
  // 这一行 Hook 在可能的 return 之后，会报错！
  const { data, loading, error } = useUser(userId);

  return (
    <Modal visible={visible} {...rest}>
      {/* 对话框的内容 */}
    </Modal>
  );
};
```
```js

// 定义一个容器组件用于封装真正的 UserInfoModal
export default function UserInfoModalWrapper({
  visible,
  ...rest, // 使用 rest 获取除了 visible 之外的属性
}) {
  // 如果对话框不显示，则不 render 任何内容
  if (!visible) return null; 
  // 否则真正执行对话框的组件逻辑
  return <UserInfoModal visible {...rest} />;
}
```

- 函数组件设计模式 - render props  

如果有UI展示的逻辑需要重用，必须借助于 render props的逻辑。  
示例：
```js

import { useState, useCallback } from "react";

function CounterRenderProps({ children }) {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => {
    setCount(count + 1);
  }, [count]);
  const decrement = useCallback(() => {
    setCount(count - 1);
  }, [count]);

  return children({ count, increment, decrement });
}
```
```js

function CounterRenderPropsExample() {
  return (
    <CounterRenderProps>
      {({ count, increment, decrement }) => {
        return (
          <div>
            <button onClick={decrement}>-</button>
            <span>{count}</span>
            <button onClick={increment}>+</button>
          </div>
        );
      }}
    </CounterRenderProps>
  );
}
```

## 事件处理
由于虚拟DOM的存在，在React中即使绑定一个事件到原生的DOM节点，事件也不会绑定在对应的节点上，而是所有的事件都是绑定在根节点。然后由React统一监听和管理，获取事件后再分发到具体的虚拟Dom节点上。（出于对页面可能躲在多版本的React的考虑）React通过事件的srcElement属性知道它是从哪个节点开始发出的。React屏蔽掉底层事件的细节，避免浏览器的兼容性问题。



## React项目结构篇
- 在做新的改动的时候要考虑到对已有的功能产生什么影响。
- 每增加一个新的功能，整个应用程序的复杂程度不应该明显提升。这样才能保证应用程序始终可扩展，可维护。
- 