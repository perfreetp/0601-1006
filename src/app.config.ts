export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/capture/index',
    'pages/library/index',
    'pages/messages/index',
    'pages/mine/index',
    'pages/subtitle/index',
    'pages/editor/index',
    'pages/detail/index',
    'pages/privacy/index',
    'pages/memory/index',
    'pages/family/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#E67E22',
    navigationBarTitleText: '家庭记忆',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFF8F0'
  },
  tabBar: {
    color: '#7F8C8D',
    selectedColor: '#E67E22',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '亲友圈'
      },
      {
        pagePath: 'pages/capture/index',
        text: '拍摄'
      },
      {
        pagePath: 'pages/library/index',
        text: '作品库'
      },
      {
       pagePath: 'pages/messages/index',
        text: '消息'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
