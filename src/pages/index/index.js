const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyWeather: [],
    todayTemp: '',
    todayWeather: ''
  },
  onPullDownRefresh() {
    this.getWeather(() => {
      wx.stopPullDownRefresh()
    });
  },
  onLoad() {
    this.getWeather();
  },
  getWeather(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: '北京市'
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        let result = res.data.result;
        this.setNow(result);
        this.setForecast(result);
        this.setToday(result);
      },
      complete: () => {
        callback && callback();
      }
    })
  },
  setNow(result) {
    let weather = result.now.weather;
    let temp = result.now.temp;
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    });
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    });
  },
  setForecast(result) {
    let nowHour = new Date().getHours();
    let hourlyWeather = [];
    for (let i = 0; i < 8; i++) {
      let hourlyWeatherItem = {};
      hourlyWeatherItem.time = (i * 3 + nowHour) % 24 + '时';
      hourlyWeatherItem.iconPath = "/images/" + result.forecast[i].weather + "-icon.png";
      hourlyWeatherItem.temp = result.forecast[i].temp;
      hourlyWeather.push(hourlyWeatherItem);
    }
    this.setData({
      hourlyWeather: hourlyWeather
    });
  },
  setToday(result) {
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather() {
    console.log("toast");
    wx.showToast();
  }
})