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

const UNPROMPTED = 0;
const UNAUTHORIZED = 1;
const AUTHORIZED = 2;

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyWeather: [],
    todayTemp: '',
    todayWeather: '',
    locationAuthType: UNPROMPTED
  },
  onPullDownRefresh() {
    this.getWeather(() => {
      wx.stopPullDownRefresh()
    });
  },
  onLoad() {
    wx.getSetting({
      // this.data will be initialized everytime onLoad() excute, so we need to get existing auth data to set this.data
      success: (res) => {
        let auth = res.authSetting['scope.userLocation'];
        let locationAuthType = auth ? AUTHORIZED 
          : (auth===false) ? UNAUTHORIZED : UNPROMPTED;
        this.setData({
          locationAuthType: locationAuthType
        });  
        if (auth) {
          // use existing city to get weather data
        }
      }
    });
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
    wx.navigateTo({
      url: '/pages/list/list?city='+'北京市'
    })
  },
  onTapLocation() {
    if (this.data.locationAuthType === UNAUTHORIZED) {
      wx.openSetting({
        success: (res) => {
          let auth = res.authSetting['scope.userLocation'];
          if (auth) {
            this.getLocation();      
          }
        }
      });
    } else {
      this.getLocation();
    }
  },
  getLocation() {
    wx.getLocation({
      success: res => {
        console.log(res.latitude, res.longitude);
        this.setData({
          locationAuthType: AUTHORIZED
        });
      },
      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED
        })
      }
    })
  }
})