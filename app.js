// 引入express框架
const express = require('express')
// 引入express-session 实现session功能
const session = require('express-session')
// 引入path
const path = require('path')
// 引入body-parser模块 用来处理post请求参数
const bodyParser = require('body-parser')
// 创建App服务器
const app = express()
// 用app拦截所有请求 secret配置项 值是自定义
app.use(session({
  secret: 'secret key',
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}))


// post解析
app.use(bodyParser.urlencoded({
  extended: false
}))
// 开放静态资源文件
app.use(express.static(path.join(__dirname, 'public')))

// 导入数据库
require('./model/connect')
// require('./model/user')
// 告诉express框架模板所在位置
app.set('views', path.join(__dirname, 'views'))
// 告诉express框架模板默认后缀
app.set('view engine', 'art')
// 当渲染art模板，所用的引擎是什么
app.engine('art', require('express-art-template'))

const home = require('./route/home')
const admin = require('./route/admin')

app.listen(80)

app.use('/admin', require('./middleware/loginGuard')) // 判断登录状态
app.use('/home', home) // 以home开口
app.use('/admin', admin) // 以admin开头
app.use((err, req, res, next) => { // 用next拦截错误重定向
  const result = JSON.parse(err)
  let paramArr = []
  for (let key in result) {
    if (key !== 'path') {
      paramArr.push(key + '=' + result[key])
    }
  }
  res.redirect(`${result.path}?${paramArr.join('&')}`)
})