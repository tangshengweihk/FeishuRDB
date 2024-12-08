const app = getApp();

Page({
  data: {
    scanResults: [], // 存储每次扫描的结果
    showStats: false, // 控制统计表格的显示
    statsData: [] // 存储统计数据
  },

  scanQRCode() {
    const that = this;
    tt.authorize({
      scope: 'scope.camera',
      success: () => {
        tt.scanCode({
          scanType: ['qrCode'],
          success(res) {
            try {
              let qrData;
              try {
                qrData = JSON.parse(res.result);
              } catch (e) {
                tt.showToast({
                  title: '无效的设备二维码',
                  icon: 'error'
                });
                return;
              }

              if (!qrData.device_name || !qrData.serial_number) {
                tt.showToast({
                  title: '二维码格式错误',
                  icon: 'error'
                });
                return;
              }

              const newScanResult = {
                id: Date.now(),
                device_name: qrData.device_name,
                serial_number: String(qrData.serial_number)
              };
              
              that.setData({
                scanResults: [...that.data.scanResults, newScanResult]
              });
            } catch (e) {
              console.error('处理二维码数据失败:', e);
              tt.showToast({
                title: '处理失败',
                icon: 'error'
              });
            }
          },
          fail(err) {
            console.error('扫描失败:', err);
            tt.showToast({
              title: '扫描失败',
              icon: 'error'
            });
          },
        });
      },
      fail: () => {
        tt.showToast({
          title: '请授权相机权限',
          icon: 'none'
        });
      }
    });
  },

  deleteItem(e) {
    const id = e.currentTarget.dataset.id;
    const newResults = this.data.scanResults.filter(item => item.id !== id);
    this.setData({
      scanResults: newResults
    });
  },

  showStatistics() {
    const stats = {};
    this.data.scanResults.forEach(item => {
      if (!stats[item.device_name]) {
        stats[item.device_name] = {
          device_name: item.device_name,
          serial_numbers: [],
          count: 0
        };
      }
      if (!stats[item.device_name].serial_numbers.includes(item.serial_number)) {
        stats[item.device_name].serial_numbers.push(item.serial_number);
        stats[item.device_name].count += 1;
      }
    });

    const processedStats = Object.values(stats).map(item => {
      const sortedSerialNumbers = item.serial_numbers.sort((a, b) => parseInt(a) - parseInt(b));
      return {
        device_name: item.device_name,
        serial_numbers: sortedSerialNumbers,
        count: item.count
      };
    });

    this.setData({
      showStats: true,
      statsData: processedStats
    });
  },

  hideStatistics() {
    this.setData({
      showStats: false
    });
  },

  onLoad() {
    this.setData({
      scanResults: [],
      showStats: false,
      statsData: []
    });
  },

  clearList() {
    this.setData({
      scanResults: [],
      showStats: false,
      statsData: []
    });
    tt.showToast({
      title: '已清空列表',
      icon: 'success'
    });
  }
});
