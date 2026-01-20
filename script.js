let data;  // Từ data.js

function loadData() {
  const year = document.getElementById('year').value;
  const month = document.getElementById('month').value;
  
  const userData = data.user[year][month];
  const btcData = data.btc[year][month];
  
  // Tính tổng tháng
  const userMonthlyTotal = userData.reduce((sum, day) => sum + day[1] + day[2], 0);
  const btcMonthlyTotal = btcData.reduce((sum, day) => sum + day[1] + day[2], 0);
  
  // Vẽ chart hàng ngày (bar chart)
  const ctxDaily = document.getElementById('dailyChart').getContext('2d');
  new Chart(ctxDaily, {
    type: 'bar',
    data: {
      labels: userData.map(day => `Ngày ${day[0]}`),
      datasets: [
        { label: 'User Chỉ số 1', data: userData.map(day => day[1]), backgroundColor: 'blue' },
        { label: 'User Chỉ số 2', data: userData.map(day => day[2]), backgroundColor: 'lightblue' },
        { label: 'BTC Chỉ số 1', data: btcData.map(day => day[1]), backgroundColor: 'red' },
        { label: 'BTC Chỉ số 2', data: btcData.map(day => day[2]), backgroundColor: 'pink' }
      ]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
  
  // Vẽ chart tổng tháng & pha (line chart cho xu hướng)
  const ctxMonthly = document.getElementById('monthlyChart').getContext('2d');
  new Chart(ctxMonthly, {
    type: 'line',
    data: {
      labels: Object.keys(data.user[year]),  // Các tháng
      datasets: [
        { label: 'User Tổng Tháng', data: Object.values(data.user[year]).map(m => m.reduce((s, d) => s + d[1] + d[2], 0)), borderColor: 'blue' },
        { label: 'BTC Tổng Tháng', data: Object.values(data.btc[year]).map(m => m.reduce((s, d) => s + d[1] + d[2], 0)), borderColor: 'red' }
      ]
    }
  });
  
  // Phân tích pha (dựa trên thay đổi tổng tháng trước-sau)
  let analysis = '';
  const months = Object.keys(data.user[year]);
  for (let i = 1; i < months.length; i++) {
    const userDelta = Object.values(data.user[year])[i].reduce((s, d) => s + d[1] + d[2], 0) - Object.values(data.user[year])[i-1].reduce((s, d) => s + d[1] + d[2], 0);
    const btcDelta = Object.values(data.btc[year])[i].reduce((s, d) => s + d[1] + d[2], 0) - Object.values(data.btc[year])[i-1].reduce((s, d) => s + d[1] + d[2], 0);
    if (userDelta * btcDelta > 0) analysis += `<p>Tháng ${months[i]}: Đồng pha (cả hai ${userDelta > 0 ? 'tăng' : 'giảm'}).</p>`;
    else if (userDelta * btcDelta < 0) analysis += `<p>Tháng ${months[i]}: Nghịch pha (User ${userDelta > 0 ? 'tăng' : 'giảm'}, BTC ${btcDelta > 0 ? 'tăng' : 'giảm'}).</p>`;
    else analysis += `<p>Tháng ${months[i]}: Không thay đổi rõ rệt.</p>`;
  }
  document.getElementById('analysis').innerHTML = analysis + `<p>Ghi chú từ Analysis: Chart nghịch pha có thể dự báo dump BTC nếu dốc xuống.</p>`;
}
